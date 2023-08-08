import { NotionPage } from "../NotionPage";
import { IDocuNotionConfig } from "../config/configuration";
import { NotionBlock } from "../types";
export declare function blocksToMarkdown(config: IDocuNotionConfig, blocks: NotionBlock[], pages?: NotionPage[]): Promise<string>;
export declare function makeSamplePageObject(options: {
    slug?: string;
    name?: string;
    id?: string;
}): NotionPage;
export declare function oneBlockToMarkdown(config: IDocuNotionConfig, block: object, targetPage?: NotionPage): Promise<string>;
