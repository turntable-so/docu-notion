"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.standardNumberedListTransformer = void 0;
// This is mostly what notion-to-markdown would normally do with a block of type
// numbered_list_item. A patch is documented at the end.
function numberedListTransformer(notionToMarkdown, block) {
    var _a, _b, _c;
    //console.log("got numbered list block " + JSON.stringify(block));
    // In this case typescript is not able to index the types properly, hence ignoring the error
    // @ts-ignore
    const blockContent = 
    // @ts-ignore
    ((_a = block.numbered_list_item) === null || _a === void 0 ? void 0 : _a.text) || ((_b = block.numbered_list_item) === null || _b === void 0 ? void 0 : _b.rich_text) || [];
    let parsedData = "";
    blockContent.map((content) => {
        const annotations = content.annotations;
        let plain_text = content.plain_text;
        plain_text = notionToMarkdown.annotatePlainText(plain_text, annotations);
        if (content["href"]) {
            plain_text = `[${plain_text}](${content["href"]})`;
        }
        parsedData += plain_text;
    });
    // There is code in notion-to-md which attempts to set an incrementing number
    // on each of these. Somehow it fails; in my testing, block.numbered_list_item never
    // has a field 'number'. But we don't actually need incrementing numbers;
    // markdown will do the numbering if we just make something that looks like
    // a member of a numbered list by starting with number followed by period and space.
    // I'm keeping the original code in case notion-to-md gets fixed and there is actually
    // some reason to use incrementing numbers (it would at least make the markdown more
    // human-readable); but this at least works.
    // A problem is that in notion, a numbered list may continue after some intermediate
    // content. To achieve this in markdown, we'd need to indent the intermediate content
    // by a tab. Not only is it difficult to do this, but there appears to be no way to
    // know whether we should. The data we get from notion doesn't include the item number,
    // and its parent is the page rather than a particular list. So there is no way I can
    // see to distinguish a list continuation from a new list. The code here will leave
    // it up to markdown to decide whether to start a new list; I believe it will do so
    // if it sees any intervening lines that are not list items.
    let num = (_c = block.numbered_list_item) === null || _c === void 0 ? void 0 : _c.number;
    //console.log("got number " + num?.toString());
    if (!num) {
        num = 1;
    }
    return Promise.resolve(`${num}. ${parsedData.trim()}`);
}
exports.standardNumberedListTransformer = {
    name: "standardNumberedListTransformer",
    notionToMarkdownTransforms: [
        {
            type: "numbered_list_item",
            getStringFromBlock: (context, block) => numberedListTransformer(context.notionToMarkdown, block),
        },
    ],
};
