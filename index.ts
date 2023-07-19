const dotenv = require("dotenv");
const nodeFetch = require("node-fetch");
const { setTimeout } = require("timers/promises");

dotenv.config();

const apiKey = process.env.KLAVIYO_API_KEY;
const segmentToSuppress = process.env.KLAVIYO_SEGMENT_ID;

const headers = {
  accept: "application/json",
  revision: "2023-06-15",
  Authorization: `Klaviyo-API-Key ${apiKey}`,
  "content-type": "application/json",
};

// FETCH 100 EMAILS FROM KLAVIYO SEGMENT
async function fetchEmails(segmentId: string, nextPage?: URL | null) {
  const url = `https://a.klaviyo.com/api/segments/${segmentId}/profiles/?fields[profile]=email&page[size]=100`;
  const response = await nodeFetch(nextPage || url, {
    headers,
  });
  const data = await response.json();
  if (data?.errors) throw new Error(JSON.stringify(data?.errors));
  const emails = data?.data?.map((member: any) => member?.attributes?.email);
  const nextPageUrl = data.links?.next ? new URL(data.links.next) : null;
  return { emails, nextPageUrl };
}

// SUPPRESS 100 EMAILS
async function suppressEmails(emailArray: string[]) {
  const url = "https://a.klaviyo.com/api/profile-suppression-bulk-create-jobs/";

  const formattedEmails = emailArray.map((email) => ({
    type: "profile",
    attributes: { email },
  }));

  try {
    const response = await nodeFetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        data: {
          type: "profile-suppression-bulk-create-job",
          attributes: {
            profiles: {
              data: formattedEmails,
            },
          },
        },
      }),
    });
    if (response?.errors) throw new Error(JSON.stringify(response?.errors));
    return;
  } catch (error) {
    throw new Error(`There was an error suppressing emails: ${error}`);
  }
}

const maxRetry = 10;
let currentRetry = 0;
let nextUrl: URL | null = null;
let page = 1;

const run = async (url?: string) => {
  while (nextUrl || currentRetry < maxRetry) {
    try {
      const { emails, nextPageUrl } = await fetchEmails(
        segmentToSuppress!,
        nextUrl
      );

      if (!emails) {
        console.log(`No new emails to suppress. ${new Date().toISOString()}`);
        return;
      }

      // Suppress
      await suppressEmails(emails);
      console.log(
        `Suppressed page ${page}, profiles suppressed: ${page * 100}`
      );
      page++;
      nextUrl = nextPageUrl;
      currentRetry = 0;
    } catch (error) {
      console.error(
        `Error ${error}, maybe try regenerating segment. ${new Date().toISOString()}`
      );
      await setTimeout(10000);
      currentRetry++;
    }
  }
};

run();
export {};
