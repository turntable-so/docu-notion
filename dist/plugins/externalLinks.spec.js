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
const log_1 = require("../log");
const pluginTestRun_1 = require("./pluginTestRun");
const externalLinks_1 = require("./externalLinks");
// If you paste a link in notion and then choose "Create bookmark", the markdown
// would normally be [bookmark](https://example.com)]. Instead of seeing "bookmark",
// we change to the url.
test("links turned into bookmarks", () => __awaiter(void 0, void 0, void 0, function* () {
    (0, log_1.setLogLevel)("debug");
    const results = yield getMarkdown({
        type: "bookmark",
        bookmark: { caption: [], url: "https://github.com" },
    });
    expect(results.trim()).toBe("[https://github.com](https://github.com)");
}));
test("external link inside callout", () => __awaiter(void 0, void 0, void 0, function* () {
    const results = yield getMarkdown({
        type: "callout",
        callout: {
            rich_text: [
                {
                    type: "text",
                    text: { content: "Callouts inline ", link: null },
                    annotations: {
                        bold: false,
                        italic: false,
                        strikethrough: false,
                        underline: false,
                        code: false,
                        color: "default",
                    },
                    plain_text: "Callouts inline ",
                    href: null,
                },
                {
                    type: "text",
                    text: {
                        content: "great page",
                        link: { url: `https://github.com` },
                    },
                    annotations: {
                        bold: false,
                        italic: false,
                        strikethrough: false,
                        underline: false,
                        code: false,
                        color: "default",
                    },
                    plain_text: "great page",
                    href: `https://github.com`,
                },
                {
                    type: "text",
                    text: { content: ".", link: null },
                    annotations: {
                        bold: false,
                        italic: false,
                        strikethrough: false,
                        underline: false,
                        code: false,
                        color: "default",
                    },
                    plain_text: ".",
                    href: null,
                },
            ],
            icon: { type: "emoji", emoji: "⚠️" },
            color: "gray_background",
        },
    });
    expect(results.trim()).toBe("> ⚠️ Callouts inline [great page](https://github.com).");
}));
test("inline links to external site", () => __awaiter(void 0, void 0, void 0, function* () {
    const results = yield getMarkdown({
        type: "paragraph",
        paragraph: {
            rich_text: [
                {
                    type: "text",
                    text: { content: "Inline ", link: null },
                    annotations: {
                        bold: false,
                        italic: false,
                        strikethrough: false,
                        underline: false,
                        code: false,
                        color: "default",
                    },
                    plain_text: "Inline ",
                    href: null,
                },
                {
                    type: "text",
                    text: {
                        content: "github",
                        link: { url: "https://github.com" },
                    },
                    annotations: {
                        bold: false,
                        italic: false,
                        strikethrough: false,
                        underline: false,
                        code: false,
                        color: "default",
                    },
                    plain_text: "github",
                    href: "https://github.com",
                },
            ],
            color: "default",
        },
    });
    expect(results.trim()).toBe("Inline [github](https://github.com)");
}));
function getMarkdown(block) {
    return __awaiter(this, void 0, void 0, function* () {
        const config = {
            plugins: [externalLinks_1.standardExternalLinkConversion],
        };
        return yield (0, pluginTestRun_1.oneBlockToMarkdown)(config, block);
    });
}
