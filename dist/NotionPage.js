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
exports.NotionPage = exports.PageType = void 0;
const internalLinks_1 = require("./plugins/internalLinks");
// Notion has 2 kinds of pages: a normal one which is just content, and what I'm calling a "database page", which has whatever properties you put on it.
// docu-notion supports the later via links from outline pages. That is, you put the database pages in a database, then separately, in the outline, you
// create pages for each node of the outline and then add links from those to the database pages. In this way, we get the benefits of database
// pages (metadata, workflow, etc) and also normal pages (order, position in the outline).
var PageType;
(function (PageType) {
    PageType[PageType["DatabasePage"] = 0] = "DatabasePage";
    PageType[PageType["Simple"] = 1] = "Simple";
})(PageType = exports.PageType || (exports.PageType = {}));
class NotionPage {
    constructor(args) {
        this.layoutContext = args.layoutContext;
        this.pageId = args.pageId;
        this.order = args.order;
        this.metadata = args.metadata;
        this.foundDirectlyInOutline = args.foundDirectlyInOutline;
        // review: this is expensive to learn as it takes another api call... I
        // think? We can tell if it's a database because it has a "Name" instead of a
        // "tile" and "parent": "type": "database_id". But do we need to differentiate
        //this.type = PageType.Unknown;
    }
    matchesLinkId(id) {
        const { baseLinkId } = (0, internalLinks_1.parseLinkId)(id);
        const match = baseLinkId === this.pageId || // from a link_to_page.pageId, which still has the dashes
            baseLinkId === this.pageId.replaceAll("-", ""); // from inline links, which are lacking the dashes
        // logDebug(
        //   `matchedLinkId`,
        //   `comparing pageId:${this.pageId} to id ${id} --> ${match.toString()}`
        // );
        return match;
    }
    get type() {
        /*
        {
            "object": "page",
            "parent": {
                "type": "page_id",
                or
                "type": "database_id",
                ...
            },
        */
        return this.metadata.parent.type === "database_id"
            ? PageType.DatabasePage
            : PageType.Simple;
    }
    // In Notion, pages from the Database have names and simple pages have titles.
    get nameOrTitle() {
        return this.type === PageType.DatabasePage ? this.name : this.title;
    }
    nameForFile() {
        var _a;
        // In Notion, pages from the Database have names and simple pages have titles.
        return this.type === PageType.Simple
            ? this.title
            : // if it's a Database page, then we'll use the slug unless there is none, then we'd rather have the
                // page name than an ugly id for the file name
                ((_a = this.explicitSlug()) === null || _a === void 0 ? void 0 : _a.replace(/^\//, "")) || this.name;
    }
    // TODO: let's go farther in hiding this separate title vs name stuff. This seems like an implementation detail on the Notion side.
    // In Notion, pages from the Outline have "title"'s.
    get title() {
        return this.getPlainTextProperty("title", "title missing");
    }
    // In Notion, pages from the Database have "Name"s.
    get name() {
        return this.getPlainTextProperty("Name", "name missing");
    }
    explicitSlug() {
        const explicitSlug = this.getPlainTextProperty("Slug", "");
        if (explicitSlug) {
            if (explicitSlug === "/")
                return explicitSlug;
            // the root page
            else
                return ("/" +
                    encodeURIComponent(explicitSlug
                        .replace(/^\//, "")
                        // If for some reason someone types in a slug with special characters,
                        //we really don't want to see ugly entities in the URL, so first
                        // we replace a bunch of likely suspects with dashes. This will not
                        // adequately handle the case where there is one pag with slug:"foo-bar"
                        // and another with "foo?bar". Both will come out "foo-bar"
                        .replaceAll(" ", "-")
                        .replaceAll("?", "-")
                        .replaceAll("/", "-")
                        .replaceAll("#", "-")
                        .replaceAll("&", "-")
                        .replaceAll("%", "-")
                        // remove consecutive dashes
                        .replaceAll("--", "-")));
            return undefined; // this page has no slug property
        }
    }
    get slug() {
        var _a;
        return (_a = this.explicitSlug()) !== null && _a !== void 0 ? _a : "/" + this.pageId;
    }
    get hasExplicitSlug() {
        return this.explicitSlug() !== undefined;
    }
    get keywords() {
        return this.getPlainTextProperty("Keywords", "");
    }
    get authors() {
        return this.getPlainTextProperty("Authors", "");
    }
    get status() {
        return this.getSelectProperty("Status");
    }
    get date() {
        return this.getDateProperty("Date", "");
    }
    getPlainTextProperty(property, defaultIfEmpty) {
        /* Notion strings look like this
       "properties": {
          "slug": {
            "type": "rich_text",
            ...
            "rich_text": [
              {
                ...
                "plain_text": "/",
              }
            ]
          },
           "Name": {
            "type": "title",
            "title": [
              {
                ...
                "plain_text": "Intro",
              },
              {
                ...
                "plain_text": " to Notion",
              }
            ]
          */
        var _a;
        //console.log("metadata:\n" + JSON.stringify(this.metadata, null, 2));
        const p = (_a = this.metadata.properties) === null || _a === void 0 ? void 0 : _a[property];
        //console.log(`prop ${property} = ${JSON.stringify(p)}`);
        if (!p)
            return defaultIfEmpty;
        const textArray = p[p.type];
        //console.log("textarray:" + JSON.stringify(textArray, null, 2));
        return textArray && textArray.length
            ? textArray
                .map((item) => item.plain_text)
                .join("")
            : defaultIfEmpty;
    }
    getSelectProperty(property) {
        /* Notion select values look like this
         "properties": {
            "Status": {
              "id": "oB~%3D",
              "type": "select",
              "select": {
                "id": "1",
                "name": "Ready For Review",
                "color": "red"
              }
            },
            */
        var _a, _b;
        const p = (_a = this.metadata.properties) === null || _a === void 0 ? void 0 : _a[property];
        if (!p) {
            throw new Error(`missing ${property} in ${JSON.stringify(this.metadata, null, 2)}`);
            return undefined;
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return ((_b = p.select) === null || _b === void 0 ? void 0 : _b.name) || undefined;
    }
    getDateProperty(property, defaultIfEmpty, start = true) {
        /* Notion dates look like this
       "properties": {
          "published_date":
          {
            "id":"a%3Cql",
            "type":"date",
            "date":{
              "start":"2021-10-24",
              "end":null,
              "time_zone":null
            }
          }
        }
        */
        var _a, _b, _c;
        // console.log("metadata:\n" + JSON.stringify(this.metadata, null, 2));
        const p = (_a = this.metadata.properties) === null || _a === void 0 ? void 0 : _a[property];
        // console.log(`prop ${property} = ${JSON.stringify(p)}`);
        if (!p)
            return defaultIfEmpty;
        if (start) {
            return ((_b = p === null || p === void 0 ? void 0 : p.date) === null || _b === void 0 ? void 0 : _b.start) ? p.date.start : defaultIfEmpty;
        }
        else {
            return ((_c = p === null || p === void 0 ? void 0 : p.date) === null || _c === void 0 ? void 0 : _c.end) ? p.date.end : defaultIfEmpty;
        }
    }
    getContentInfo(children) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < children.length; i++) {
                children[i].order = i;
            }
            return {
                childPageIdsAndOrder: children
                    .filter((b) => b.type === "child_page")
                    .map((b) => ({ id: b.id, order: b.order })),
                linksPageIdsAndOrder: children
                    .filter((b) => b.type === "link_to_page")
                    .map((b) => ({ id: b.link_to_page.page_id, order: b.order })),
                hasParagraphs: children.some(b => b.type === "paragraph" &&
                    b.paragraph.rich_text.length > 0),
            };
        });
    }
}
exports.NotionPage = NotionPage;
