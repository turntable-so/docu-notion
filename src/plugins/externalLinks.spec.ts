import { setLogLevel, verbose } from "../log";
import { NotionPage } from "../NotionPage";
import { oneBlockToMarkdown } from "../TestRun";
import { standardExternalLinkConversion } from "./externalLinks";

// If you paste a link in notion and then choose "Create bookmark", the markdown
// would normally be [bookmark](https://example.com)]. Instead of seeing "bookmark",
// we change to the url.
test("links turned into bookmarks", async () => {
  setLogLevel("debug");
  const results = await getMarkdown({
    type: "bookmark",
    bookmark: { caption: [], url: "https://github.com" },
  });
  expect(results.trim()).toBe("[https://github.com](https://github.com)");
});

test("external link inside callout", async () => {
  const results = await getMarkdown({
    type: "callout",
    callout: {
      rich_text: [
        {
          type: "text",
          text: { content: "Callouts inline ", link: null },
          annotations: {
            bold: false,
            italic: false,
            strikethrough: false,
            underline: false,
            code: false,
            color: "default",
          },
          plain_text: "Callouts inline ",
          href: null,
        },
        {
          type: "text",
          text: {
            content: "great page",
            link: { url: `https://github.com` },
          },
          annotations: {
            bold: false,
            italic: false,
            strikethrough: false,
            underline: false,
            code: false,
            color: "default",
          },
          plain_text: "great page",
          href: `https://github.com`,
        },
        {
          type: "text",
          text: { content: ".", link: null },
          annotations: {
            bold: false,
            italic: false,
            strikethrough: false,
            underline: false,
            code: false,
            color: "default",
          },
          plain_text: ".",
          href: null,
        },
      ],
      icon: { type: "emoji", emoji: "⚠️" },
      color: "gray_background",
    },
  });
  expect(results.trim()).toBe(
    "> ⚠️ Callouts inline [great page](https://github.com)."
  );
});

async function getMarkdown(block: object) {
  const config = {
    plugins: [standardExternalLinkConversion],
  };
  return await oneBlockToMarkdown(config, block);
}
