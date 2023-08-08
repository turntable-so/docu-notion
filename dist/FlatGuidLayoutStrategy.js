"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlatGuidLayoutStrategy = void 0;
const LayoutStrategy_1 = require("./LayoutStrategy");
// This strategy creates a flat list of files that have notion-id for file names.
// Pros: the urls will never change so long as the notion pages are not delete and re-recreated.
// Cons: the names are human readable, so:
//    * troubleshooting is more difficult
//    * is less "future" proof, in the sense that if you someday take these files and move them
//    * to a new system, maybe you will wish the files had names.
// TODO: for this to be viable, we'd also have to emit info on how to build the sidebar, because
// the directory/file structure itself is no longer representative of the outline we want.
class FlatGuidLayoutStrategy extends LayoutStrategy_1.LayoutStrategy {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    newLevel(rootDir, order, context, _levelLabel) {
        // In this strategy, we ignore context and don't create any directories to match the levels.
        // Just return the following for the benefit of logging.
        return context + "/" + _levelLabel;
    }
    getPathForPage(page, extensionWithDot) {
        // In this strategy, we don't care about the location or the title
        return this.rootDirectory + "/" + page.pageId + extensionWithDot;
    }
}
exports.FlatGuidLayoutStrategy = FlatGuidLayoutStrategy;
