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
exports.oneBlockToMarkdown = exports.makeSamplePageObject = exports.blocksToMarkdown = void 0;
const client_1 = require("@notionhq/client");
const notion_to_md_1 = require("notion-to-md");
const HierarchicalNamedLayoutStrategy_1 = require("../HierarchicalNamedLayoutStrategy");
const NotionPage_1 = require("../NotionPage");
const transform_1 = require("../transform");
const internalLinks_1 = require("./internalLinks");
function blocksToMarkdown(config, blocks, pages) {
    return __awaiter(this, void 0, void 0, function* () {
        const notionClient = new client_1.Client({ auth: "unused" });
        const notionToMD = new notion_to_md_1.NotionToMarkdown({
            notionClient,
        });
        // if (pages && pages.length) {
        //   console.log(pages[0]);
        //   console.log(pages[0].matchesLinkId);
        // }
        const docunotionContext = {
            notionToMarkdown: notionToMD,
            // TODO when does this actually need to do get some children?
            // We can add a children argument to this method, but for the tests
            // I have so far, it's not needed.
            getBlockChildren: (id) => {
                return new Promise((resolve, reject) => {
                    resolve([]);
                });
            },
            convertNotionLinkToLocalDocusaurusLink: (url) => {
                return (0, internalLinks_1.convertInternalUrl)(docunotionContext, url);
            },
            //TODO might be needed for some tests, e.g. the image transformer...
            directoryContainingMarkdown: "not yet",
            relativeFilePathToFolderContainingPage: "not yet",
            layoutStrategy: new HierarchicalNamedLayoutStrategy_1.HierarchicalNamedLayoutStrategy(),
            options: {
                notionToken: "",
                rootPage: "",
                locales: [],
                markdownOutputPath: "",
                imgOutputPath: "",
                imgPrefixInMarkdown: "",
                statusTag: "",
            },
            pages: pages !== null && pages !== void 0 ? pages : [],
            counts: {
                output_normally: 0,
                skipped_because_empty: 0,
                skipped_because_status: 0,
                skipped_because_level_cannot_have_content: 0,
            },
            // enhance: this needs more thinking, how we want to do logging in tests
            // one thing is to avoid a situation where we break people's tests that
            // have come to rely on logs that we later tweak in some way.
            // log: {
            //   error: (s: string) => {
            //     error(s);
            //   },
            //   warning: (s: string) => {
            //     warning(s);
            //   },
            //   info: (s: string) => {
            //     // info(s);
            //   },
            //   verbose: (s: string) => {
            //     // verbose(s);
            //   },
            //   debug: (s: string) => {
            //     // logDebug("Testrun-TODO", s);
            //   },
            // },
        };
        if (pages && pages.length) {
            console.log(pages[0].matchesLinkId);
            console.log(docunotionContext.pages[0].matchesLinkId);
        }
        const r = yield (0, transform_1.getMarkdownFromNotionBlocks)(docunotionContext, config, blocks);
        //console.log("blocksToMarkdown", r);
        return r;
    });
}
exports.blocksToMarkdown = blocksToMarkdown;
// This is used for things like testing links to other pages and frontmatter creation,
// when just testing what happens to individual blocks is not enough.
// after getting this, you can make changes to it, then pass it to blocksToMarkdown
function makeSamplePageObject(options) {
    let slugObject = {
        Slug: {
            id: "%7D%3D~K",
            type: "rich_text",
            rich_text: [],
        },
    };
    if (options.slug)
        slugObject = {
            id: "%7D%3D~K",
            type: "rich_text",
            rich_text: [
                {
                    type: "text",
                    text: {
                        content: options.slug,
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
                    plain_text: options.slug,
                    href: null,
                },
            ],
        };
    const id = options.id || "4a6de8c0-b90b-444b-8a7b-d534d6ec71a4";
    const m = {
        object: "page",
        id: id,
        created_time: "2022-08-08T21:07:00.000Z",
        last_edited_time: "2023-01-03T14:38:00.000Z",
        created_by: {
            object: "user",
            id: "11fb7f16-0560-4aee-ab88-ed75a850cfc4",
        },
        last_edited_by: {
            object: "user",
            id: "11fb7f16-0560-4aee-ab88-ed75a850cfc4",
        },
        cover: null,
        icon: null,
        parent: {
            type: "database_id",
            database_id: "c13f520c-06ad-41e4-a021-bdc2841ab24a",
        },
        archived: false,
        properties: {
            Keywords: {
                id: "%3F%7DLZ",
                type: "rich_text",
                rich_text: [],
            },
            Property: {
                id: "GmKE",
                type: "rich_text",
                rich_text: [],
            },
            Label: {
                id: "Phor",
                type: "multi_select",
                multi_select: [],
            },
            Status: {
                id: "oB~%3D",
                type: "select",
                select: {
                    id: "1",
                    name: "Ready For Review",
                    color: "red",
                },
            },
            Authors: {
                id: "tA%3BF",
                type: "multi_select",
                multi_select: [],
            },
            Slug: slugObject,
            Name: {
                id: "title",
                type: "title",
                title: [
                    {
                        type: "text",
                        text: {
                            content: options.name || "Hello World",
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
                        plain_text: options.name || "Hello World",
                        href: null,
                    },
                ],
            },
        },
        url: `https://www.notion.so/Hello-World-${id}`,
    };
    const p = new NotionPage_1.NotionPage({
        layoutContext: "/Second-Level/Third-Level",
        pageId: id,
        order: 0,
        metadata: m,
        foundDirectlyInOutline: false,
    });
    console.log(p.matchesLinkId);
    return p;
}
exports.makeSamplePageObject = makeSamplePageObject;
function oneBlockToMarkdown(config, block, targetPage) {
    return __awaiter(this, void 0, void 0, function* () {
        // just in case someone expects these other properties that aren't normally relevant,
        // we merge the given block properties into an actual, full block
        const fullBlock = Object.assign({
            object: "block",
            id: "937e77e5-f058-4316-9805-a538e7b4082d",
            parent: {
                type: "page_id",
                page_id: "d20d8391-b365-42cb-8821-cf3c5382c6ed",
            },
            created_time: "2023-01-13T16:33:00.000Z",
            last_edited_time: "2023-01-13T16:33:00.000Z",
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
        }, block);
        const dummyPage1 = makeSamplePageObject({
            slug: "dummy1",
            name: "Dummy1",
        });
        const dummyPage2 = makeSamplePageObject({
            slug: "dummy2",
            name: "Dummy2",
        });
        return yield blocksToMarkdown(config, [fullBlock], targetPage ? [dummyPage1, targetPage, dummyPage2] : undefined);
    });
}
exports.oneBlockToMarkdown = oneBlockToMarkdown;
