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
exports.loadConfigAsync = void 0;
const Cosmic = __importStar(require("cosmiconfig"));
const default_docunotion_config_1 = __importDefault(require("./default.docunotion.config"));
const log_1 = require("../log");
const cosmiconfig_typescript_loader_1 = require("cosmiconfig-typescript-loader");
const process_1 = require("process");
// read the plugins from the config file
// and add them to the map
function loadConfigAsync() {
    var _a, _b, _c, _d, _e;
    return __awaiter(this, void 0, void 0, function* () {
        let config = default_docunotion_config_1.default;
        try {
            const cosmic = Cosmic.cosmiconfig("docu-notion", {
                loaders: {
                    ".ts": (0, cosmiconfig_typescript_loader_1.TypeScriptLoader)(),
                },
                searchPlaces: [`docu-notion.config.ts`],
            });
            const found = yield cosmic.search();
            if (found) {
                (0, log_1.verbose)(`Loading config from ${found.filepath}`);
            }
            else {
                (0, log_1.verbose)(`Did not find configuration file, using defaults.`);
            }
            const pluginsWithInitializers = (_b = (_a = found === null || found === void 0 ? void 0 : found.config) === null || _a === void 0 ? void 0 : _a.plugins) === null || _b === void 0 ? void 0 : _b.filter((p) => p.init !== undefined);
            const initializers = pluginsWithInitializers === null || pluginsWithInitializers === void 0 ? void 0 : pluginsWithInitializers.map((p) => () => p.init(p));
            yield Promise.all(initializers || []);
            (_d = (_c = found === null || found === void 0 ? void 0 : found.config) === null || _c === void 0 ? void 0 : _c.plugins) === null || _d === void 0 ? void 0 : _d.forEach((plugin) => __awaiter(this, void 0, void 0, function* () {
                if (plugin.init !== undefined) {
                    (0, log_1.verbose)(`Initializing plugin ${plugin.name}...`);
                    yield plugin.init(plugin);
                }
            }));
            // for now, all we have is plugins
            config = {
                plugins: default_docunotion_config_1.default.plugins.concat(((_e = found === null || found === void 0 ? void 0 : found.config) === null || _e === void 0 ? void 0 : _e.plugins) || []),
            };
        }
        catch (e) {
            (0, log_1.error)(e.message);
            (0, process_1.exit)(1);
        }
        (0, log_1.verbose)(`Active plugins: [${config.plugins.map(p => p.name).join(", ")}]`);
        return config;
    });
}
exports.loadConfigAsync = loadConfigAsync;
