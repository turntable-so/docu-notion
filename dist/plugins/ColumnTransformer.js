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
exports.standardColumnTransformer = void 0;
const notion_client_1 = require("notion-client");
const pull_1 = require("../pull");
exports.standardColumnTransformer = {
    name: "standardColumnTransformer",
    notionToMarkdownTransforms: [
        {
            type: "column",
            getStringFromBlock: (context, block) => notionColumnToMarkdown(context.notionToMarkdown, context.getBlockChildren, block),
        },
    ],
};
// This runs when notion-to-md encounters a column block
function notionColumnToMarkdown(notionToMarkdown, getBlockChildren, block) {
    return __awaiter(this, void 0, void 0, function* () {
        //console.log(JSON.stringify(block));
        const { id, has_children } = block; // "any" because the notion api type system is complex with a union that don't know how to help TS to cope with
        if (!has_children)
            return "";
        const children = yield getBlockChildren(id);
        const childrenPromises = children.map((column) => __awaiter(this, void 0, void 0, function* () { return yield notionToMarkdown.blockToMarkdown(column); }));
        const childrenStrings = yield Promise.all(childrenPromises);
        const columnWidth = yield getColumnWidth(block);
        // note: it would look better in the markup with \n, but that
        // causes notion-to-md to give us ":::A" instead of \n for some reason.
        return (`<div class='notion-column' style={{width: '${columnWidth}'}}>\n\n${childrenStrings.join("\n\n")}\n\n</div>` +
            // Spacer between columns. CSS takes care of hiding this for the last column
            // and when the screen is too narrow for multiple columns.
            `<div className='notion-spacer' />`);
    });
}
// The official API doesn't give us access to the format information, including column_ratio.
// So we use 'notion-client' which uses the unofficial API.
// Once the official API gives us access to the format information, we can remove this
// and the 'notion-client' dependency.
// This logic was mostly taken from react-notion-x (sister project of notion-client).
function getColumnWidth(block) {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function* () {
        const unofficialNotionClient = new notion_client_1.NotionAPI();
        const blockId = block.id;
        const recordMap = yield (0, pull_1.executeWithRateLimitAndRetries)(`unofficialNotionClient.getPage(${blockId}) in getColumnWidth()`, () => {
            // Yes, it is odd to call 'getPage' for a block, but that's how we access the format info.
            return unofficialNotionClient.getPage(blockId);
        });
        const blockResult = recordMap.block[blockId];
        // ENHANCE: could we use https://github.com/NotionX/react-notion-x/tree/master/packages/notion-types
        // to get away from "any", which might be particularly helpful in the future
        // since this is using the unofficial (reverse engineered?) API.
        const columnFormat = (_a = blockResult === null || blockResult === void 0 ? void 0 : blockResult.value) === null || _a === void 0 ? void 0 : _a.format;
        const columnRatio = (columnFormat === null || columnFormat === void 0 ? void 0 : columnFormat.column_ratio) || 0.5;
        const parentBlock = (_c = recordMap.block[(_b = blockResult === null || blockResult === void 0 ? void 0 : blockResult.value) === null || _b === void 0 ? void 0 : _b.parent_id]) === null || _c === void 0 ? void 0 : _c.value;
        // I'm not sure why we wouldn't get a parent, but the react-notion-x has
        // this fallback to a guess based on the columnRatio.
        const columnCount = ((_d = parentBlock === null || parentBlock === void 0 ? void 0 : parentBlock.content) === null || _d === void 0 ? void 0 : _d.length) || Math.max(2, Math.ceil(1.0 / columnRatio));
        const spacerWidth = `min(32px, 4vw)`; // This matches the value in css for 'notion-spacer'.
        return `calc((100% - (${spacerWidth} * ${columnCount - 1})) * ${columnRatio})`;
    });
}
