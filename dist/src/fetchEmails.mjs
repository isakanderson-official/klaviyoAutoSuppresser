import { headers } from '../constants.mjs';
// FETCH 100 EMAILS FROM KLAVIYO SEGMENT
export default async function fetchEmails(segmentId, nextPage) {
    const url = new URL(`https://a.klaviyo.com/api/segments/${segmentId}/profiles/?fields[profile]=email&page[size]=100`);
    const response = await fetch(nextPage || url, {
        headers,
    });
    const data = await response.json();
    if (data?.errors)
        throw new Error(JSON.stringify(data?.errors));
    const emails = data?.data?.map((member) => member?.attributes?.email);
    const validEmails = emails.filter((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
    const nextPageUrl = data.links?.next ? new URL(data.links.next) : null;
    return { emails: validEmails, nextPageUrl };
}
