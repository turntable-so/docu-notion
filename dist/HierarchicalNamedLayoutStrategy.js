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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HierarchicalNamedLayoutStrategy = void 0;
const fs = __importStar(require("fs-extra"));
const sanitize_filename_1 = __importDefault(require("sanitize-filename"));
const LayoutStrategy_1 = require("./LayoutStrategy");
// This strategy gives us a file tree that mirrors that of notion.
// Each level in the outline becomes a directory, and each file bears the name of the Notion document.
// As long as you use slugs, the urls is still just something like https://site/slug
class HierarchicalNamedLayoutStrategy extends LayoutStrategy_1.LayoutStrategy {
    newLevel(dirRoot, order, context, levelLabel) {
        const path = context + "/" + (0, sanitize_filename_1.default)(levelLabel).replaceAll(" ", "-");
        //console.log("Creating level " + path);
        const newPath = dirRoot + "/" + path;
        fs.mkdirSync(newPath, { recursive: true });
        this.addCategoryMetadata(newPath, order, levelLabel);
        return path;
    }
    getPathForPage(page, extensionWithDot) {
        const sanitizedName = (0, sanitize_filename_1.default)(page.nameForFile())
            .replaceAll("//", "/")
            .replaceAll("%20", "-")
            .replaceAll(" ", "-")
            // crowdin complains about some characters in file names. I haven't found
            // the actual list, so these are from memory.
            .replaceAll('"', "")
            .replaceAll("“", "")
            .replaceAll("”", "")
            .replaceAll("'", "")
            .replaceAll("?", "-");
        const context = ("/" + page.layoutContext + "/").replaceAll("//", "/");
        const path = this.rootDirectory + context + sanitizedName + extensionWithDot;
        return path;
    }
    //{
    //   "position": 2.5,
    //   "label": "Tutorial",
    //   "collapsible": true,
    //   "collapsed": false,
    //   "className": "red",
    //   "link": {
    //     "type": "generated-index",
    //     "title": "Tutorial overview"
    //   },
    //   "customProps": {
    //     "description": "This description can be used in the swizzled DocCard"
    //   }
    // }
    addCategoryMetadata(dir, order, label) {
        const data = `{"position":${order}, "label":"${label}"}`;
        fs.writeFileSync(dir + "/_category_.json", data);
    }
}
exports.HierarchicalNamedLayoutStrategy = HierarchicalNamedLayoutStrategy;
