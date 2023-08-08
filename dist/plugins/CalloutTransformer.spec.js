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
const pluginTestRun_1 = require("./pluginTestRun");
const CalloutTransformer_1 = require("./CalloutTransformer");
const externalLinks_1 = require("./externalLinks");
const internalLinks_1 = require("./internalLinks");
let block;
beforeEach(() => {
    block = {
        has_children: false,
        archived: false,
        type: "callout",
        callout: {
            rich_text: [
                {
                    type: "text",
                    text: { content: "This is information callout", link: null },
                    annotations: {
                        bold: false,
                        italic: false,
                        strikethrough: false,
                        underline: false,
                        code: false,
                        color: "default",
                    },
                    plain_text: "This is the callout",
                    href: null,
                },
            ],
            icon: { type: "emoji", emoji: "ℹ️" },
            color: "gray_background",
        },
    };
});
test("smoketest callout", () => __awaiter(void 0, void 0, void 0, function* () {
    const config = { plugins: [CalloutTransformer_1.standardCalloutTransformer] };
    block.callout.icon.emoji = "ℹ️";
    let results = yield (0, pluginTestRun_1.blocksToMarkdown)(config, [
        block,
    ]);
    expect(results).toContain("\n:::note\n\nThis is the callout\n\n:::\n");
    block.callout.icon.emoji = "❗";
    results = yield (0, pluginTestRun_1.blocksToMarkdown)(config, [block]);
    expect(results).toContain(":::info");
}));
test("external link inside callout, bold preserved", () => __awaiter(void 0, void 0, void 0, function* () {
    const config = {
        plugins: [
            CalloutTransformer_1.standardCalloutTransformer,
            internalLinks_1.standardInternalLinkConversion,
            externalLinks_1.standardExternalLinkConversion,
        ],
    };
    const results = yield (0, pluginTestRun_1.blocksToMarkdown)(config, [
        {
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
                            bold: true,
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
        },
    ]);
    expect(results.trim()).toBe(`:::caution

Callouts inline [**great page**](https://github.com).

:::`);
}));
test("internal link inside callout, bold preserved", () => __awaiter(void 0, void 0, void 0, function* () {
    const config = {
        plugins: [
            CalloutTransformer_1.standardCalloutTransformer,
            internalLinks_1.standardInternalLinkConversion,
            externalLinks_1.standardExternalLinkConversion,
        ],
    };
    const slugTargetPage = (0, pluginTestRun_1.makeSamplePageObject)({
        slug: "hello-world",
        name: "Hello World",
        id: "123",
    });
    const results = yield (0, pluginTestRun_1.blocksToMarkdown)(config, [
        {
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
                            link: { url: `/123#456` },
                        },
                        annotations: {
                            bold: true,
                            italic: false,
                            strikethrough: false,
                            underline: false,
                            code: false,
                            color: "default",
                        },
                        plain_text: "great page",
                        href: `/123#456`,
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
                        plain_text: " the end.",
                        href: null,
                    },
                ],
                icon: { type: "emoji", emoji: "⚠️" },
                color: "gray_background",
            },
        },
    ], [slugTargetPage]);
    expect(results.trim()).toBe(`:::caution

Callouts inline [**great page**](/hello-world#456) the end.

:::`);
}));
