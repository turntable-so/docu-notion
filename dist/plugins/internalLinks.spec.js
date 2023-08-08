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
const CalloutTransformer_1 = require("./CalloutTransformer");
const externalLinks_1 = require("./externalLinks");
const internalLinks_1 = require("./internalLinks");
const NumberedListTransformer_1 = require("./NumberedListTransformer");
test("urls that show up as raw text get left that way", () => __awaiter(void 0, void 0, void 0, function* () {
    const results = yield getMarkdown({
        type: "paragraph",
        paragraph: {
            rich_text: [
                {
                    type: "text",
                    text: { content: "https://github.com", link: null },
                    annotations: {
                        bold: false,
                        italic: false,
                        strikethrough: false,
                        underline: false,
                        code: false,
                        color: "default",
                    },
                    plain_text: "https://github.com",
                    href: null,
                },
            ],
        },
    });
    expect(results.trim()).toBe("https://github.com");
}));
test("link to an existing page on this site that has no slug", () => __awaiter(void 0, void 0, void 0, function* () {
    const targetPageId = "123";
    const targetPage = (0, pluginTestRun_1.makeSamplePageObject)({
        slug: undefined,
        name: "Hello World",
        id: targetPageId,
    });
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
                        content: "great page",
                        link: { url: `/${targetPageId}` },
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
                    href: `/${targetPageId}`,
                },
                {
                    type: "text",
                    text: { content: " the end.", link: null },
                    annotations: {
                        bold: false,
                        italic: false,
                        strikethrough: false,
                        underline: false,
                        code: false,
                        color: "default",
                    },
                    plain_text: " the end.",
                    href: null,
                },
            ],
            color: "default",
        },
    }, targetPage);
    expect(results.trim()).toBe(`Inline [great page](/${targetPageId}) the end.`);
}));
test("link to a heading block on a page", () => __awaiter(void 0, void 0, void 0, function* () {
    const targetPageId = "123";
    const blocks = {
        type: "paragraph",
        paragraph: {
            rich_text: [
                {
                    type: "text",
                    text: { content: "(Inline ", link: null },
                    annotations: {
                        bold: false,
                        italic: false,
                        strikethrough: false,
                        underline: false,
                        code: false,
                        color: "default",
                    },
                    plain_text: "(Inline ",
                    href: null,
                },
                {
                    type: "text",
                    text: {
                        content: "heading on some page",
                        link: { url: `/${targetPageId}#456` },
                    },
                    annotations: {
                        bold: false,
                        italic: false,
                        strikethrough: false,
                        underline: false,
                        code: false,
                        color: "default",
                    },
                    plain_text: "heading on some page",
                    href: `/${targetPageId}#456`,
                },
                {
                    type: "text",
                    text: { content: " the end.)", link: null },
                    annotations: {
                        bold: false,
                        italic: false,
                        strikethrough: false,
                        underline: false,
                        code: false,
                        color: "default",
                    },
                    plain_text: " the end.)",
                    href: null,
                },
            ],
            color: "default",
        },
    };
    (0, log_1.setLogLevel)("verbose");
    const noSlugTargetPage = (0, pluginTestRun_1.makeSamplePageObject)({
        slug: undefined,
        name: "Hello World",
        id: targetPageId,
    });
    const noSlugResults = yield getMarkdown(blocks, noSlugTargetPage);
    // the ending parentheses messed up a regex at one point.
    expect(noSlugResults.trim()).toBe(`(Inline [heading on some page](/${targetPageId}#456) the end.)`);
    const slugTargetPage = (0, pluginTestRun_1.makeSamplePageObject)({
        slug: "hello-world",
        name: "Hello World",
        id: targetPageId,
    });
    const slugResults = yield getMarkdown(blocks, slugTargetPage);
    expect(slugResults.trim()).toBe(`(Inline [heading on some page](/hello-world#456) the end.)`);
}));
// Text that has been selected and turned into a link to one of our pages
test("inline link to an existing page on this site uses slug", () => __awaiter(void 0, void 0, void 0, function* () {
    const targetPageId = "123";
    const targetPage = (0, pluginTestRun_1.makeSamplePageObject)({
        slug: "hello-world",
        name: "Hello World",
        id: targetPageId,
    });
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
                        content: "It’s good",
                        link: { url: `/${targetPageId}` },
                    },
                    annotations: {
                        bold: false,
                        italic: false,
                        strikethrough: false,
                        underline: false,
                        code: false,
                        color: "default",
                    },
                    plain_text: "It’s good",
                    href: `/${targetPageId}`,
                },
            ],
            color: "default",
        },
    }, targetPage);
    expect(results.trim()).toBe("Inline [It’s good](/hello-world)");
}));
// this is the kind of link you get if you just insert a "link to page" to Notion
test("raw link to an existing page on this site that has a slug", () => __awaiter(void 0, void 0, void 0, function* () {
    const targetPageId = "123";
    const targetPage = (0, pluginTestRun_1.makeSamplePageObject)({
        slug: "point-to-me",
        name: "Point to Me",
        id: targetPageId,
    });
    const results = yield getMarkdown({
        object: "block",
        id: "2051d790-e527-4b4e-b145-ec0beee2addf",
        parent: {
            type: "page_id",
            page_id: "333",
        },
        created_time: "2023-06-14T20:09:00.000Z",
        last_edited_time: "2023-06-14T20:09:00.000Z",
        has_children: false,
        archived: false,
        type: "link_to_page",
        link_to_page: {
            type: "page_id",
            page_id: targetPageId,
        },
    }, targetPage);
    expect(results.trim()).toBe("[Point to Me](/point-to-me)");
}));
test("link in a bulleted list", () => __awaiter(void 0, void 0, void 0, function* () {
    const targetPageId = "123";
    const targetPage = (0, pluginTestRun_1.makeSamplePageObject)({
        slug: "the-page",
        name: "Something",
        id: targetPageId,
    });
    const results = yield getMarkdown({
        type: "bulleted_list_item",
        bulleted_list_item: {
            rich_text: [
                {
                    type: "text",
                    text: {
                        content: "item",
                        link: { url: "/123" },
                    },
                    annotations: {
                        bold: false,
                        italic: false,
                        strikethrough: false,
                        underline: false,
                        code: false,
                        color: "default",
                    },
                    plain_text: "item",
                    href: "/123",
                },
            ],
            color: "default",
        },
    }, targetPage);
    expect(results.trim()).toBe("- [item](/the-page)");
}));
test("link to an a heading on a page on this site uses slug", () => __awaiter(void 0, void 0, void 0, function* () {
    const targetPageId = "123";
    const headingBlockId = "456";
    const targetPage = (0, pluginTestRun_1.makeSamplePageObject)({
        slug: "hello-world",
        name: "Hello World",
        id: targetPageId,
    });
    const results = yield getMarkdown({
        type: "paragraph",
        paragraph: {
            rich_text: [
                {
                    type: "text",
                    text: {
                        content: "see this heading",
                        link: { url: `/${targetPageId}#${headingBlockId}` },
                    },
                    annotations: {
                        bold: false,
                        italic: false,
                        strikethrough: false,
                        underline: false,
                        code: false,
                        color: "default",
                    },
                    plain_text: "see this heading",
                    href: `/${targetPageId}#${headingBlockId}`,
                },
            ],
            color: "default",
        },
    }, targetPage);
    expect(results.trim()).toBe(`[see this heading](/hello-world#${headingBlockId})`);
}));
test("does not interfere with mailto links", () => __awaiter(void 0, void 0, void 0, function* () {
    const results = yield getMarkdown({
        type: "paragraph",
        paragraph: {
            rich_text: [
                {
                    type: "text",
                    text: {
                        content: "mailme",
                        link: { url: `mailto:foo@example.com` },
                    },
                    annotations: {
                        bold: false,
                        italic: false,
                        strikethrough: false,
                        underline: false,
                        code: false,
                        color: "default",
                    },
                    plain_text: "mailme",
                    href: `mailto:foo@example.com`,
                },
            ],
            color: "default",
        },
    });
    expect(results.trim()).toBe(`[mailme](mailto:foo@example.com)`);
}));
test("does not interfere with https links", () => __awaiter(void 0, void 0, void 0, function* () {
    const results = yield getMarkdown({
        type: "paragraph",
        paragraph: {
            rich_text: [
                {
                    type: "text",
                    text: {
                        content: "google",
                        link: { url: `https://www.google.com` },
                    },
                    annotations: {
                        bold: false,
                        italic: false,
                        strikethrough: false,
                        underline: false,
                        code: false,
                        color: "default",
                    },
                    plain_text: "google",
                    href: `https://www.google.com`,
                },
            ],
            color: "default",
        },
    });
    expect(results.trim()).toBe(`[google](https://www.google.com)`);
}));
test("links to other notion pages that are not in this site give PROBLEM LINK", () => __awaiter(void 0, void 0, void 0, function* () {
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
                        content: "links page",
                        link: { url: "/pretendidofpagewedonothaveinthissite" },
                    },
                    annotations: {
                        bold: false,
                        italic: false,
                        strikethrough: false,
                        underline: false,
                        code: false,
                        color: "default",
                    },
                    plain_text: "links page",
                    href: "/pretendidofpagewedonothaveinthissite",
                },
            ],
            color: "default",
        },
    });
    expect(results.trim()).toBe("Inline **[Problem Internal Link]**");
}));
test("internal link inside callout", () => __awaiter(void 0, void 0, void 0, function* () {
    const targetPageId = "123";
    const targetPage = (0, pluginTestRun_1.makeSamplePageObject)({
        slug: "hello-world",
        name: "Hello World",
        id: targetPageId,
    });
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
                        link: { url: `/${targetPageId}` },
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
                    href: `/${targetPageId}`,
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
    }, targetPage);
    expect(results.trim()).toBe(`:::caution

Callouts inline [great page](/hello-world).

:::`);
}));
test("internal link inside codeblock ignored", () => __awaiter(void 0, void 0, void 0, function* () {
    const targetPageId = "123";
    const targetPage = (0, pluginTestRun_1.makeSamplePageObject)({
        slug: "hello-world",
        name: "Hello World",
        id: targetPageId,
    });
    const results = yield getMarkdown({
        type: "code",
        code: {
            caption: [],
            rich_text: [
                {
                    type: "text",
                    text: {
                        content: "this should not change [link](https://www.notion.so/native/metapages/mypage)",
                        link: null,
                    },
                    annotations: {
                        bold: false,
                        italic: false,
                        strikethrough: false,
                        underline: false,
                        code: false,
                        color: "default",
                    },
                    plain_text: "this should not change [link](https://www.notion.so/native/metapages/mypage)",
                    href: null,
                },
            ],
            language: "javascript", // notion assumed javascript in my test in which I didn't specify a language
        },
    }, targetPage);
    expect(results.trim()).toContain("this should not change [link](https://www.notion.so/native/metapages/mypage)");
}));
function getMarkdown(block, targetPage) {
    return __awaiter(this, void 0, void 0, function* () {
        const config = {
            plugins: [
                CalloutTransformer_1.standardCalloutTransformer,
                NumberedListTransformer_1.standardNumberedListTransformer,
                internalLinks_1.standardInternalLinkConversion,
                externalLinks_1.standardExternalLinkConversion,
            ],
        };
        return yield (0, pluginTestRun_1.oneBlockToMarkdown)(config, block, targetPage);
    });
}