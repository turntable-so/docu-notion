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
test("raw url inside a mermaid codeblock gets converted to path using slug of that page", () => __awaiter(void 0, void 0, void 0, function* () {
    const targetPageId = "123";
    const targetPage = (0, pluginTestRun_1.makeSamplePageObject)({
        slug: "slug-of-target",
        name: "My Target Page",
        id: targetPageId,
    });
    const input = {
        type: "code",
        code: {
            caption: [],
            rich_text: [
                {
                    type: "text",
                    text: {
                        content: `click A "https://www.notion.so/native/metapages/A-Page-${targetPageId}"`,
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
                    plain_text: `click A "https://www.notion.so/native/metapages/A-Page-${targetPageId}"`,
                    href: null,
                },
            ],
            language: "mermaid", // notion assumed javascript in my test in which I didn't specify a language
        },
    };
    const mermaidLinks = {
        name: "mermaidLinks",
        regexMarkdownModifications: [
            {
                regex: /```mermaid\n.*"(https:\/\/www\.notion\.so\S+)"/,
                includeCodeBlocks: true,
                getReplacement: (context, match) => __awaiter(void 0, void 0, void 0, function* () {
                    const url = match[1];
                    const docusaurusUrl = context.convertNotionLinkToLocalDocusaurusLink(url);
                    if (docusaurusUrl) {
                        // eslint-disable-next-line @typescript-eslint/await-thenable
                        return yield match[0].replace(url, docusaurusUrl);
                    }
                    else {
                        (0, log_1.error)(`Could not convert link ${url} to a local docusaurus link`);
                        return match[0];
                    }
                }),
            },
        ],
    };
    const config = {
        plugins: [
            // standardInternalLinkConversion,
            // standardExternalLinkConversion,
            mermaidLinks,
        ],
    };
    const results = yield (0, pluginTestRun_1.oneBlockToMarkdown)(config, input, targetPage);
    expect(results.trim()).toContain(`click A "/slug-of-target"`);
}));
