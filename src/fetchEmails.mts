import { headers } from '../constants.mjs';
import { KlaviyoMemberObject } from '../types/KlaviyoMemberObject';
// FETCH 100 EMAILS FROM KLAVIYO SEGMENT
export default async function fetchEmails(segmentId: string, nextPage?: URL | null) {
  const url: URL = new URL(
    `https://a.klaviyo.com/api/segments/${segmentId}/profiles/?fields[profile]=email&page[size]=100`
  );
  const response = await fetch(nextPage || url, {
    headers,
  });
  const data = await response.json();
  if (data?.errors) throw new Error(JSON.stringify(data?.errors));

  const emails: string[] = data?.data?.map((member: KlaviyoMemberObject) => member?.attributes?.email);

  const validEmails: string[] = emails.filter((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));

  const nextPageUrl = data.links?.next ? new URL(data.links.next) : null;

  return { emails: validEmails, nextPageUrl };
}
