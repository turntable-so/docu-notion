/// <reference types="node" />
import { FileTypeResult } from "file-type";
import { ListBlockChildrenResponseResult } from "notion-to-md/build/types";
import { IPlugin } from "./plugins/pluginTypes";
export type ImageSet = {
    primaryUrl: string;
    caption?: string;
    localizedUrls: Array<{
        iso632Code: string;
        url: string;
    }>;
    pathToParentDocument?: string;
    relativePathToParentDocument?: string;
    primaryBuffer?: Buffer;
    fileType?: FileTypeResult;
    primaryFileOutputPath?: string;
    outputFileName?: string;
    filePathToUseInMarkdown?: string;
};
export declare function initImageHandling(prefix: string, outputPath: string, incomingLocales: string[]): Promise<void>;
export declare const standardImageTransformer: IPlugin;
export declare function markdownToMDImageTransformer(block: ListBlockChildrenResponseResult, fullPathToDirectoryContainingMarkdown: string, relativePathToThisPage: string): Promise<string>;
export declare function parseImageBlock(image: any): ImageSet;
export declare function cleanupOldImages(): Promise<void>;
