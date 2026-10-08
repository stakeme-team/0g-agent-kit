import assert from "node:assert/strict";
import test from "node:test";
import { mcpData } from "../src/mcp-result.js";

test("native account/staking results preserve exact wei and shares", () => {
  const result = mcpData({ structuredContent: { status: "ok", data: {
    balance: "1000000000000000000000000000000000001",
    shares: "900719925474099312345678901234567890",
  } } });
  assert.deepEqual(result, {
    balance: "1000000000000000000000000000000000001",
    shares: "900719925474099312345678901234567890",
  });
});

test("MCP errors cannot masquerade as successful data", () => {
  assert.throws(() => mcpData({ isError: true,
    content: [{ type: "text", text: "Account not indexed" }],
    structuredContent: { data: { balance: "0" } },
  }), /Account not indexed/);
});

test("missing structured data fails while valid null and empty pages remain intact", () => {
  assert.throws(() => mcpData({ content: [{ type: "text", text: "{}" }] }), /no structuredContent.data/);
  assert.equal(mcpData({ structuredContent: { status: "ok", data: null } }), null);
  assert.deepEqual(mcpData({ structuredContent: { status: "ok", data: { items: [], next_cursor: null } } }),
    { items: [], next_cursor: null });
});
