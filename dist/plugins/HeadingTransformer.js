"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.standardHeadingTransformer = void 0;
const log_1 = require("../log");
// Makes links to headings work in docusaurus
// https://github.com/sillsdev/docu-notion/issues/20
function headingTransformer(notionToMarkdown, block) {
    return __awaiter(this, void 0, void 0, function* () {
        // First, remove the prefix we added to the heading type
        block.type = block.type.replace("DN_", "");
        const markdown = yield notionToMarkdown.blockToMarkdown(block);
        (0, log_1.logDebug)("headingTransformer, markdown of a heading before adding id", markdown);
        // To make heading links work in docusaurus, we append an id. E.g.
        //  ### Hello World {#my-explicit-id}
        // See https://docusaurus.io/docs/markdown-features/toc#heading-ids.
        // For some reason, inline links come in without the dashes, so we have to strip
        // dashes here to match them.
        //console.log("block.id", block.id)
        const blockIdWithoutDashes = block.id.replaceAll("-", "");
        // Finally, append the block id so that it can be the target of a link.
        return `${markdown} {#${blockIdWithoutDashes}}`;
    });
}
exports.standardHeadingTransformer = {
    name: "standardHeadingTransformer",
    // AP wrote: We have to do this because if
    // we simply set a custom transformer to heading_n, it will keep
    // recursively calling this code, with blockToMarkdown using the custom transformer
    // over and over. Instead, we want blockToMarkdown to give us the normal
    // result, to which we will append the block ID to enable heading links.
    notionBlockModifications: [
        {
            modify: (block) => {
                // "as any" needed because we're putting a value in that is not allowed by the real type
                block.type = block.type.replace("heading", "DN_heading");
            },
        },
    ],
    // then when it comes time to do markdown conversions, we'll get called for each of these
    notionToMarkdownTransforms: [
        {
            type: "DN_heading_1",
            getStringFromBlock: (context, block) => headingTransformer(context.notionToMarkdown, block),
        },
        {
            type: "DN_heading_2",
            getStringFromBlock: (context, block) => headingTransformer(context.notionToMarkdown, block),
        },
        {
            type: "DN_heading_3",
            getStringFromBlock: (context, block) => headingTransformer(context.notionToMarkdown, block),
        },
    ],
};
