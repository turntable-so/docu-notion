import { NotionToMarkdown } from "notion-to-md";
import { IGetBlockChildrenFn, IPlugin } from "./pluginTypes";
import { NotionBlock } from "../types";
export declare function tableTransformer(notionToMarkdown: NotionToMarkdown, getBlockChildren: IGetBlockChildrenFn, block: NotionBlock): Promise<string>;
export declare const standardTableTransformer: IPlugin;
