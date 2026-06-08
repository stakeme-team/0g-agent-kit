import { createMCPClient } from "@ai-sdk/mcp";
import { getMcpUrl } from "../src/utils.js";
import { getWalletAddress } from "../src/utils.js";
import { signTransaction } from "../src/wallet.js";

const POOL =
  "0x8f549af4ccc9a80c333a1005e765c1bd5fa9329f9360aec92fdaa89fe89f4080";
const AMOUNT = "1.5";

async function main() {
  const from = getWalletAddress();
  const client = await createMCPClient({
    transport: { type: "http", url: getMcpUrl() },
  });
  const tools = await client.tools();
  const prep = await tools.prepare_delegate.execute({
    from,
    poolId: POOL,
    amount: AMOUNT,
  });
  const bodyStr = (prep as { structuredContent?: { body?: string } })
    .structuredContent?.body;
  if (!bodyStr) throw new Error("No structured body");
  const raw = JSON.parse(bodyStr) as Record<string, unknown>;
  if ((raw as { error?: boolean }).error) throw new Error(JSON.stringify(raw));

  const unsigned: Record<string, unknown> = {
    to: raw.to,
    value: raw.value,
    data: raw.data,
    nonce: raw.nonce,
    chainId: raw.chainId,
    type: raw.type,
    maxPriorityFeePerGas: raw.maxPriorityFeePerGas,
    maxFeePerGas: raw.maxFeePerGas,
    gas: raw.gas,
  };

  const signed = await signTransaction(unsigned);
  const br = await tools.broadcast_signed_raw_transaction.execute({
    serializedTransaction: signed,
  });
  const brBody = JSON.parse(
    (br as { structuredContent?: { body?: string } }).structuredContent
      ?.body || "{}"
  ) as { hash?: string };
  const hash = brBody.hash;
  if (!hash) throw new Error(`Broadcast failed: ${JSON.stringify(br)}`);

  const waited = await tools.wait_for_transaction.execute({
    hash,
    confirmations: 1,
  });
  console.log(JSON.stringify({ hash, waited }, null, 2));
  await client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
