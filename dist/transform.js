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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMarkdownFromNotionBlocks = exports.getMarkdownForPage = void 0;
const chalk_1 = __importDefault(require("chalk"));
const log_1 = require("./log");
function getMarkdownForPage(config, context, page) {
    return __awaiter(this, void 0, void 0, function* () {
        (0, log_1.info)(`Reading & converting page ${page.layoutContext}/${page.nameOrTitle} (${chalk_1.default.blue(page.hasExplicitSlug
            ? page.slug
            : page.foundDirectlyInOutline
                ? "Descendant of Outline, not Database"
                : "NO SLUG")})`);
        const blocks = yield context.getBlockChildren(page.pageId);
        (0, log_1.logDebugFn)("markdown from page", () => JSON.stringify(blocks, null, 2));
        const body = yield getMarkdownFromNotionBlocks(context, config, blocks);
        const frontmatter = getFrontMatter(page); // todo should be a plugin
        return `${frontmatter}\n${body}`;
    });
}
exports.getMarkdownForPage = getMarkdownForPage;
// this is split off from getMarkdownForPage so that unit tests can provide the block contents
function getMarkdownFromNotionBlocks(context, config, blocks) {
    return __awaiter(this, void 0, void 0, function* () {
        // changes to the blocks we get from notion API
        doNotionBlockTransforms(blocks, config);
        // overrides for the default notion-to-markdown conversions
        registerNotionToMarkdownCustomTransforms(config, context);
        // the main conversion to markdown, using the notion-to-md library
        let markdown = yield doNotionToMarkdown(context, blocks); // ?
        // corrections to links after they are converted to markdown,
        // with access to all the pages we've seen
        markdown = doLinkFixes(context, markdown, config);
        //console.log("markdown after link fixes", markdown);
        // simple regex-based tweaks. These are usually related to docusaurus
        const { imports, body } = yield doTransformsOnMarkdown(context, config, markdown);
        // console.log("markdown after regex fixes", markdown);
        // console.log("body after regex", body);
        return `${imports}\n${body}`;
    });
}
exports.getMarkdownFromNotionBlocks = getMarkdownFromNotionBlocks;
// operations on notion blocks before they are converted to markdown
function doNotionBlockTransforms(blocks, config) {
    for (const block of blocks) {
        config.plugins.forEach(plugin => {
            if (plugin.notionBlockModifications) {
                plugin.notionBlockModifications.forEach(transform => {
                    (0, log_1.logDebug)("transforming block with plugin", plugin.name);
                    transform.modify(block);
                });
            }
        });
    }
}
function doTransformsOnMarkdown(context, config, input) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const regexMods = config.plugins
            .filter(plugin => !!plugin.regexMarkdownModifications)
            .map(plugin => {
            const mods = plugin.regexMarkdownModifications;
            // stick the name of the plugin into each mode for logging
            const modsWithNames = mods.map(m => (Object.assign({ name: plugin.name }, m)));
            return modsWithNames;
        })
            .flat();
        // regex that matches markdown code blocks
        const codeBlocks = /```.*\n[\s\S]*?\n```/;
        let body = input;
        //console.log("body before regex: " + body);
        let match;
        const imports = new Set();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const mod of regexMods) {
            let replacement = undefined;
            // regex.exec is stateful, so we don't want to mess up the plugin's use of its own regex, so we clone it.
            // we also add the "g" flag to make sure we get all matches
            const regex = new RegExp(`${codeBlocks.source}|(${mod.regex.source})`, "g");
            while ((match = regex.exec(input)) !== null) {
                if (match[0]) {
                    const original = match[0];
                    if (original.startsWith("```") &&
                        original.endsWith("```") &&
                        !mod.includeCodeBlocks) {
                        continue; // code block, and they didn't say to include them
                    }
                    if (mod.getReplacement) {
                        // our match here has an extra group, which is an implementation detail
                        // that shouldn't be made visible to the plugin
                        const matchAsThePluginWouldExpectIt = mod.regex.exec(match[0]);
                        replacement = yield mod.getReplacement(context, matchAsThePluginWouldExpectIt);
                    }
                    else if (mod.replacementPattern) {
                        replacement = mod.replacementPattern.replace("$1", match[2]);
                    }
                    if (replacement !== undefined) {
                        (0, log_1.verbose)(`[${mod.name}] ${original} --> ${replacement}`);
                        const precedingPart = body.substring(0, match.index); // ?
                        const partStartingFromThisMatch = body.substring(match.index); // ?
                        body =
                            precedingPart +
                                partStartingFromThisMatch.replace(original, replacement);
                        // add any library imports
                        (_a = mod.imports) === null || _a === void 0 ? void 0 : _a.forEach(imp => imports.add(imp));
                    }
                }
            }
        }
        (0, log_1.logDebug)("doTransformsOnMarkdown", "body after regex: " + body);
        const uniqueImports = [...new Set(imports)];
        return { body, imports: [...uniqueImports].join("\n") };
    });
}
function doNotionToMarkdown(docunotionContext, blocks) {
    return __awaiter(this, void 0, void 0, function* () {
        const mdBlocks = yield docunotionContext.notionToMarkdown.blocksToMarkdown(blocks);
        const markdown = docunotionContext.notionToMarkdown.toMarkdownString(mdBlocks);
        return markdown;
    });
}
// corrections to links after they are converted to markdown
// Note: from notion (or notion-md?) we get slightly different hrefs depending on whether the links is "inline"
// (has some other text that's been turned into a link) or "raw".
// Raw links come in without a leading slash, e.g. [link_to_page](4a6de8c0-b90b-444b-8a7b-d534d6ec71a4)
// Inline links come in with a leading slash, e.g. [pointer to the introduction](/4a6de8c0b90b444b8a7bd534d6ec71a4)
function doLinkFixes(context, markdown, config) {
    const linkRegExp = /\[.*\]\([^\)]*\)/g;
    (0, log_1.logDebug)("markdown before link fixes", markdown);
    let match;
    // since we're going to make changes to the markdown,
    // we need to keep track of where we are in the string as we search
    const markdownToSearch = markdown;
    // The key to understanding this `while` is that linkRegExp actually has state, and
    // it gives you a new one each time. https://stackoverflow.com/a/1520853/723299
    while ((match = linkRegExp.exec(markdownToSearch)) !== null) {
        const originalLinkMarkdown = match[0];
        (0, log_1.verbose)(`Checking to see if a plugin wants to modify "${originalLinkMarkdown}" `);
        // We only use the first plugin that matches and makes a change to the link.
        // Enhance: we could take the time to see if multiple plugins match, and
        // and point this out in verbose logging mode.
        config.plugins.some(plugin => {
            if (!plugin.linkModifier)
                return false;
            if (plugin.linkModifier.match.exec(originalLinkMarkdown) === null) {
                (0, log_1.verbose)(`plugin "${plugin.name}" did not match this url`);
                return false;
            }
            const newMarkdown = plugin.linkModifier.convert(context, originalLinkMarkdown);
            if (newMarkdown !== originalLinkMarkdown) {
                markdown = markdown.replace(originalLinkMarkdown, newMarkdown);
                (0, log_1.verbose)(`plugin "${plugin.name}" transformed link: ${originalLinkMarkdown}-->${newMarkdown}`);
                return true; // the first plugin that matches and does something wins
            }
            else {
                (0, log_1.verbose)(`plugin "${plugin.name}" did not change this url`);
                return false;
            }
        });
    }
    return markdown;
}
// overrides for the conversions that notion-to-md does
function registerNotionToMarkdownCustomTransforms(config, docunotionContext) {
    config.plugins.forEach(plugin => {
        if (plugin.notionToMarkdownTransforms) {
            plugin.notionToMarkdownTransforms.forEach(transform => {
                (0, log_1.logDebug)("registering custom transform", `${plugin.name} for ${transform.type}`);
                docunotionContext.notionToMarkdown.setCustomTransformer(transform.type, (block) => {
                    (0, log_1.logDebug)("notion to MD conversion of ", `${transform.type} with plugin: ${plugin.name}`);
                    return transform.getStringFromBlock(docunotionContext, block);
                });
            });
        }
    });
}
// enhance:make this built-in plugin so that it can be overridden
function getFrontMatter(page) {
    var _a;
    let frontmatter = "---\n";
    frontmatter += `title: ${page.nameOrTitle.replaceAll(":", "-")}\n`; // I have not found a way to escape colons
    frontmatter += `sidebar_position: ${page.order}\n`;
    frontmatter += `slug: ${(_a = page.slug) !== null && _a !== void 0 ? _a : ""}\n`;
    if (page.keywords)
        frontmatter += `keywords: [${page.keywords}]\n`;
    if (page.date)
        frontmatter += `date: ${page.date}\n`;
    if (page.authors)
        frontmatter += `authors: [${page.authors}]\n`;
    frontmatter += "---\n";
    return frontmatter;
}
