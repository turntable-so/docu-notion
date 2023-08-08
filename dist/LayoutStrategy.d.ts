import { NotionPage } from "./NotionPage";
export declare abstract class LayoutStrategy {
    protected rootDirectory: string;
    protected existingPagesNotSeenYetInPull: string[];
    setRootDirectoryForMarkdown(markdownOutputPath: string): void;
    cleanupOldFiles(): Promise<void>;
    abstract newLevel(rootDir: string, order: number, context: string, levelLabel: string): string;
    abstract getPathForPage(page: NotionPage, extensionWithDot: string): string;
    getLinkPathForPage(page: NotionPage): string;
    pageWasSeen(page: NotionPage): void;
    protected getListOfExistingFiles(dir: string): string[];
}
