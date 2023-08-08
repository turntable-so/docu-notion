import { LayoutStrategy } from "./LayoutStrategy";
import { NotionPage } from "./NotionPage";
export declare class HierarchicalNamedLayoutStrategy extends LayoutStrategy {
    newLevel(dirRoot: string, order: number, context: string, levelLabel: string): string;
    getPathForPage(page: NotionPage, extensionWithDot: string): string;
    private addCategoryMetadata;
}
