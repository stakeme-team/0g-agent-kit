import { createMCPClient } from "@ai-sdk/mcp";
import { getMcpUrl, getWalletAddress } from "../src/utils.js";
import { signTransaction } from "../src/wallet.js";

// Mainnet spends real 0G — verify on a 0G testnet deployment before mainnet.
// prepare_delegate builds a delegate(address) call (selector 0x5c19a95c) TO the
// per-validator contract, passing `from` (the delegator) as the address arg.
// So VALIDATOR must be a per-validator contract address — the `addr` field from
// list_validators / get_validator (0x-prefixed), NOT the staking root contract.

// A per-validator contract address to delegate to (the `addr` from list_validators).
const VALIDATOR = process.env.ZEROG_VALIDATOR || "0x0000000000000000000000000000000000000000";
const AMOUNT = process.env.ZEROG_STAKE_AMOUNT || "0.1";

// The AI SDK tool `execute` signature requires a second ToolExecutionOptions
// argument. When invoking tools directly (outside a generateText loop) the MCP
// client only reads `options.abortSignal`, so an empty stub is sufficient and
// behavior-preserving.
const callOpts = { toolCallId: "stake-flow", messages: [] };

async function main() {
  const from = getWalletAddress();
  const client = await createMCPClient({ transport: { type: "http", url: getMcpUrl() } });
  const tools = await client.tools();

  const prep = await tools.prepare_delegate.execute(
    { from, validator: VALIDATOR, amount: AMOUNT },
    callOpts,
  );
  // The MCP server returns the unsigned tx as an OBJECT at structuredContent.data
  // (already parsed — do NOT JSON.parse it).
  const unsigned = (prep as any).structuredContent?.data as Record<string, unknown>;
  if (!unsigned) throw new Error("No structured data from prepare_delegate");
  if ((unsigned as { error?: boolean }).error) throw new Error(JSON.stringify(unsigned));

  const signed = await signTransaction(unsigned);
  const br = await tools.broadcast_signed_raw_transaction.execute(
    { serializedTransaction: signed },
    callOpts,
  );
  // The broadcast tool returns { hash } at structuredContent.data (an object).
  const hash = (br as any).structuredContent?.data?.hash as string | undefined;
  if (!hash) throw new Error(`Broadcast failed: ${JSON.stringify(br)}`);

  const waited = await tools.wait_for_transaction.execute({ hash, confirmations: 1 }, callOpts);
  console.log(JSON.stringify({ hash, waited }, null, 2));
  await client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
