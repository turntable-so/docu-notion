"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notionEmbed = exports.vimeoEmbed = exports.youtubeEmbed = exports.imgurGifEmbed = exports.gifEmbed = void 0;
exports.gifEmbed = {
    name: "gif",
    regexMarkdownModifications: [
        {
            // I once saw a gif coming from Notion that wasn't a full
            // url, which wouldn't work, hence the "http" requirement
            regex: /\[.*\]\((http.*(\.(gif|GIF)))\)/,
            replacementPattern: `![]($1)`,
        },
    ],
};
exports.imgurGifEmbed = {
    name: "imgur",
    regexMarkdownModifications: [
        {
            regex: /\[.*\]\((.*imgur\.com\/.*)\)/,
            // imgur links to gifs need a .gif at the end, but the url they give you doesn't have one.
            replacementPattern: `![]($1.gif)`,
        },
    ],
};
exports.youtubeEmbed = {
    name: "youtube",
    regexMarkdownModifications: [
        {
            regex: /\[.*\]\((.*youtube\.com\/watch.*)\)/,
            imports: [`import ReactPlayer from "react-player";`],
            replacementPattern: `<ReactPlayer controls url="$1" />`,
        },
    ],
};
exports.vimeoEmbed = {
    name: "vimeo",
    regexMarkdownModifications: [
        {
            regex: /\[.*\]\((https:\/\/.*vimeo.*)\)/,
            // we use to have the following, but the above should handle both the player an not-player urls.
            //regex: /\[.*\]\((.*player\.vimeo.*)\)/gm, // player.vimeo
            imports: [`import ReactPlayer from "react-player";`],
            replacementPattern: `<ReactPlayer controls url="$1" />`,
        },
    ],
};
exports.notionEmbed = {
    name: "notion",
    regexMarkdownModifications: [
        {
            regex: /\[.*\]\((https:\/\/.*secure.notion-static.com.*)\)/,
            // we use to have the following, but the above should handle both the player an not-player urls.
            //regex: /\[.*\]\((.*player\.vimeo.*)\)/gm, // player.vimeo
            imports: [`import ReactPlayer from "react-player";`],
            replacementPattern: `<ReactPlayer controls url="$1" />`,
        },
    ],
};
