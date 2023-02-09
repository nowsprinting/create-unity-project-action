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
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = exports.dist_dir = void 0;
const core = __importStar(require("@actions/core"));
const io = __importStar(require("@actions/io"));
const path = __importStar(require("path"));
function dist_dir() {
    const root = path.dirname(path.dirname(__filename));
    return path.join(root, `dist`);
}
exports.dist_dir = dist_dir;
function github_workspace() {
    const workspace = process.env.GITHUB_WORKSPACE;
    if (workspace === undefined) {
        throw new Error(`process.env.GITHUB_WORKSPACE is undefined`);
    }
    return workspace;
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const dest = core.getInput('project-path');
            const options = { recursive: true, force: false };
            yield io.cp(path.join(dist_dir(), 'UnityProject~'), path.join(github_workspace(), dest), options);
            core.setOutput('created-project-path', dest);
            core.exportVariable('CREATED_PROJECT_PATH', dest);
        }
        catch (error) {
            if (error instanceof Error)
                core.setFailed(error.message);
        }
    });
}
exports.run = run;
run();
