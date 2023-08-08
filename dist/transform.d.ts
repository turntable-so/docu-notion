import { IDocuNotionContext } from "./plugins/pluginTypes";
import { NotionPage } from "./NotionPage";
import { IDocuNotionConfig } from "./config/configuration";
import { NotionBlock } from "./types";
export declare function getMarkdownForPage(config: IDocuNotionConfig, context: IDocuNotionContext, page: NotionPage): Promise<string>;
export declare function getMarkdownFromNotionBlocks(context: IDocuNotionContext, config: IDocuNotionConfig, blocks: Array<NotionBlock>): Promise<string>;
