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
const EscapeHtmlBlockModifier_1 = require("./EscapeHtmlBlockModifier");
let blocks;
beforeEach(() => {
    blocks = [
        {
            object: "block",
            id: "503533c3-c1cc-4f5f-89bc-95472486d16c",
            parent: {
                type: "page_id",
                page_id: "a623852e-3552-40cf-89a9-7e3adbc07e9c",
            },
            created_time: "2023-01-12T20:25:00.000Z",
            last_edited_time: "2023-01-12T20:36:00.000Z",
            created_by: {
                object: "user",
                id: "11fb7f16-0560-4aee-ab88-ed75a850cfc4",
            },
            last_edited_by: {
                object: "user",
                id: "11fb7f16-0560-4aee-ab88-ed75a850cfc4",
            },
            has_children: false,
            archived: false,
            type: "paragraph",
            paragraph: {
                rich_text: [
                    {
                        type: "text",
                        text: { content: "2 < 3 > 1", link: null },
                        annotations: {
                            bold: true,
                            italic: true,
                            strikethrough: false,
                            underline: false,
                            code: false,
                            color: "yellow",
                        },
                        plain_text: "2 < 3 > 1",
                        href: null,
                    },
                ],
                color: "default",
            },
        },
        {
            object: "block",
            id: "5bd7b925-9d87-435a-bbfb-df97e07e7d39",
            parent: {
                type: "page_id",
                page_id: "a623852e-3552-40cf-89a9-7e3adbc07e9c",
            },
            created_time: "2023-01-12T20:26:00.000Z",
            last_edited_time: "2023-01-12T20:36:00.000Z",
            created_by: {
                object: "user",
                id: "11fb7f16-0560-4aee-ab88-ed75a850cfc4",
            },
            last_edited_by: {
                object: "user",
                id: "11fb7f16-0560-4aee-ab88-ed75a850cfc4",
            },
            has_children: false,
            archived: false,
            type: "paragraph",
            paragraph: {
                rich_text: [
                    {
                        type: "text",
                        text: { content: "This is code: if(1 < 3)", link: null },
                        annotations: {
                            bold: false,
                            italic: false,
                            strikethrough: false,
                            underline: false,
                            code: true,
                            color: "default",
                        },
                        plain_text: "This is code: if(1 < 3)",
                        href: null,
                    },
                ],
                color: "default",
            },
        },
        {
            object: "block",
            id: "bdd2569a-8b0d-450e-ba03-4315e5f726b8",
            parent: {
                type: "page_id",
                page_id: "a623852e-3552-40cf-89a9-7e3adbc07e9c",
            },
            created_time: "2023-01-12T20:27:00.000Z",
            last_edited_time: "2023-01-12T20:27:00.000Z",
            created_by: {
                object: "user",
                id: "11fb7f16-0560-4aee-ab88-ed75a850cfc4",
            },
            last_edited_by: {
                object: "user",
                id: "11fb7f16-0560-4aee-ab88-ed75a850cfc4",
            },
            has_children: false,
            archived: false,
            type: "paragraph",
            paragraph: { rich_text: [], color: "default" },
        },
    ];
});
test("smoketest ", () => __awaiter(void 0, void 0, void 0, function* () {
    const config = { plugins: [EscapeHtmlBlockModifier_1.standardEscapeHtmlBlockModifier] };
    let results = yield (0, pluginTestRun_1.blocksToMarkdown)(config, blocks);
    // shouldn't escape inside a code block
    expect(results).toContain("This is code: if(1 < 3)");
    // should escape outside a code block
    expect(results).toContain("2 &lt; 3 &gt; 1");
    // that line is also bold and italic
    expect(results).toContain("_**2 &lt; 3 &gt; 1**_");
}));
