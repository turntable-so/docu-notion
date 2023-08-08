"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.standardExternalLinkConversion = void 0;
const log_1 = require("../log");
exports.standardExternalLinkConversion = {
    name: "standard external link conversion",
    linkModifier: {
        match: /\[.*\]\(http.*\)/,
        convert: (context, markdownLink) => {
            const linkRegExp = /\[([^\]]+)?\]\((http.*)\)/;
            const match = linkRegExp.exec(markdownLink);
            if (match === null) {
                (0, log_1.error)(`[standardExternalLinkConversion] Could not parse link ${markdownLink}`);
                return markdownLink;
            }
            const label = match[1];
            const url = match[2];
            if (label === "bookmark") {
                const replacement = `[${url}](${url})`;
                (0, log_1.warning)(`[standardExternalLinkConversion] Found Notion "Bookmark" link. In Notion this would show as an embed. The best docu-notion can do at the moment is replace "Bookmark" with the actual URL: ${replacement}`);
                return replacement;
            }
            return `[${label}](${url})`;
        },
    },
};
