import { IPlugin } from "./pluginTypes";

export const gifEmbed: IPlugin = {
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

export const imgurGifEmbed: IPlugin = {
  name: "imgur",
  regexMarkdownModifications: [
    {
      regex: /\[.*\]\((.*imgur\.com\/.*)\)/, // imgur.com
      // imgur links to gifs need a .gif at the end, but the url they give you doesn't have one.
      replacementPattern: `![]($1.gif)`,
    },
  ],
};
export const youtubeEmbed: IPlugin = {
  name: "youtube",
  regexMarkdownModifications: [
    {
      regex: /\[.*\]\((.*youtube\.com\/watch.*)\)/, //youtube.com/watch
      imports: [`import ReactPlayer from "react-player";`],
      replacementPattern: `<ReactPlayer controls url="$1" />`,
    },
  ],
};
export const vimeoEmbed: IPlugin = {
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

export const notionEmbed: IPlugin = {
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
