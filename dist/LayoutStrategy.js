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
exports.LayoutStrategy = void 0;
const fs = __importStar(require("fs-extra"));
const log_1 = require("./log");
// Here a fuller name would be File Tree Layout Strategy. That is,
// as we walk the Notion outline and create files, where do we create them, what do we name them, etc.
class LayoutStrategy {
    constructor() {
        this.rootDirectory = "";
        this.existingPagesNotSeenYetInPull = [];
    }
    setRootDirectoryForMarkdown(markdownOutputPath) {
        this.rootDirectory = markdownOutputPath;
        this.existingPagesNotSeenYetInPull =
            this.getListOfExistingFiles(markdownOutputPath);
    }
    cleanupOldFiles() {
        return __awaiter(this, void 0, void 0, function* () {
            // Remove any pre-existing files that aren't around anymore; this indicates that they were removed or renamed in Notion.
            for (const p of this.existingPagesNotSeenYetInPull) {
                (0, log_1.verbose)(`Removing old doc: ${p}`);
                yield fs.rm(p);
            }
        });
    }
    getLinkPathForPage(page) {
        // the url we return starts with a "/", meaning it is relative to the root of the markdown root (e.g. /docs root in Docusaurus)
        return ("/" + page.slug).replaceAll("//", "/");
    }
    pageWasSeen(page) {
        const path = this.getPathForPage(page, ".md");
        this.existingPagesNotSeenYetInPull =
            this.existingPagesNotSeenYetInPull.filter(p => p !== path);
    }
    getListOfExistingFiles(dir) {
        return fs.readdirSync(dir).flatMap(item => {
            const path = `${dir}/${item}`;
            if (fs.statSync(path).isDirectory()) {
                return this.getListOfExistingFiles(path);
            }
            if (path.endsWith(".md")) {
                // we could just notice all files, and maybe that's better. But then we lose an debugging files like .json of the raw notion, on the second run.
                return [path];
            }
            else
                return [];
        });
    }
}
exports.LayoutStrategy = LayoutStrategy;
