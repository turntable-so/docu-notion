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
const NumberedListTransformer_1 = require("./NumberedListTransformer");
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
test("external link inside numbered list, italic preserved", () => __awaiter(void 0, void 0, void 0, function* () {
    const config = { plugins: [NumberedListTransformer_1.standardNumberedListTransformer] };
    const results = yield (0, pluginTestRun_1.blocksToMarkdown)(config, [
        {
            type: "numbered_list_item",
            numbered_list_item: {
                rich_text: [
                    {
                        type: "text",
                        text: { content: "link ", link: null },
                        annotations: {
                            bold: false,
                            italic: false,
                            strikethrough: false,
                            underline: false,
                            code: false,
                            color: "default",
                        },
                        plain_text: "link ",
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
                            italic: true,
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
        },
    ]);
    expect(results.trim()).toBe(`1. link [_github_](https://github.com)`);
}));
