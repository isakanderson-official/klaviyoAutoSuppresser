import { setTimeout } from 'timers/promises';
import fetchEmails from './fetchEmails.mjs';
import suppressEmails from './suppressEmails.mjs';
import { maxRetrys, segmentToSuppress } from '../constants.mjs';

let currentRetry = 0;
let nextUrl: URL | null = null;
let page = 1;

const run = async () => {
  while (nextUrl || currentRetry < maxRetrys) {
    try {
      const { emails, nextPageUrl } = await fetchEmails(
        segmentToSuppress!,
        nextUrl
      );

      if (!emails.length) {
        console.log(`No new emails to suppress. ${new Date().toISOString()}`);
        break;
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
  console.log('Done ✅')
};
run();
