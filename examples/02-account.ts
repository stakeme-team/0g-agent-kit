import { getZeroGMCPClient, closeMCPClient } from "../src/mcp-client.js";
import { getWalletAddress } from "../src/utils.js";
import { mcpData } from "../src/mcp-result.js";

// WALLET_ADDRESS is public; do not generate or import a wallet to read an account.
const address = getWalletAddress();
try {
  const tools = await (await getZeroGMCPClient()).tools();
  const options = { toolCallId: "account-example", messages: [] };
  const account = mcpData(await tools.get_account.execute!({ address }, options));
  const staking = mcpData(await tools.account_staking_summary.execute!({ address }, options));
  // Keep wei/shares as their original decimal strings.
  console.log(JSON.stringify({ account, staking }, null, 2));
} finally {
  await closeMCPClient();
}
