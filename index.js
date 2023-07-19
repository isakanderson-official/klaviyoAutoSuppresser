"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
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
function fetchEmails(segmentId, nextPage) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const url = `https://a.klaviyo.com/api/segments/${segmentId}/profiles/?fields[profile]=email&page[size]=100`;
        const response = yield nodeFetch(nextPage || url, {
            headers,
        });
        const data = yield response.json();
        if (data === null || data === void 0 ? void 0 : data.errors)
            throw new Error(JSON.stringify(data === null || data === void 0 ? void 0 : data.errors));
        const emails = (_a = data === null || data === void 0 ? void 0 : data.data) === null || _a === void 0 ? void 0 : _a.map((member) => { var _a; return (_a = member === null || member === void 0 ? void 0 : member.attributes) === null || _a === void 0 ? void 0 : _a.email; });
        const nextPageUrl = ((_b = data.links) === null || _b === void 0 ? void 0 : _b.next) ? new URL(data.links.next) : null;
        return { emails, nextPageUrl };
    });
}
// SUPPRESS 100 EMAILS
function suppressEmails(emailArray) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = "https://a.klaviyo.com/api/profile-suppression-bulk-create-jobs/";
        const formattedEmails = emailArray.map((email) => ({
            type: "profile",
            attributes: { email },
        }));
        try {
            const response = yield nodeFetch(url, {
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
            if (response === null || response === void 0 ? void 0 : response.errors)
                throw new Error(JSON.stringify(response === null || response === void 0 ? void 0 : response.errors));
            return;
        }
        catch (error) {
            throw new Error(`There was an error suppressing emails: ${error}`);
        }
    });
}
const maxRetry = 10;
let currentRetry = 0;
let nextUrl = null;
let page = 1;
const run = (url) => __awaiter(void 0, void 0, void 0, function* () {
    while (nextUrl || currentRetry < maxRetry) {
        try {
            const { emails, nextPageUrl } = yield fetchEmails(segmentToSuppress, nextUrl);
            if (!emails) {
                console.log(`No new emails to suppress. ${new Date().toISOString()}`);
                return;
            }
            // Suppress
            yield suppressEmails(emails);
            console.log(`Suppressed page ${page}, profiles suppressed: ${page * 100}`);
            page++;
            nextUrl = nextPageUrl;
            currentRetry = 0;
        }
        catch (error) {
            console.error(`Error ${error}, maybe try regenerating segment. ${new Date().toISOString()}`);
            yield setTimeout(10000);
            currentRetry++;
        }
    }
});
run();
