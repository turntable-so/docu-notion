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
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeImagePersistencePlan = void 0;
const Path = __importStar(require("path"));
const log_1 = require("./log");
const process_1 = require("process");
function makeImagePersistencePlan(imageSet, imageOutputRootPath, imagePrefix) {
    var _a;
    if ((_a = imageSet.fileType) === null || _a === void 0 ? void 0 : _a.ext) {
        // Since most images come from pasting screenshots, there isn't normally a filename. That's fine, we just make a hash of the url
        // Images that are stored by notion come to us with a complex url that changes over time, so we pick out the UUID that doesn't change. Example:
        //    https://s3.us-west-2.amazonaws.com/secure.notion-static.com/d1058f46-4d2f-4292-8388-4ad393383439/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20220516%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220516T233630Z&X-Amz-Expires=3600&X-Amz-Signature=f215704094fcc884d37073b0b108cf6d1c9da9b7d57a898da38bc30c30b4c4b5&X-Amz-SignedHeaders=host&x-id=GetObject
        let thingToHash = imageSet.primaryUrl;
        const m = /.*secure\.notion-static\.com\/(.*)\//gm.exec(imageSet.primaryUrl);
        if (m && m.length > 1) {
            thingToHash = m[1];
        }
        const hash = hashOfString(thingToHash);
        imageSet.outputFileName = `${hash}.${imageSet.fileType.ext}`;
        imageSet.primaryFileOutputPath = Path.posix.join((imageOutputRootPath === null || imageOutputRootPath === void 0 ? void 0 : imageOutputRootPath.length) > 0
            ? imageOutputRootPath
            : imageSet.pathToParentDocument, imageSet.outputFileName);
        if (imageOutputRootPath && imageSet.localizedUrls.length) {
            (0, log_1.error)("imageOutputPath was declared, but one or more localizedUrls were found too. If you are going to localize screenshots, then you can't declare an imageOutputPath.");
            (0, process_1.exit)(1);
        }
        imageSet.filePathToUseInMarkdown =
            ((imagePrefix === null || imagePrefix === void 0 ? void 0 : imagePrefix.length) > 0 ? imagePrefix : ".") +
                "/" +
                imageSet.outputFileName;
    }
    else {
        (0, log_1.error)(`Something wrong with the filetype extension on the blob we got from ${imageSet.primaryUrl}`);
        (0, process_1.exit)(1);
    }
}
exports.makeImagePersistencePlan = makeImagePersistencePlan;
function hashOfString(s) {
    let hash = 0;
    for (let i = 0; i < s.length; ++i)
        hash = Math.imul(31, hash) + s.charCodeAt(i);
    return Math.abs(hash);
}
