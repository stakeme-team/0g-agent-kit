import assert from "node:assert/strict";
import { createMCPClient } from "@ai-sdk/mcp";
import { getMcpUrl } from "../src/utils.js";
import { mcpData } from "../src/mcp-result.js";

const required = [
  "list_blocks", "get_block", "get_transaction", "gas_oracle", "stats_overview",
  "indexer_info", "search", "get_account", "list_tokens", "list_validators",
  "get_validator", "account_delegations", "account_undelegations",
  "account_staking_summary", "validator_delegations", "validator_undelegations",
  "staking_parameters", "validator_statistics",
];
const client = await createMCPClient({ transport: { type: "http", url: getMcpUrl() } });
try {
  const tools = await client.tools();
  for (const name of required) assert.ok(tools[name], `Missing native MCP tool: ${name}`);
  for (const name of Object.keys(tools)) {
    assert.ok(!/^(prepare_|broadcast_|verify_|claim_faucet|generate_disposable)/.test(name),
      `Unexpected write tool in native-current catalogue: ${name}`);
  }
  const options = { toolCallId: "native-mcp-smoke", messages: [] };
  const info = mcpData(await tools.indexer_info.execute!({}, options));
  const blocks = mcpData(await tools.list_blocks.execute!({ limit: 1 }, options));
  console.log(JSON.stringify({ status: "PASS", endpoint: getMcpUrl(),
    tools: Object.keys(tools), indexerInfo: info, blocks,
    signed: false, broadcast: false }, null, 2));
} finally {
  await client.close();
}
