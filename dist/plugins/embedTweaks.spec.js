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
const embedTweaks_1 = require("./embedTweaks");
test("youtube", () => __awaiter(void 0, void 0, void 0, function* () {
    const config = { plugins: [embedTweaks_1.youtubeEmbed] };
    const result = yield (0, pluginTestRun_1.blocksToMarkdown)(config, [
        {
            object: "block",
            id: "e6ddd1d4-36d4-4925-94c1-5dff4662c1f3",
            has_children: false,
            archived: false,
            type: "video",
            video: {
                caption: [
                    {
                        type: "text",
                        text: {
                            content: "A video about editing in Notion",
                            link: null,
                        },
                        plain_text: "A video about editing in Notion",
                        href: null,
                    },
                ],
                type: "external",
                external: { url: "https://www.youtube.com/watch?v=FXIrojSK3Jo" },
            },
        },
    ]);
    expect(result).toContain(`import ReactPlayer from "react-player";`);
    expect(result).toContain(`<ReactPlayer controls url="https://www.youtube.com/watch?v=FXIrojSK3Jo" />`);
}));
test("vimeo", () => __awaiter(void 0, void 0, void 0, function* () {
    (0, log_1.setLogLevel)("verbose");
    const config = { plugins: [embedTweaks_1.vimeoEmbed] };
    const result = yield (0, pluginTestRun_1.blocksToMarkdown)(config, [
        {
            object: "block",
            id: "39ff83a3-2fb5-4411-a715-960656a177ff",
            type: "video",
            video: {
                caption: [],
                type: "external",
                external: { url: "https://vimeo.com/4613611xx" },
            },
        },
    ]);
    expect(result).toContain(`import ReactPlayer from "react-player";`);
    expect(result).toContain(`<ReactPlayer controls url="https://vimeo.com/4613611xx" />`);
}));
test("imgur", () => __awaiter(void 0, void 0, void 0, function* () {
    (0, log_1.setLogLevel)("verbose");
    const config = { plugins: [embedTweaks_1.imgurGifEmbed] };
    const result = yield (0, pluginTestRun_1.blocksToMarkdown)(config, [
        {
            object: "block",
            id: "e36710d8-98ad-40dc-b41b-b376ebdd6894",
            type: "bookmark",
            bookmark: { caption: [], url: "https://imgur.com/gallery/U8TTNuI" },
        },
    ]);
    expect(result.trim()).toBe(`![](https://imgur.com/gallery/U8TTNuI.gif)`);
}));
test("gif", () => __awaiter(void 0, void 0, void 0, function* () {
    (0, log_1.setLogLevel)("verbose");
    const config = { plugins: [embedTweaks_1.gifEmbed] };
    const result = yield (0, pluginTestRun_1.blocksToMarkdown)(config, [
        {
            object: "block",
            id: "e36710d8-98ad-40dc-b41b-b376ebdd6894",
            type: "bookmark",
            bookmark: {
                caption: [],
                url: "https://en.wikipedia.org/wiki/GIF#/media/File:Rotating_earth_(large).gif",
            },
        },
    ]);
    expect(result.trim()).toBe(`![](https://en.wikipedia.org/wiki/GIF#/media/File:Rotating_earth_(large).gif)`);
}));
test("tweaks are not applied inside code blocks", () => __awaiter(void 0, void 0, void 0, function* () {
    (0, log_1.setLogLevel)("verbose");
    const p = {
        name: "test",
        regexMarkdownModifications: [
            {
                regex: /find/,
                replacementPattern: `found`,
            },
        ],
    };
    const config = { plugins: [p] };
    const result = yield (0, pluginTestRun_1.blocksToMarkdown)(config, [
        {
            type: "code",
            code: {
                caption: [],
                rich_text: [
                    {
                        type: "text",
                        text: {
                            content: "don't find me",
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
                        plain_text: "don't find me",
                        href: null,
                    },
                ],
                language: "",
            },
        },
        {
            type: "paragraph",
            paragraph: {
                rich_text: [
                    {
                        type: "text",
                        text: { content: "find this", link: null },
                        annotations: {
                            bold: false,
                            italic: false,
                            strikethrough: false,
                            underline: false,
                            code: true,
                            color: "default",
                        },
                        plain_text: "find this",
                        href: null,
                    },
                ],
            },
        },
    ]);
    // we should not change the code one
    expect(result.trim()).toContain("don't find me");
    // but we should change the non-code block one
    expect(result.trim()).toContain("found this");
}));
test("simplest possible", () => __awaiter(void 0, void 0, void 0, function* () {
    (0, log_1.setLogLevel)("verbose");
    const p = {
        name: "test",
        regexMarkdownModifications: [
            {
                regex: /find/,
                replacementPattern: `found`,
            },
        ],
    };
    const config = { plugins: [p] };
    const result = yield (0, pluginTestRun_1.blocksToMarkdown)(config, [
        {
            type: "paragraph",
            paragraph: {
                rich_text: [
                    {
                        type: "text",
                        text: { content: "find this", link: null },
                        annotations: {
                            bold: false,
                            italic: false,
                            strikethrough: false,
                            underline: false,
                            code: true,
                            color: "default",
                        },
                        plain_text: "find this",
                        href: null,
                    },
                ],
            },
        },
    ]);
    expect(result.trim()).toContain("found this");
}));
test("use match in output", () => __awaiter(void 0, void 0, void 0, function* () {
    (0, log_1.setLogLevel)("verbose");
    const p = {
        name: "test",
        regexMarkdownModifications: [
            {
                regex: /(find)/,
                replacementPattern: `found $1`,
            },
        ],
    };
    const config = { plugins: [p] };
    const result = yield (0, pluginTestRun_1.blocksToMarkdown)(config, [
        {
            type: "paragraph",
            paragraph: {
                rich_text: [
                    {
                        type: "text",
                        text: { content: "find this", link: null },
                        annotations: {
                            bold: false,
                            italic: false,
                            strikethrough: false,
                            underline: false,
                            code: true,
                            color: "default",
                        },
                        plain_text: "find this",
                        href: null,
                    },
                ],
            },
        },
    ]);
    expect(result.trim()).toContain("found find");
}));
