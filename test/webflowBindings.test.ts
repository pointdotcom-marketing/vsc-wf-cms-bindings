import * as assert from "assert";
import {
  extractPathAndType,
  findWebflowBindings,
  getBindingDisplayName,
  tryParseBindingAt,
} from "../src/webflowBindings";

describe("findWebflowBindings", () => {
  it("parses JSON-LD style binding with &quot; and closing \\}", () => {
    const line = `"url": "{{wf {&quot;path&quot;:&quot;main-image&quot;,&quot;type&quot;:&quot;ImageRef&quot;\\} }}"`;
    const matches = findWebflowBindings(line);
    assert.strictEqual(matches.length, 1, "expected one binding");
    const m = matches[0];
    assert.strictEqual(
      line.slice(m.start, m.end),
      "{{wf {&quot;path&quot;:&quot;main-image&quot;,&quot;type&quot;:&quot;ImageRef&quot;\\} }}",
    );
    assert.strictEqual(m.path, "main-image");
    assert.strictEqual(m.fieldType, "ImageRef");
  });

  it("parses alt text binding on same line", () => {
    const line = `"caption": "{{wf {&quot;path&quot;:&quot;main-image-alt-text&quot;,&quot;type&quot;:&quot;PlainText&quot;\\} }}"`;
    const matches = findWebflowBindings(line);
    assert.strictEqual(matches.length, 1);
    assert.strictEqual(matches[0].path, "main-image-alt-text");
    assert.strictEqual(matches[0].fieldType, "PlainText");
  });

  it("finds two bindings in one line", () => {
    const line = `a {{wf {&quot;path&quot;:&quot;x&quot;,&quot;type&quot;:&quot;PlainText&quot;} }} b {{wf {&quot;path&quot;:&quot;y&quot;,&quot;type&quot;:&quot;PlainText&quot;} }}`;
    const matches = findWebflowBindings(line);
    assert.strictEqual(matches.length, 2);
    assert.strictEqual(matches[0].path, "x");
    assert.strictEqual(matches[1].path, "y");
  });

  it("returns empty for invalid partial token", () => {
    const line = "not a binding {{wf";
    const matches = findWebflowBindings(line);
    assert.strictEqual(matches.length, 0);
  });
});

describe("tryParseBindingAt", () => {
  it("returns null when inner object is not closed", () => {
    const text = "{{wf {&quot;path&quot;:&quot;x&quot; ";
    const result = tryParseBindingAt(text, 0);
    assert.strictEqual(result, null);
  });
});

describe("extractPathAndType", () => {
  it("extracts from entity-encoded JSON", () => {
    const inner = `{&quot;path&quot;:&quot;slug-field&quot;,&quot;type&quot;:&quot;PlainText&quot;}`;
    const meta = extractPathAndType(inner);
    assert.strictEqual(meta.path, "slug-field");
    assert.strictEqual(meta.fieldType, "PlainText");
  });
});

describe("getBindingDisplayName", () => {
  it("uses the decoded path for pill labels", () => {
    assert.strictEqual(
      getBindingDisplayName({
        start: 0,
        end: 10,
        path: "main-image-alt-text",
        fieldType: "PlainText",
      }),
      "main-image-alt-text",
    );
  });

  it("falls back when metadata is unavailable", () => {
    assert.strictEqual(getBindingDisplayName({ start: 0, end: 10 }), "Webflow field");
  });
});
