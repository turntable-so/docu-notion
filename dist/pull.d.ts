import { Client } from "@notionhq/client";
export type DocuNotionOptions = {
    notionToken: string;
    rootPage: string;
    locales: string[];
    markdownOutputPath: string;
    imgOutputPath: string;
    imgPrefixInMarkdown: string;
    statusTag: string;
};
export declare function notionPull(options: DocuNotionOptions): Promise<void>;
export declare function executeWithRateLimitAndRetries<T>(label: string, asyncFunction: () => Promise<T>): Promise<T>;
export declare function initNotionClient(notionToken: string): Client;
