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
const HeadingTransformer_1 = require("./HeadingTransformer");
test("Adds anchor to headings", () => __awaiter(void 0, void 0, void 0, function* () {
    //setLogLevel("verbose");
    const headingBlockId = "86f746f4-1c79-4ba1-a2f6-a1d59c2f9d23";
    const config = { plugins: [HeadingTransformer_1.standardHeadingTransformer] };
    const result = yield (0, pluginTestRun_1.blocksToMarkdown)(config, [
        {
            object: "block",
            id: headingBlockId,
            type: "heading_1",
            heading_1: {
                rich_text: [
                    {
                        type: "text",
                        text: { content: "Heading One", link: null },
                        annotations: {
                            bold: false,
                            italic: false,
                            strikethrough: false,
                            underline: false,
                            code: false,
                            color: "default",
                        },
                        plain_text: "Heading One",
                        href: null,
                    },
                ],
                is_toggleable: false,
                color: "default",
            },
        },
    ]);
    expect(result.trim()).toBe(`# Heading One {#${headingBlockId.replaceAll("-", "")}}`);
}));
