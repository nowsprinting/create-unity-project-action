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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.dist_dir = dist_dir;
exports.run = run;
const core = __importStar(require("@actions/core"));
const io = __importStar(require("@actions/io"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs/promises"));
function dist_dir() {
    const root = path.dirname(path.dirname(__filename));
    return path.join(root, `dist`);
}
function github_workspace() {
    const workspace = process.env.GITHUB_WORKSPACE;
    if (workspace === undefined) {
        throw new Error(`process.env.GITHUB_WORKSPACE is undefined`);
    }
    return workspace;
}
function setStandalone(content, key, value) {
    if (value === '')
        return content; // keep template value; empty replacement would corrupt YAML (`Standalone: `)
    const regex = new RegExp(`(${key}: *\\n *Standalone: )\\d+`);
    return content.replace(regex, (_match, prefix) => `${prefix}${value}`);
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Copy Unity project files
            const dest = core.getInput('project-path');
            const options = { recursive: true, force: false };
            const targetPath = path.join(github_workspace(), dest);
            const templatePath = path.join(dist_dir(), 'UnityProject~');
            if (dest === '.' || dest === './') {
                // Copy contents of UnityProject~ into the workspace root
                const entries = yield fs.readdir(templatePath);
                for (const name of entries) {
                    const src = path.join(templatePath, name);
                    const dst = path.join(targetPath, name);
                    yield io.cp(src, dst, options);
                }
            }
            else {
                // Ensure parent directory exists before copying the template folder
                yield io.mkdirP(path.dirname(targetPath));
                yield io.cp(templatePath, targetPath, options);
            }
            // Set options
            const projectSettingsPath = path.join(targetPath, 'ProjectSettings', 'ProjectSettings.asset');
            let content = yield fs.readFile(projectSettingsPath, 'utf8');
            const scriptingBackend = core.getInput('scripting-backend');
            content = setStandalone(content, 'scriptingBackend', scriptingBackend);
            content = setStandalone(content, 'il2cppCodeGeneration', core.getInput('il2cpp-code-generation'));
            const managedStrippingLevel = core.getInput('managed-stripping-level');
            // IL2CPP's default is "Minimal" (4), not "Disabled" (0); Mono keeps "Disabled" (0) as its default.
            const isIL2CPP = scriptingBackend === '1';
            const isStrippingLevelDisabledOrUnset = managedStrippingLevel === '0' || managedStrippingLevel === '';
            content = setStandalone(content, 'managedStrippingLevel', isIL2CPP && isStrippingLevelDisabledOrUnset ? '4' : managedStrippingLevel);
            // Note: "activeInputHandler" does not exist in the template's ProjectSettings.asset, so it is appended
            content += `  activeInputHandler: ${core.getInput('active-input-handler')}\n`;
            yield fs.writeFile(projectSettingsPath, content);
            // Outputs
            core.setOutput('created-project-path', dest);
            core.exportVariable('CREATED_PROJECT_PATH', dest);
        }
        catch (error) {
            if (error instanceof Error)
                core.setFailed(error.message);
        }
    });
}
run();
