"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const embedTweaks_1 = require("../plugins/embedTweaks");
const images_1 = require("../images");
const internalLinks_1 = require("../plugins/internalLinks");
const CalloutTransformer_1 = require("../plugins/CalloutTransformer");
const ColumnListTransformer_1 = require("../plugins/ColumnListTransformer");
const ColumnTransformer_1 = require("../plugins/ColumnTransformer");
const EscapeHtmlBlockModifier_1 = require("../plugins/EscapeHtmlBlockModifier");
const HeadingTransformer_1 = require("../plugins/HeadingTransformer");
const NumberedListTransformer_1 = require("../plugins/NumberedListTransformer");
const TableTransformer_1 = require("../plugins/TableTransformer");
const externalLinks_1 = require("../plugins/externalLinks");
const defaultConfig = {
    plugins: [
        // Notion "Block" JSON modifiers
        EscapeHtmlBlockModifier_1.standardEscapeHtmlBlockModifier,
        HeadingTransformer_1.standardHeadingTransformer,
        // Notion to Markdown transformers. Most things get transformed correctly by the notion-to-markdown library,
        // but some things need special handling.
        ColumnTransformer_1.standardColumnTransformer,
        ColumnListTransformer_1.standardColumnListTransformer,
        images_1.standardImageTransformer,
        CalloutTransformer_1.standardCalloutTransformer,
        TableTransformer_1.standardTableTransformer,
        NumberedListTransformer_1.standardNumberedListTransformer,
        // Link modifiers, which are special because they can read metadata from all the pages in order to figure out the correct url
        internalLinks_1.standardInternalLinkConversion,
        externalLinks_1.standardExternalLinkConversion,
        // Regexps plus javascript `import`s that operate on the Markdown output
        embedTweaks_1.imgurGifEmbed,
        embedTweaks_1.gifEmbed,
        embedTweaks_1.youtubeEmbed,
        embedTweaks_1.vimeoEmbed,
        embedTweaks_1.notionEmbed,
    ],
};
exports.default = defaultConfig;
