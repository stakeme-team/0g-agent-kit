# 0G Agent Kit

TypeScript client and agent integrations for the **0G native-current explorer MCP**, chain ID **16661**. The current service is **read-only**: explorer, accounts, validators and indexed staking data. It does not prepare transactions, sign, broadcast, provide a faucet, deploy/verify contracts or expose legacy DA/storage tools.

## Endpoint and release status

The source-contract endpoint is `https://0g.exploreme.pro/api/v1/mcp`, using MCP Streamable HTTP (protocol `2025-03-26`). It is **pending release**, not a claim of current production availability. During investigation the new public path returned 404 and the retired `https://api.0g.exploreme.pro/mcp` returned 502. A merge does not deploy the service.

For a running local or operator-approved deployment, set `ZEROG_MCP_URL` to its MCP URL. Do not use the retired API hostname. The SDK defaults to the source-contract URL; agent configuration files use the same URL and must be edited for local development.

## Quick start: no wallet required

```bash
npm ci
# Set ZEROG_MCP_URL to a running service; for example, a local backend:
export ZEROG_MCP_URL=http://127.0.0.1:8080/api/v1/mcp
npm run smoke:mcp
npm run demo:explorer
npm run demo:staking
```

PowerShell: `$env:ZEROG_MCP_URL = 'http://127.0.0.1:8080/api/v1/mcp'`.
The local port is an example, not a backend launch command.

For account reads, set **only a public address** (`WALLET_ADDRESS`) and run `npm run demo:account`. No private key, generated wallet, signer, faucet or AI API key is required for these SDK examples. Results retain server wei/shares decimal strings; do not convert them through JavaScript `Number`.

## Supported MCP tools

`tools/list` on the connected service is authoritative. Native-current source catalogue:

| Scope | Tools and inputs |
| --- | --- |
| Blocks and transactions | `list_blocks`, `get_block({id})`, `get_transaction({hash})` |
| Explorer | `gas_oracle`, `stats_overview`, `indexer_info`, `search({q})` |
| Accounts and tokens | `get_account({address})`, `list_tokens` |
| Validators | `list_validators`, `get_validator({address})`, `validator_statistics` |
| Account staking | `account_delegations({address})`, `account_undelegations({address})`, `account_staking_summary({address})` |
| Validator staking | `validator_delegations({address})`, `validator_undelegations({address})`, `staking_parameters` |

Paginated tools use `limit` (1–100) and string `cursor`, **not legacy `offset`**. For a numeric API `next_cursor`, pass `String(next_cursor)`; do not coerce wei/shares. Inspect each discovered input schema for supported fields. Validator lookups use the validator **address**, not an old `pool_id`.

Coverage is limited to what native-current indexes. Empty pages or unavailable records must not be described as complete chain coverage. Tool failures have `isError: true`; successful results carry `structuredContent: {status, data}`. `mcpData(result)` unwraps `data` without coercion and throws on protocol/tool errors rather than fabricating a zero balance.

```ts
import { getZeroGMCPClient, closeMCPClient, mcpData } from './src/index.js';

try {
  const tools = await (await getZeroGMCPClient()).tools();
  const result = await tools.list_blocks.execute!(
    { limit: 5 }, { toolCallId: 'blocks', messages: [] },
  );
  console.log(mcpData(result));
} finally {
  await closeMCPClient();
}
```

## Agent integrations

- [Claude Code](docs/claude-code-setup.md): `.mcp.json`, native HTTP.
- [Cursor](docs/cursor-setup.md): `.cursor/mcp.json`, remote HTTP URL.
- [Codex](docs/codex-setup.md): `.codex/config.toml`, native HTTP; no `mcp-remote` dependency.
- [Read-only prompts](docs/prompts.md).

For Vercel AI SDK agents, use `runAgent({systemPrompt, userPrompt})` and configure `AI_PROVIDER` plus the selected provider API key locally. `runAgent` exposes discovered MCP tools **without an automatic signing bridge**. The native service catalogue is read-only. Do not connect an untrusted write-capable MCP endpoint and assume it has the same contract.

`getMCPTools()` returns the pinned AI SDK 4's public `ToolSet`, adapting discovered schemas and cancellation without forwarding model messages to MCP.

Each `runAgent` call closes its MCP client on success or failure, including tool discovery failures, so a later call establishes a fresh connection.

## Local signing utilities are separate

Existing `wallet-manager.ts`, `wallet.ts`, `sign-tx.ts`, keystore and signer-daemon utilities remain local-only. They are **not part of the native MCP read workflow**, and the service cannot provide unsigned transactions or broadcast signed ones. No remote server or model needs your private key. Never send `.env`, keystores or passwords to an agent/server.

If an operator independently uses local signing, secure mode with `npm run signer -- --manual` requires approval for each request. The unchanged daemon also has an automatic mode; do not run it for unattended mainnet execution. Chain 16661 uses real funds. This kit has no automatic mainnet execution examples and no implicit sign/broadcast path.

The existing guard hook blocks common secret-reading shell commands; it is not a sandbox or a guarantee against every possible command. Obsolete `/wallet`, `/send`, `/deploy` and `/stake` skill integrations were removed rather than rewritten or granted new trust. Use the read-only prompts above.

## Verification

```bash
npm run check-types
npm test
npm run security-test
ZEROG_MCP_URL=http://127.0.0.1:8080/api/v1/mcp npm run smoke:mcp
```

`smoke:mcp` uses the real SDK initialize handshake, discovers the native tool catalogue, calls `indexer_info` and `list_blocks`, and closes the client. It does not load a wallet, sign, broadcast or mutate mainnet. Unit regressions cover error precedence, missing envelopes and exact wei/shares preservation. Security checks exercise the existing shell guard.

## Migration notes

The legacy remote endpoint, auto-sign bridge, transfer/deploy/faucet demos and staking execution script were removed from the active SDK workflow. Their advertised tools are absent from native-current. Read-only explorer/account/staking examples replace them; low-level local signing remains explicitly separate.
