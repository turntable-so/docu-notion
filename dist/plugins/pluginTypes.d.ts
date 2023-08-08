import { ListBlockChildrenResponseResult } from "notion-to-md/build/types";
import { NotionPage } from "../NotionPage";
import { NotionToMarkdown } from "notion-to-md";
import { DocuNotionOptions } from "../pull";
import { LayoutStrategy } from "../LayoutStrategy";
import { ICounts, NotionBlock } from "../index";
type linkConversionFunction = (context: IDocuNotionContext, markdownLink: string) => string;
export type IPlugin = {
    name: string;
    notionBlockModifications?: {
        modify: (block: NotionBlock) => void;
    }[];
    notionToMarkdownTransforms?: {
        type: string;
        getStringFromBlock: (context: IDocuNotionContext, block: NotionBlock) => string | Promise<string>;
    }[];
    linkModifier?: {
        match: RegExp;
        convert: linkConversionFunction;
    };
    regexMarkdownModifications?: IRegexMarkdownModification[];
    init?(plugin: IPlugin): Promise<void>;
};
export type IRegexMarkdownModification = {
    regex: RegExp;
    replacementPattern?: string;
    getReplacement?(context: IDocuNotionContext, match: RegExpExecArray): Promise<string>;
    includeCodeBlocks?: boolean;
    imports?: string[];
};
export type ICustomNotionToMarkdownConversion = (block: ListBlockChildrenResponseResult, context: IDocuNotionContext) => () => Promise<string>;
export type IGetBlockChildrenFn = (id: string) => Promise<NotionBlock[]>;
export type IDocuNotionContext = {
    layoutStrategy: LayoutStrategy;
    options: DocuNotionOptions;
    getBlockChildren: IGetBlockChildrenFn;
    notionToMarkdown: NotionToMarkdown;
    directoryContainingMarkdown: string;
    relativeFilePathToFolderContainingPage: string;
    convertNotionLinkToLocalDocusaurusLink: (url: string) => string | undefined;
    pages: NotionPage[];
    counts: ICounts;
};
export {};
