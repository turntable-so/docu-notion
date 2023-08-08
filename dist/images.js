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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupOldImages = exports.parseImageBlock = exports.markdownToMDImageTransformer = exports.standardImageTransformer = exports.initImageHandling = void 0;
const fs = __importStar(require("fs-extra"));
const file_type_1 = __importDefault(require("file-type"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const Path = __importStar(require("path"));
const MakeImagePersistencePlan_1 = require("./MakeImagePersistencePlan");
const log_1 = require("./log");
// We several things here:
// 1) copy images locally instead of leaving them in Notion
// 2) change the links to point here
// 3) read the caption and if there are localized images, get those too
// 4) prepare for localized documents, which need a copy of every image
let existingImagesNotSeenYetInPull = [];
let imageOutputPath = ""; // default to putting in the same directory as the document referring to it.
let imagePrefix = ""; // default to "./"
let locales;
function initImageHandling(prefix, outputPath, incomingLocales) {
    return __awaiter(this, void 0, void 0, function* () {
        // If they gave us a trailing slash, remove it because we add it back later.
        // Note that it's up to the caller to have a *leading* slash or not.
        imagePrefix = prefix.replace(/\/$/, "");
        imageOutputPath = outputPath;
        locales = incomingLocales;
        // Currently we don't delete the image directory, because if an image
        // changes, it gets a new id. This way can then prevent downloading
        // and image after the 1st time. The downside is currently we don't
        // have the smarts to remove unused images.
        if (imageOutputPath) {
            yield fs.mkdir(imageOutputPath, { recursive: true });
        }
    });
}
exports.initImageHandling = initImageHandling;
exports.standardImageTransformer = {
    name: "DownloadImagesToRepo",
    notionToMarkdownTransforms: [
        {
            type: "image",
            // we have to set this one up for each page because we need to
            // give it two extra parameters that are context for each page
            getStringFromBlock: (context, block) => markdownToMDImageTransformer(block, context.directoryContainingMarkdown, context.relativeFilePathToFolderContainingPage),
        },
    ],
};
// This is a "custom transformer" function passed to notion-to-markdown
// eslint-disable-next-line @typescript-eslint/require-await
function markdownToMDImageTransformer(block, fullPathToDirectoryContainingMarkdown, relativePathToThisPage) {
    return __awaiter(this, void 0, void 0, function* () {
        const image = block.image;
        yield processImageBlock(image, fullPathToDirectoryContainingMarkdown, relativePathToThisPage);
        // just concatenate the caption text parts together
        const altText = image.caption
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            .map((item) => item.plain_text)
            .join("");
        const href = image.type === "external" ? image.external.url : image.file.url;
        return `![${altText}](${href})`;
    });
}
exports.markdownToMDImageTransformer = markdownToMDImageTransformer;
function processImageBlock(imageBlock, pathToParentDocument, relativePathToThisPage) {
    return __awaiter(this, void 0, void 0, function* () {
        (0, log_1.logDebug)("processImageBlock", JSON.stringify(imageBlock));
        const imageSet = parseImageBlock(imageBlock);
        imageSet.pathToParentDocument = pathToParentDocument;
        imageSet.relativePathToParentDocument = relativePathToThisPage;
        // enhance: it would much better if we could split the changes to markdown separately from actual reading/writing,
        // so that this wasn't part of the markdown-creation loop. It's already almost there; we just need to
        // save the imageSets somewhere and then do the actual reading/writing later.
        yield readPrimaryImage(imageSet);
        (0, MakeImagePersistencePlan_1.makeImagePersistencePlan)(imageSet, imageOutputPath, imagePrefix);
        yield saveImage(imageSet);
        // change the src to point to our copy of the image
        if ("file" in imageBlock) {
            imageBlock.file.url = imageSet.filePathToUseInMarkdown;
        }
        else {
            imageBlock.external.url = imageSet.filePathToUseInMarkdown;
        }
        // put back the simplified caption, stripped of the meta information
        if (imageSet.caption) {
            imageBlock.caption = [
                {
                    type: "text",
                    text: { content: imageSet.caption, link: null },
                    plain_text: imageSet.caption,
                },
            ];
        }
        else {
            imageBlock.caption = [];
        }
    });
}
function readPrimaryImage(imageSet) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield (0, node_fetch_1.default)(imageSet.primaryUrl);
        const arrayBuffer = yield response.arrayBuffer();
        imageSet.primaryBuffer = Buffer.from(arrayBuffer);
        imageSet.fileType = yield file_type_1.default.fromBuffer(imageSet.primaryBuffer);
    });
}
function saveImage(imageSet) {
    return __awaiter(this, void 0, void 0, function* () {
        writeImageIfNew(imageSet.primaryFileOutputPath, imageSet.primaryBuffer);
        for (const localizedImage of imageSet.localizedUrls) {
            let buffer = imageSet.primaryBuffer;
            // if we have a urls for the localized screenshot, download it
            if ((localizedImage === null || localizedImage === void 0 ? void 0 : localizedImage.url.length) > 0) {
                (0, log_1.verbose)(`Retrieving ${localizedImage.iso632Code} version...`);
                const response = yield (0, node_fetch_1.default)(localizedImage.url);
                const arrayBuffer = yield response.arrayBuffer();
                buffer = Buffer.from(arrayBuffer);
            }
            else {
                (0, log_1.verbose)(`No localized image specified for ${localizedImage.iso632Code}, will use primary image.`);
                // otherwise, we're going to fall back to outputting the primary image here
            }
            const directory = `./i18n/${localizedImage.iso632Code}/docusaurus-plugin-content-docs/current/${imageSet.relativePathToParentDocument}`;
            writeImageIfNew((directory + "/" + imageSet.outputFileName).replaceAll("//", "/"), buffer);
        }
    });
}
function writeImageIfNew(path, buffer) {
    imageWasSeen(path);
    // Note: it's tempting to not spend time writing this out if we already have
    // it from a previous run. But we don't really know it's the same. A) it
    // could just have the same name, B) it could have been previously
    // unlocalized and thus filled with a copy of the primary language image
    // while and now is localized.
    if (fs.pathExistsSync(path)) {
        (0, log_1.verbose)("Replacing image " + path);
    }
    else {
        (0, log_1.verbose)("Adding image " + path);
        fs.mkdirsSync(Path.dirname(path));
    }
    fs.createWriteStream(path).write(buffer); // async but we're not waiting
}
function parseImageBlock(image) {
    var _a;
    if (!locales)
        throw Error("Did you call initImageHandling()?");
    const imageSet = {
        primaryUrl: "",
        caption: "",
        localizedUrls: locales.map(l => ({ iso632Code: l, url: "" })),
    };
    if ("file" in image) {
        imageSet.primaryUrl = image.file.url; // image saved on notion (actually AWS)
    }
    else {
        imageSet.primaryUrl = image.external.url; // image still pointing somewhere else. I've see this happen when copying a Google Doc into Notion. Notion kep pointing at the google doc.
    }
    const mergedCaption = image.caption
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        .map((c) => c.plain_text)
        .join("");
    const lines = mergedCaption.split("\n");
    // Example:
    // Caption before images.\nfr https://i.imgur.com/pYmE7OJ.png\nES  https://i.imgur.com/8paSZ0i.png\nCaption after images
    lines.forEach(l => {
        const match = /\s*(..)\s*(https:\/\/.*)/.exec(l);
        if (match) {
            imageSet.localizedUrls.push({
                iso632Code: match[1].toLowerCase(),
                url: match[2],
            });
        }
        else {
            // NB: carriage returns seem to mess up the markdown, so should be removed
            imageSet.caption += l + " ";
        }
    });
    // NB: currently notion-md puts the caption in Alt, which noone sees (unless the image isn't found)
    // We could inject a custom element handler to emit a <figure> in order to show the caption.
    imageSet.caption = (_a = imageSet.caption) === null || _a === void 0 ? void 0 : _a.trim();
    //console.log(JSON.stringify(imageSet, null, 2));
    return imageSet;
}
exports.parseImageBlock = parseImageBlock;
function imageWasSeen(path) {
    existingImagesNotSeenYetInPull = existingImagesNotSeenYetInPull.filter(p => p !== path);
}
function cleanupOldImages() {
    return __awaiter(this, void 0, void 0, function* () {
        for (const p of existingImagesNotSeenYetInPull) {
            (0, log_1.verbose)(`Removing old image: ${p}`);
            yield fs.rm(p);
        }
    });
}
exports.cleanupOldImages = cleanupOldImages;
