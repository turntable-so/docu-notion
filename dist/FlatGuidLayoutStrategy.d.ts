import { LayoutStrategy } from "./LayoutStrategy";
import { NotionPage } from "./NotionPage";
export declare class FlatGuidLayoutStrategy extends LayoutStrategy {
    newLevel(rootDir: string, order: number, context: string, _levelLabel: string): string;
    getPathForPage(page: NotionPage, extensionWithDot: string): string;
}
