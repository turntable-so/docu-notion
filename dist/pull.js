"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.initNotionClient = exports.executeWithRateLimitAndRetries = exports.notionPull = void 0;
const fs = __importStar(require("fs-extra"));
const notion_to_md_1 = require("notion-to-md");
const HierarchicalNamedLayoutStrategy_1 = require("./HierarchicalNamedLayoutStrategy");
const NotionPage_1 = require("./NotionPage");
const images_1 = require("./images");
const Path = __importStar(require("path"));
const log_1 = require("./log");
const transform_1 = require("./transform");
const limiter_1 = require("limiter");
const client_1 = require("@notionhq/client");
const process_1 = require("process");
const configuration_1 = require("./config/configuration");
const internalLinks_1 = require("./plugins/internalLinks");
let layoutStrategy;
let notionToMarkdown;
const pages = new Array();
const counts = {
    output_normally: 0,
    skipped_because_empty: 0,
    skipped_because_status: 0,
    skipped_because_level_cannot_have_content: 0,
};
function notionPull(options) {
    return __awaiter(this, void 0, void 0, function* () {
        // It's helpful when troubleshooting CI secrets and environment variables to see what options actually made it to docu-notion.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const optionsForLogging = Object.assign({}, options);
        // Just show the first few letters of the notion token, which start with "secret" anyhow.
        optionsForLogging.notionToken =
            optionsForLogging.notionToken.substring(0, 3) + "...";
        const config = yield (0, configuration_1.loadConfigAsync)();
        (0, log_1.verbose)(`Options:${JSON.stringify(optionsForLogging, null, 2)}`);
        yield (0, images_1.initImageHandling)(options.imgPrefixInMarkdown || options.imgOutputPath || "", options.imgOutputPath || "", options.locales);
        const notionClient = initNotionClient(options.notionToken);
        notionToMarkdown = new notion_to_md_1.NotionToMarkdown({ notionClient });
        layoutStrategy = new HierarchicalNamedLayoutStrategy_1.HierarchicalNamedLayoutStrategy();
        yield fs.mkdir(options.markdownOutputPath, { recursive: true });
        layoutStrategy.setRootDirectoryForMarkdown(options.markdownOutputPath.replace(/\/+$/, "") // trim any trailing slash
        );
        (0, log_1.info)("Connecting to Notion...");
        (0, log_1.group)("Stage 1: walk children of the page named 'Outline', looking for pages...");
        yield getPagesRecursively(options, "", options.rootPage, 0, true);
        (0, log_1.logDebug)("getPagesRecursively", JSON.stringify(pages, null, 2));
        (0, log_1.info)(`Found ${pages.length} pages`);
        (0, log_1.endGroup)();
        (0, log_1.group)(`Stage 2: convert ${pages.length} Notion pages to markdown and save locally...`);
        yield outputPages(options, config, pages);
        (0, log_1.endGroup)();
        (0, log_1.group)("Stage 3: clean up old files & images...");
        yield layoutStrategy.cleanupOldFiles();
        yield (0, images_1.cleanupOldImages)();
        (0, log_1.endGroup)();
    });
}
exports.notionPull = notionPull;
function outputPages(options, config, pages) {
    return __awaiter(this, void 0, void 0, function* () {
        const context = {
            getBlockChildren: getBlockChildren,
            directoryContainingMarkdown: "",
            relativeFilePathToFolderContainingPage: "",
            layoutStrategy: layoutStrategy,
            notionToMarkdown: notionToMarkdown,
            options: options,
            pages: pages,
            counts: counts,
            convertNotionLinkToLocalDocusaurusLink: (url) => (0, internalLinks_1.convertInternalUrl)(context, url),
        };
        for (const page of pages) {
            layoutStrategy.pageWasSeen(page);
            const mdPath = layoutStrategy.getPathForPage(page, ".md");
            // most plugins should not write to disk, but those handling image files need these paths
            context.directoryContainingMarkdown = Path.dirname(mdPath);
            // TODO: This needs clarifying: getLinkPathForPage() is about urls, but
            // downstream images.ts is using it as a file system path
            context.relativeFilePathToFolderContainingPage = Path.dirname(layoutStrategy.getLinkPathForPage(page));
            if (page.type === NotionPage_1.PageType.DatabasePage &&
                context.options.statusTag != "*" &&
                page.status !== context.options.statusTag) {
                (0, log_1.verbose)(`Skipping page because status is not '${context.options.statusTag}': ${page.nameOrTitle}`);
                ++context.counts.skipped_because_status;
            }
            else {
                const markdown = yield (0, transform_1.getMarkdownForPage)(config, context, page);
                writePage(page, markdown);
            }
        }
        (0, log_1.info)(`Finished processing ${pages.length} pages`);
        (0, log_1.info)(JSON.stringify(counts));
    });
}
// This walks the "Outline" page and creates a list of all the nodes that will
// be in the sidebar, including the directories, the pages that are linked to
// that are parented in from the "Database", and any pages we find in the
// outline that contain content (which we call "Simple" pages). Later, we can
// then step through this list creating the files we need, and, crucially, be
// able to figure out what the url will be for any links between content pages.
function getPagesRecursively(options, incomingContext, pageIdOfThisParent, orderOfThisParent, rootLevel) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const pageInTheOutline = yield fromPageId(incomingContext, pageIdOfThisParent, orderOfThisParent, true);
        (0, log_1.info)(`Looking for children and links from ${incomingContext}/${pageInTheOutline.nameOrTitle}`);
        const r = yield getBlockChildren(pageInTheOutline.pageId);
        const pageInfo = yield pageInTheOutline.getContentInfo(r);
        if (!rootLevel &&
            pageInfo.hasParagraphs &&
            pageInfo.childPageIdsAndOrder.length) {
            (0, log_1.error)(`Skipping "${pageInTheOutline.nameOrTitle}"  and its children. docu-notion does not support pages that are both levels and have content at the same time.`);
            ++counts.skipped_because_level_cannot_have_content;
            return;
        }
        if (!rootLevel && pageInfo.hasParagraphs) {
            pages.push(pageInTheOutline);
            // The best practice is to keep content pages in the "database" (e.g. kanban board), but we do allow people to make pages in the outline directly.
            // So how can we tell the difference between a page that is supposed to be content and one that is meant to form the sidebar? If it
            // has only links, then it's a page for forming the sidebar. If it has contents and no links, then it's a content page. But what if
            // it has both? Well then we assume it's a content page.
            if ((_a = pageInfo.linksPageIdsAndOrder) === null || _a === void 0 ? void 0 : _a.length) {
                (0, log_1.warning)(`Note: The page "${pageInTheOutline.nameOrTitle}" is in the outline, has content, and also points at other pages. It will be treated as a simple content page. This is no problem, unless you intended to have all your content pages in the database (kanban workflow) section.`);
            }
        }
        // a normal outline page that exists just to create the level, pointing at database pages that belong in this level
        else if (pageInfo.childPageIdsAndOrder.length ||
            pageInfo.linksPageIdsAndOrder.length) {
            let layoutContext = incomingContext;
            // don't make a level for "Outline" page at the root
            if (!rootLevel && pageInTheOutline.nameOrTitle !== "Outline") {
                layoutContext = layoutStrategy.newLevel(options.markdownOutputPath, pageInTheOutline.order, incomingContext, pageInTheOutline.nameOrTitle);
            }
            for (const childPageInfo of pageInfo.childPageIdsAndOrder) {
                yield getPagesRecursively(options, layoutContext, childPageInfo.id, childPageInfo.order, false);
            }
            for (const linkPageInfo of pageInfo.linksPageIdsAndOrder) {
                pages.push(yield fromPageId(layoutContext, linkPageInfo.id, linkPageInfo.order, false));
            }
        }
        else {
            console.info((0, log_1.warning)(`Warning: The page "${pageInTheOutline.nameOrTitle}" is in the outline but appears to not have content, links to other pages, or child pages. It will be skipped.`));
            ++counts.skipped_because_empty;
        }
    });
}
function writePage(page, finalMarkdown) {
    const mdPath = layoutStrategy.getPathForPage(page, ".md");
    (0, log_1.verbose)(`writing ${mdPath}`);
    fs.writeFileSync(mdPath, finalMarkdown, {});
    ++counts.output_normally;
}
const notionLimiter = new limiter_1.RateLimiter({
    tokensPerInterval: 3,
    interval: "second",
});
let notionClient;
function getPageMetadata(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield executeWithRateLimitAndRetries(`pages.retrieve(${id})`, () => {
            return notionClient.pages.retrieve({
                page_id: id,
            });
        });
    });
}
// While everything works fine locally, on Github Actions we are getting a lot of timeouts, so
// we're trying this extra retry-able wrapper.
function executeWithRateLimitAndRetries(label, asyncFunction) {
    return __awaiter(this, void 0, void 0, function* () {
        yield rateLimit();
        const kRetries = 10;
        let lastException = undefined;
        for (let i = 0; i < kRetries; i++) {
            try {
                return yield asyncFunction();
            }
            catch (e) {
                lastException = e;
                if ((e === null || e === void 0 ? void 0 : e.code) === "notionhq_client_request_timeout" ||
                    e.message.includes("timeout") ||
                    e.message.includes("Timeout") ||
                    e.message.includes("limit") ||
                    e.message.includes("Limit")) {
                    const secondsToWait = i + 1;
                    (0, log_1.info)(`While doing "${label}", got error "${e.message}". Will retry after  ${secondsToWait}s...`);
                    yield new Promise(resolve => setTimeout(resolve, 1000 * secondsToWait));
                }
                else {
                    throw e;
                }
            }
        }
        (0, log_1.error)(`Error: could not complete "${label}" after ${kRetries} retries.`);
        throw lastException;
    });
}
exports.executeWithRateLimitAndRetries = executeWithRateLimitAndRetries;
function rateLimit() {
    return __awaiter(this, void 0, void 0, function* () {
        if (notionLimiter.getTokensRemaining() < 1) {
            (0, log_1.logDebug)("rateLimit", "*** delaying for rate limit");
        }
        yield notionLimiter.removeTokens(1);
    });
}
function getBlockChildren(id) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        // we can only get so many responses per call, so we set this to
        // the first response we get, then keep adding to its array of blocks
        // with each subsequent response
        let overallResult = undefined;
        let start_cursor = undefined;
        // Note: there is a now a collectPaginatedAPI() in the notion client, so
        // we could switch to using that (I don't know if it does rate limiting?)
        do {
            const response = yield executeWithRateLimitAndRetries(`getBlockChildren(${id})`, () => {
                return notionClient.blocks.children.list({
                    start_cursor: start_cursor,
                    block_id: id,
                });
            });
            if (!overallResult) {
                overallResult = response;
            }
            else {
                overallResult.results.push(...response.results);
            }
            start_cursor = response === null || response === void 0 ? void 0 : response.next_cursor;
        } while (start_cursor != null);
        if ((_a = overallResult === null || overallResult === void 0 ? void 0 : overallResult.results) === null || _a === void 0 ? void 0 : _a.some(b => !(0, client_1.isFullBlock)(b))) {
            (0, log_1.error)(`The Notion API returned some blocks that were not full blocks. docu-notion does not handle this yet. Please report it.`);
            (0, process_1.exit)(1);
        }
        return (_b = overallResult === null || overallResult === void 0 ? void 0 : overallResult.results) !== null && _b !== void 0 ? _b : [];
    });
}
function initNotionClient(notionToken) {
    notionClient = new client_1.Client({
        auth: notionToken,
    });
    return notionClient;
}
exports.initNotionClient = initNotionClient;
function fromPageId(context, pageId, order, foundDirectlyInOutline) {
    return __awaiter(this, void 0, void 0, function* () {
        const metadata = yield getPageMetadata(pageId);
        //logDebug("notion metadata", JSON.stringify(metadata));
        return new NotionPage_1.NotionPage({
            layoutContext: context,
            pageId,
            order,
            metadata,
            foundDirectlyInOutline,
        });
    });
}
