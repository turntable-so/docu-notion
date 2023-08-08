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
exports.standardCalloutTransformer = void 0;
// In Notion, you can make a callout and change its emoji. We map 5 of these
// to the 5 Docusaurus admonition styles.
// This is mostly a copy of the callout code from notion-to-md. The change is to output docusaurus
// admonitions instead of emulating a callout with markdown > syntax.
// Note: I haven't yet tested this with any emoji except "💡"/"tip", nor the case where the
// callout has-children. Not even sure what that would mean, since the document I was testing
// with has quite complex markup inside the callout, but still takes the no-children branch.
function notionCalloutToAdmonition(notionToMarkdown, getBlockChildren, block) {
    return __awaiter(this, void 0, void 0, function* () {
        // In this case typescript is not able to index the types properly, hence ignoring the error
        // @ts-ignore
        const blockContent = block.callout.text || block.callout.rich_text || [];
        // @ts-ignore
        const icon = block.callout.icon;
        let parsedData = "";
        blockContent.map((content) => {
            const annotations = content.annotations;
            let plain_text = content.plain_text;
            plain_text = notionToMarkdown.annotatePlainText(plain_text, annotations);
            if (content["href"])
                plain_text = `[${plain_text}](${content["href"]})`;
            parsedData += plain_text;
        });
        let callout_string = "";
        const { id, has_children } = block;
        if (!has_children) {
            const result1 = callout(parsedData, icon);
            return result1;
        }
        const callout_children_object = yield getBlockChildren(id);
        // // parse children blocks to md object
        const callout_children = yield notionToMarkdown.blocksToMarkdown(callout_children_object);
        callout_string += `${parsedData}\n`;
        callout_children.map(child => {
            callout_string += `${child.parent}\n\n`;
        });
        const result = callout(callout_string.trim(), icon);
        return result;
    });
}
const calloutsToAdmonitions = {
    /* prettier-ignore */ "ℹ️": "note",
    "📝": "note",
    "💡": "tip",
    "❗": "info",
    "⚠️": "caution",
    "🔥": "danger",
};
// This is the main change from the notion-to-md code.
function callout(text, icon) {
    var _a;
    let emoji;
    if ((icon === null || icon === void 0 ? void 0 : icon.type) === "emoji") {
        emoji = icon.emoji;
    }
    let docusaurusAdmonition = "note";
    if (emoji) {
        // the keyof typeof magic persuades typescript that it really is OK to use emoji as a key into calloutsToAdmonitions
        docusaurusAdmonition =
            (_a = calloutsToAdmonitions[emoji]) !== null && _a !== void 0 ? _a : 
            // For Notion callouts with other emojis, pass them through using hte emoji as the name.
            // For this to work on a Docusaurus site, it will need to define that time on the remark-admonitions options in the docusaurus.config.js.
            // See https://github.com/elviswolcott/remark-admonitions and https://docusaurus.io/docs/using-plugins#using-presets.
            emoji;
    }
    return `:::${docusaurusAdmonition}\n\n${text}\n\n:::\n\n`;
}
exports.standardCalloutTransformer = {
    name: "standardCalloutTransformer",
    notionToMarkdownTransforms: [
        {
            type: "callout",
            getStringFromBlock: (context, block) => notionCalloutToAdmonition(context.notionToMarkdown, context.getBlockChildren, block),
        },
    ],
};
