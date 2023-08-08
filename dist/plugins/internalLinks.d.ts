import { IDocuNotionContext, IPlugin } from "./pluginTypes";
export declare function convertInternalUrl(context: IDocuNotionContext, url: string): string | undefined;
export declare function parseLinkId(fullLinkId: string): {
    baseLinkId: string;
    fragmentId: string;
};
export declare const standardInternalLinkConversion: IPlugin;
