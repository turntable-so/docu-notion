import { IPlugin } from "../plugins/pluginTypes";
export type IDocuNotionConfig = {
    plugins: IPlugin[];
};
export declare function loadConfigAsync(): Promise<IDocuNotionConfig>;
