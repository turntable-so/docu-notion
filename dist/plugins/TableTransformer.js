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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.standardTableTransformer = exports.tableTransformer = void 0;
const markdown_table_1 = __importDefault(require("markdown-table"));
// This is mostly a copy of the table handler from notion-to-md. The change is to handle newlines in the
// notion cell content.
function tableTransformer(notionToMarkdown, getBlockChildren, block) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id, has_children } = block;
        const tableArr = [];
        if (has_children) {
            const tableRows = yield getBlockChildren(id);
            // console.log(">>", tableRows);
            const rowsPromise = tableRows === null || tableRows === void 0 ? void 0 : tableRows.map((row) => __awaiter(this, void 0, void 0, function* () {
                const { type } = row;
                const cells = row[type]["cells"];
                /**
                 * this is more like a hack since matching the type text was
                 * difficult. So converting each cell to paragraph type to
                 * reuse the blockToMarkdown function
                 */
                const cellStringPromise = cells.map((cell) => __awaiter(this, void 0, void 0, function* () {
                    return yield notionToMarkdown.blockToMarkdown({
                        type: "paragraph",
                        paragraph: { rich_text: cell },
                    });
                }));
                const cellStringArrRaw = yield Promise.all(cellStringPromise);
                // This is our patch to the original notion-to-md code.
                const cellStringArr = cellStringArrRaw.map(c => c
                    // Trailing newlines are almost certainly not wanted, and converting to br's gives weird results
                    .replace(/[\r\n]+$/, "")
                    // Preserving line breaks within cells can't be done in stock markdown. Since we're producing
                    // mdx, which supports embedded HTML, we can handle it with <br/>.
                    // I'm not sure exactly what line breaks might occur in the input, depending on platform,
                    // so handle all the common cases.
                    .replaceAll("\r\n", "<br/>")
                    .replaceAll("\n", "<br/>")
                    .replaceAll("\r", "<br/>"));
                // console.log("~~", cellStringArr);
                tableArr.push(cellStringArr);
                // console.log(tableArr);
            }));
            yield Promise.all(rowsPromise || []);
        }
        return (0, markdown_table_1.default)(tableArr);
    });
}
exports.tableTransformer = tableTransformer;
exports.standardTableTransformer = {
    name: "standardTableTransformer",
    notionToMarkdownTransforms: [
        {
            type: "table",
            getStringFromBlock: (context, block) => tableTransformer(context.notionToMarkdown, context.getBlockChildren, block),
        },
    ],
};
