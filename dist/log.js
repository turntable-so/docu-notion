"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logDebug = exports.logDebugFn = exports.verbose = exports.endGroup = exports.group = exports.info = exports.warning = exports.error = exports.setLogLevel = void 0;
const chalk_1 = __importDefault(require("chalk"));
chalk_1.default;
let logLevel;
function setLogLevel(l) {
    logLevel = l;
}
exports.setLogLevel = setLogLevel;
function error(s) {
    console.error(chalk_1.default.red(wrapForCI(s, "error")));
}
exports.error = error;
function warning(s) {
    console.log(chalk_1.default.hex("#FFA500")(wrapForCI(s, "warning")));
}
exports.warning = warning;
function info(s) {
    console.log(s);
}
exports.info = info;
// make sure to call endGroup(), eventually, after calling this
function group(s) {
    console.log(chalk_1.default.blue(wrapForCI(s, "group")));
}
exports.group = group;
// github actions needs an ::endgroup:: to end a group
function endGroup() {
    console.log(wrapForCI("", "endgroup"));
}
exports.endGroup = endGroup;
function verbose(s) {
    if (logLevel === "verbose" || logLevel === "debug")
        console.log(chalk_1.default.green(s));
}
exports.verbose = verbose;
// use this one if the debug info would take time to construct,
// so you want to skip doing it if not in debug mode
function logDebugFn(label, runIfLoggingDebug) {
    if (logLevel === "debug") {
        logDebug(label, runIfLoggingDebug());
    }
}
exports.logDebugFn = logDebugFn;
function logDebug(label, info) {
    if (logLevel === "debug") {
        console.log(chalk_1.default.dim(wrapForCI(`[${label}]`, "debug")));
        console.log(chalk_1.default.dim(wrapForCI(info, "debug")));
    }
}
exports.logDebug = logDebug;
function wrapForCI(s, githubActionsPrefix) {
    // for now, we only know about github actions, but submit a PR if you want to add more
    return process.env["GITHUB_ACTIONS"] === "true"
        ? `::${githubActionsPrefix}::${s}`
        : s;
}
