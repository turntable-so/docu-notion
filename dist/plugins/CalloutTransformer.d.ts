import { IPlugin } from "./pluginTypes";
type TextRequest = string;
type Annotations = {
    bold: boolean;
    italic: boolean;
    strikethrough: boolean;
    underline: boolean;
    code: boolean;
    color: "default" | "gray" | "brown" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink" | "red" | "gray_background" | "brown_background" | "orange_background" | "yellow_background" | "green_background" | "blue_background" | "purple_background" | "pink_background" | "red_background";
};
export type Text = {
    type: "text";
    text: {
        content: string;
        link: {
            url: TextRequest;
        } | null;
    };
    annotations: Annotations;
    plain_text: string;
    href: string | null;
};
export declare const standardCalloutTransformer: IPlugin;
export {};
