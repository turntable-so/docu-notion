"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.standardEscapeHtmlBlockModifier = void 0;
exports.standardEscapeHtmlBlockModifier = {
    name: "standardEscapeHtmlBlockModifier",
    notionBlockModifications: [
        {
            modify: (block) => {
                escapeHtml(block);
            },
        },
    ],
};
function escapeHtml(block) {
    var _a, _b;
    //console.log("escapeHtml called with\n", JSON.stringify(block, null, 2));
    const blockContent = block[block.type]; // e.g. block["paragraph"] gives an array of the strings that make up the paragraph
    if ((_a = blockContent.rich_text) === null || _a === void 0 ? void 0 : _a.length) {
        for (let i = 0; i < blockContent.rich_text.length; i++) {
            const rt = blockContent.rich_text[i];
            // See https://github.com/sillsdev/docu-notion/issues/21.
            // For now, we just do a simple replace of < an > with &lt; and &gt;
            // but only if the text will not be displayed as code.
            // If it will be displayed as code,
            // a) nothing will be trying to parse it, so it is safe.
            // b) at no point does anything interpret the escaped character **back** to html;
            //    so it will be displayed as "&lt;" or "&gt;".
            // We may have to add more complex logic here in the future if we
            // want to start letting html through which we **do** want to parse.
            // For example, we could assume that text in a valid html structure should be parsed.
            if ((rt === null || rt === void 0 ? void 0 : rt.plain_text) &&
                block.type !== "code" &&
                rt.type !== "code" &&
                !((_b = rt.annotations) === null || _b === void 0 ? void 0 : _b.code)) {
                rt.plain_text = rt.plain_text
                    .replaceAll("<", "&lt;")
                    .replaceAll(">", "&gt;");
            }
        }
    }
}
