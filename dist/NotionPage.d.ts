import { GetPageResponse } from "@notionhq/client/build/src/api-endpoints";
import { ListBlockChildrenResponseResults } from "notion-to-md/build/types";
export declare enum PageType {
    DatabasePage = 0,
    Simple = 1
}
export declare class NotionPage {
    metadata: GetPageResponse;
    pageId: string;
    order: number;
    layoutContext: string;
    foundDirectlyInOutline: boolean;
    constructor(args: {
        layoutContext: string;
        pageId: string;
        order: number;
        metadata: GetPageResponse;
        foundDirectlyInOutline: boolean;
    });
    matchesLinkId(id: string): boolean;
    get type(): PageType;
    get nameOrTitle(): string;
    nameForFile(): string;
    private get title();
    private get name();
    private explicitSlug;
    get slug(): string;
    get hasExplicitSlug(): boolean;
    get keywords(): string | undefined;
    get authors(): string | undefined;
    get status(): string | undefined;
    get date(): string | undefined;
    getPlainTextProperty(property: string, defaultIfEmpty: string): string;
    getSelectProperty(property: string): string | undefined;
    getDateProperty(property: string, defaultIfEmpty: string, start?: boolean): string;
    getContentInfo(children: ListBlockChildrenResponseResults): Promise<{
        childPageIdsAndOrder: {
            id: string;
            order: number;
        }[];
        linksPageIdsAndOrder: {
            id: string;
            order: number;
        }[];
        hasParagraphs: boolean;
    }>;
}
