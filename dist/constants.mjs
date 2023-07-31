import { config } from 'dotenv';
config();
export const apiKey = process.env.KLAVIYO_API_KEY;
export const segmentToSuppress = process.env.KLAVIYO_SEGMENT_ID;
export const maxRetrys = 10;
export const headers = {
    accept: 'application/json',
    revision: '2023-07-15',
    Authorization: `Klaviyo-API-Key ${apiKey}`,
    'content-type': 'application/json',
};
