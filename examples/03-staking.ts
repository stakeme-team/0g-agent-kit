import { getZeroGMCPClient, closeMCPClient } from "../src/mcp-client.js";
import { mcpData } from "../src/mcp-result.js";

try {
  const tools = await (await getZeroGMCPClient()).tools();
  const options = { toolCallId: "staking-example", messages: [] };
  const validators = mcpData(await tools.list_validators.execute!({ limit: 5 }, options));
  const parameters = mcpData(await tools.staking_parameters.execute!({}, options));
  console.log(JSON.stringify({ validators, parameters }, null, 2));
  // To inspect one validator, call get_validator({ address: "0x..." }).
  // Native-current does not prepare, sign or broadcast staking transactions.
} finally {
  await closeMCPClient();
}
