# 0G Agent Kit usage

This kit connects to the 0G native-current **read-only** MCP catalogue, chain 16661. `.mcp.json` points to `https://0g.exploreme.pro/api/v1/mcp`, a source-contract endpoint pending release. Connection failure may mean it has not been deployed; use a running local/operator-approved endpoint for development, not the retired API hostname.

## Read workflow

Inspect `tools/list` and `indexer_info` before describing coverage. Supported tools are blocks/transactions (`list_blocks`, `get_block` with `id`, `get_transaction` with `hash`), explorer (`gas_oracle`, `stats_overview`, `indexer_info`, `search` with `q`), accounts/tokens (`get_account` with `address`, `list_tokens`), validators (`list_validators`, `get_validator` with `address`, `validator_statistics`) and indexed staking (`account_delegations`, `account_undelegations`, `account_staking_summary`, `validator_delegations`, `validator_undelegations`, `staking_parameters`). Account/validator scoped tools require a public EVM `address`; validators are not keyed by legacy pool IDs.

Paginated tools accept `limit` 1–100 and `cursor`, not `offset`. Preserve wei, tokens and shares as exact decimal strings. Retain API source, scope and availability metadata; null/unavailable values and empty pages are not proof of zero holdings or complete history. Tool errors have `isError: true`; data is under `structuredContent.data`.

## Unsupported workflows

No native-current transaction preparation, signing, broadcast, faucet, contract deployment/verification, DA or storage tools exist. Obsolete `/wallet`, `/send`, `/deploy` and `/stake` command integrations were removed. Do not invent replacement write workflows. `runAgent` does not attach automatic signing.

## Secrets and separate local utilities

Explorer reads need no private key or generated wallet. Use an explicitly supplied public address. Never read/disclose `.env`, private-key variables, `.keystore`, passwords or environment listings. Never send credentials to an AI model or MCP server. The shell guard remains enabled but is not a sandbox.

Standalone wallet/signing scripts remain local-only and are not needed for MCP. They must not be invoked by an explorer read workflow. Any independent operator-authorized mainnet signing uses real funds; prefer the secure daemon with `--manual` approval. Do not automatically sign or broadcast on mainnet.

## Commands

- `npm ci`
- `npm run demo:explorer` — coverage and recent blocks, no wallet
- `npm run demo:staking` — validators and staking parameters, no wallet
- `npm run demo:account` — account/staking reads for public `WALLET_ADDRESS`
- `npm run smoke:mcp` — real initialize/discovery/read calls against `ZEROG_MCP_URL`
- `npm run check-types`, `npm test`, `npm run security-test` — verification gates

See README and docs/prompts.md for setup and honest read-only prompts.
