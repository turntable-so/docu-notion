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
exports.standardColumnListTransformer = void 0;
function notionColumnListToMarkdown(notionToMarkdown, getBlockChildren, block) {
    return __awaiter(this, void 0, void 0, function* () {
        // Enhance: The @notionhq/client, which uses the official API, cannot yet get at column formatting information (column_ratio)
        // However https://github1s.com/NotionX/react-notion-x/blob/master/packages/react-notion-x/src/block.tsx#L528 can get it.
        const { id, has_children } = block; // "any" because the notion api type system is complex with a union that don't know how to help TS to cope with
        if (!has_children)
            return "";
        const column_list_children = yield getBlockChildren(id);
        const column_list_promise = column_list_children.map((column) => __awaiter(this, void 0, void 0, function* () { return yield notionToMarkdown.blockToMarkdown(column); }));
        const columns = yield Promise.all(column_list_promise);
        return `<div class='notion-row'>\n${columns.join("\n\n")}\n</div>`;
    });
}
exports.standardColumnListTransformer = {
    name: "standardColumnListTransformer",
    notionToMarkdownTransforms: [
        {
            type: "column_list",
            getStringFromBlock: (context, block) => notionColumnListToMarkdown(context.notionToMarkdown, context.getBlockChildren, block),
        },
    ],
};
