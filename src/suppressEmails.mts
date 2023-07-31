import { ErrorResponse } from '../types/KlaviyoErrorReponse';
import fetch from 'node-fetch';
import { headers } from '../constants.mjs';



// SUPPRESS 100 EMAILS
export default async function suppressEmails(emailArray: string[]) {
  const url: URL = new URL(
    'https://a.klaviyo.com/api/profile-suppression-bulk-create-jobs/'
  );

        const formattedEmails = emailArray.map((email) => ({
    type: 'profile',
    attributes: { email },
  }));

  const payload = JSON.stringify({
    data: {
      type: 'profile-suppression-bulk-create-job',
      attributes: {
        profiles: {
          data: formattedEmails,
        },
      },
    },
  })

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: payload,
    });
    if(response.status === 202) return 202
    const jsonRes: null | ErrorResponse = await response.json().catch(() => null) ?? null;
    if (jsonRes?.errors) throw new Error(JSON.stringify(jsonRes?.errors,null, 3));
    return;
  } catch (error) {
    throw new Error(`There was an error suppressing emails: ${error}`);
  }
}
