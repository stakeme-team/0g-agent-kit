import { createMCPClient } from "@ai-sdk/mcp";
import { getMcpUrl } from "../src/utils.js";

const callOpts = { toolCallId: "mcp-contract-smoke", messages: [] };
const from = "0x0000000000000000000000000000000000000001";

function dataOf(result: any): any {
  if (result?.isError) {
    throw new Error(result.content?.[0]?.text ?? "MCP tool returned an error");
  }
  if (result?.structuredContent?.data === undefined) {
    throw new Error("MCP tool returned no structuredContent.data");
  }
  return result.structuredContent.data;
}

function address(value: unknown): string {
  const raw = String(value ?? "").replace(/^0x/i, "");
  if (!/^[0-9a-fA-F]{40}$/.test(raw)) {
    throw new Error(`invalid EVM address: ${String(value)}`);
  }
  return `0x${raw.toLowerCase()}`;
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function apiBase(mcpUrl: string): string {
  if (process.env.ZEROG_API_URL) {
    return process.env.ZEROG_API_URL.replace(/\/+$/, "");
  }
  const url = new URL(mcpUrl);
  url.pathname = "";
  url.search = "";
  url.hash = "";
  return url.toString().replace(/\/+$/, "");
}

async function json(url: string): Promise<any> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.json();
}

async function findReadableContract(base: string): Promise<{
  address: string;
  methods: string[];
}> {
  const contractsRaw = await json(
    `${base}/api/v2/contracts?verified=true&limit=20&offset=0`,
  );
  const contracts = Array.isArray(contractsRaw) ? contractsRaw : [contractsRaw];

  for (const contract of contracts) {
    const contractAddress = address(contract.addr);
    const methodsRaw = await json(
      `${base}/api/v2/contracts/${contractAddress}/methods-read`,
    );
    const methods = (methodsRaw.methods ?? [])
      .filter((method: any) => Array.isArray(method.inputs) && method.inputs.length === 0)
      .map((method: any) => String(method.name));
    if (methods.length >= 2) return { address: contractAddress, methods };
  }
  throw new Error("no verified contract with two zero-argument read methods");
}

async function main(): Promise<void> {
  const mcpUrl = getMcpUrl();
  const client = await createMCPClient({
    transport: { type: "http", url: mcpUrl },
  });

  try {
    const tools = await client.tools();
    const required = [
      "list_validators",
      "list_tokens",
      "prepare_delegate",
      "prepare_undelegate",
      "rpc_native_balance",
      "rpc_token_balance",
      "rpc_read_contract",
      "rpc_multicall",
    ];
    for (const name of required) {
      assert(tools[name], `missing MCP tool: ${name}`);
    }

    const validators = dataOf(
      await tools.list_validators.execute({ limit: 1, offset: 0 }, callOpts),
    );
    assert(Array.isArray(validators) && validators.length > 0, "no validators returned");
    const validator = address(validators[0].addr);

    const delegate = dataOf(
      await tools.prepare_delegate.execute(
        { from, validator, amount: "0.000001" },
        callOpts,
      ),
    );
    assert(address(delegate.to) === validator, "delegate targets the wrong contract");
    assert(
      String(delegate.data).toLowerCase() ===
        `0x5c19a95c${from.slice(2).padStart(64, "0")}`,
      "delegate calldata does not encode delegate(from)",
    );

    const undelegate = dataOf(
      await tools.prepare_undelegate.execute(
        { from, validator, shares: "1" },
        callOpts,
      ),
    );
    assert(address(undelegate.to) === validator, "undelegate targets the wrong contract");
    assert(
      String(undelegate.data).toLowerCase().startsWith(
        `0x4d99dd16${from.slice(2).padStart(64, "0")}`,
      ),
      "undelegate calldata does not encode undelegate(from, shares)",
    );

    dataOf(await tools.rpc_native_balance.execute({ address: from }, callOpts));

    const tokens = dataOf(
      await tools.list_tokens.execute({ limit: 1, offset: 0 }, callOpts),
    );
    assert(Array.isArray(tokens) && tokens.length > 0, "no tokens returned");
    dataOf(
      await tools.rpc_token_balance.execute(
        { address: from, token: address(tokens[0].addr) },
        callOpts,
      ),
    );

    const readable = await findReadableContract(apiBase(mcpUrl));
    dataOf(
      await tools.rpc_read_contract.execute(
        { address: readable.address, method: readable.methods[0], args: [] },
        callOpts,
      ),
    );
    const multicall = dataOf(
      await tools.rpc_multicall.execute(
        {
          calls: readable.methods.slice(0, 2).map((method) => ({
            address: readable.address,
            method,
            args: [],
          })),
        },
        callOpts,
      ),
    );
    assert(
      Array.isArray(multicall) &&
        multicall.length === 2 &&
        multicall.every((item: any) => item.success === true),
      "rpc_multicall did not return two successful calls",
    );

    console.log(
      JSON.stringify(
        {
          status: "PASS",
          chainId: delegate.chainId,
          validator,
          delegateSelector: String(delegate.data).slice(0, 10),
          undelegateSelector: String(undelegate.data).slice(0, 10),
          readableContract: readable.address,
          rpcTools: 4,
          signed: false,
          broadcast: false,
        },
        null,
        2,
      ),
    );
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
