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
Object.defineProperty(exports, "__esModule", { value: true });
const assert = __importStar(require("assert"));
const webflowBindings_1 = require("../src/webflowBindings");
describe("findWebflowBindings", () => {
    it("parses JSON-LD style binding with &quot; and closing \\}", () => {
        const line = `"url": "{{wf {&quot;path&quot;:&quot;main-image&quot;,&quot;type&quot;:&quot;ImageRef&quot;\\} }}"`;
        const matches = (0, webflowBindings_1.findWebflowBindings)(line);
        assert.strictEqual(matches.length, 1, "expected one binding");
        const m = matches[0];
        assert.strictEqual(line.slice(m.start, m.end), "{{wf {&quot;path&quot;:&quot;main-image&quot;,&quot;type&quot;:&quot;ImageRef&quot;\\} }}");
        assert.strictEqual(m.path, "main-image");
        assert.strictEqual(m.fieldType, "ImageRef");
    });
    it("parses alt text binding on same line", () => {
        const line = `"caption": "{{wf {&quot;path&quot;:&quot;main-image-alt-text&quot;,&quot;type&quot;:&quot;PlainText&quot;\\} }}"`;
        const matches = (0, webflowBindings_1.findWebflowBindings)(line);
        assert.strictEqual(matches.length, 1);
        assert.strictEqual(matches[0].path, "main-image-alt-text");
        assert.strictEqual(matches[0].fieldType, "PlainText");
    });
    it("finds two bindings in one line", () => {
        const line = `a {{wf {&quot;path&quot;:&quot;x&quot;,&quot;type&quot;:&quot;PlainText&quot;} }} b {{wf {&quot;path&quot;:&quot;y&quot;,&quot;type&quot;:&quot;PlainText&quot;} }}`;
        const matches = (0, webflowBindings_1.findWebflowBindings)(line);
        assert.strictEqual(matches.length, 2);
        assert.strictEqual(matches[0].path, "x");
        assert.strictEqual(matches[1].path, "y");
    });
    it("returns empty for invalid partial token", () => {
        const line = "not a binding {{wf";
        const matches = (0, webflowBindings_1.findWebflowBindings)(line);
        assert.strictEqual(matches.length, 0);
    });
});
describe("tryParseBindingAt", () => {
    it("returns null when inner object is not closed", () => {
        const text = "{{wf {&quot;path&quot;:&quot;x&quot; ";
        const result = (0, webflowBindings_1.tryParseBindingAt)(text, 0);
        assert.strictEqual(result, null);
    });
});
describe("extractPathAndType", () => {
    it("extracts from entity-encoded JSON", () => {
        const inner = `{&quot;path&quot;:&quot;slug-field&quot;,&quot;type&quot;:&quot;PlainText&quot;}`;
        const meta = (0, webflowBindings_1.extractPathAndType)(inner);
        assert.strictEqual(meta.path, "slug-field");
        assert.strictEqual(meta.fieldType, "PlainText");
    });
});
describe("getBindingDisplayName", () => {
    it("uses the decoded path for pill labels", () => {
        assert.strictEqual((0, webflowBindings_1.getBindingDisplayName)({
            start: 0,
            end: 10,
            path: "main-image-alt-text",
            fieldType: "PlainText",
        }), "main-image-alt-text");
    });
    it("falls back when metadata is unavailable", () => {
        assert.strictEqual((0, webflowBindings_1.getBindingDisplayName)({ start: 0, end: 10 }), "Webflow field");
    });
});
//# sourceMappingURL=webflowBindings.test.js.map