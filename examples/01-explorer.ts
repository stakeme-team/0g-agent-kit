import { getZeroGMCPClient, closeMCPClient } from "../src/mcp-client.js";
import { mcpData } from "../src/mcp-result.js";

// No wallet, AI API key, signing or broadcasting needed.
try {
  const tools = await (await getZeroGMCPClient()).tools();
  const options = { toolCallId: "explorer-example", messages: [] };
  const info = mcpData(await tools.indexer_info.execute!({}, options));
  const blocks = mcpData(await tools.list_blocks.execute!({ limit: 5 }, options));
  console.log(JSON.stringify({ info, blocks }, null, 2));
} finally {
  await closeMCPClient();
}
