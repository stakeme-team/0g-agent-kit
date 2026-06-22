<div align="center">

<img src="assets/logo.svg" alt="0G Agent Kit" width="96" height="96">

# 0G Agent Kit

**All-in-one MCP toolkit for the [0G](https://0g.exploreme.pro) blockchain, in TypeScript.**

Wallet operations · local-only signing · transfers · contract deploy & verify · staking · full chain / DA / storage exploration — from **Claude Code**, **Cursor**, **Codex**, or directly via the **Vercel AI SDK**.

Built for **humans**. Perfect for **AI**.

[![MCP](https://img.shields.io/badge/MCP-server-6E56CF)](https://modelcontextprotocol.io)
[![0G](https://img.shields.io/badge/0G-mainnet_16661-00B3A4)](https://0g.exploreme.pro)
[![Docs](https://img.shields.io/badge/docs-0g.ai-2D6CDF)](https://docs.0g.ai)
[![Node](https://img.shields.io/badge/Node-%E2%89%A520-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![viem](https://img.shields.io/badge/built_with-viem-FFC517)](https://viem.sh)
[![License](https://img.shields.io/badge/License-MIT-blue)](#license)

</div>

---

## Why 0G Agent Kit

**Your private key never leaves your machine.** MCP only prepares *unsigned* transactions — signing happens locally, and the key is never sent to the AI model or a remote server.

**Two protection levels.**
- **Simple** — a guard hook blocks the agent from reading `.env`.
- **Secure** — encrypted keystore + a signing daemon in a separate, isolated process; the agent only ever receives the signed hex.

**Two ways to use.**
- **Subscription** (free) — connect MCP to Claude Code / Cursor / Codex and use your existing subscription.
- **AI SDK** (developers) — programmatic agents via the Vercel AI SDK with Claude or OpenAI.

**0G-native.** Beyond plain EVM: delegate to validators (`prepare_delegate`), read validator APR & delegations, and explore 0G **Data Availability** and **Storage** (`list_da_events`, `list_storage_files`, …).

> ⚠️ **Mainnet — real funds.** The default network is **0G mainnet (chainId 16661)**. `/send`, `/deploy`, and `/stake` move **real 0G**. There is **no faucet on mainnet** — fund your address from an exchange/bridge, or point the kit at **0G testnet (Galileo)** for free demos. Prefer **secure mode with manual approval** (`npm run signer -- --manual`) so every signature needs your `y/n`.

---

## Architecture

```
┌────────────────────────────┐
│  You (chat or code)        │
├────────────────────────────┤
│  AI Agent                  │
│  (Claude / GPT / local)    │
│                            │
│  Sees: wallet address,     │
│        MCP tool results    │
│  Never sees: private key   │
├──────────┬─────────────────┤
│ sign-tx  │  MCP Server     │
│ (local)  │  (remote)       │
│          │                 │
│ Signs tx │  prepare_*      │
│ locally  │  broadcast      │
│          │  query blocks   │
│ Key in   │  stake / verify │
│ .env or  │  DA / storage   │
│ keystore │  explorer       │
└──────────┴─────────────────┘
```

**Key principle:** the private key NEVER leaves your machine. MCP prepares the unsigned tx → you sign locally → the signed tx is broadcast back through MCP.

---

## Quick Start — Claude Code (subscription)

```bash
# Clone
git clone https://github.com/stakeme-team/0g-agent-kit
cd 0g-agent-kit

# Install (in Docker for supply-chain safety)
docker run --rm --network host -v "$(pwd):/app" -w /app node:20-alpine npm install

# Create a wallet
npx tsx scripts/wallet-manager.ts generate --simple

# Open Claude Code
claude
```

Claude Code auto-detects `.mcp.json` and connects to the 0G MCP server. Then just chat:

> *"Send 0.001 0G to a random address from the latest block"*

> See also: [Cursor setup](docs/cursor-setup.md) · [Codex setup](docs/codex-setup.md) · [ready-made prompts](docs/prompts.md)

---

## Quick Start — AI SDK (programmatic)

```bash
git clone https://github.com/stakeme-team/0g-agent-kit
cd 0g-agent-kit
docker run --rm --network host -v "$(pwd):/app" -w /app node:20-alpine npm install

cp .env.example .env
npx tsx scripts/wallet-manager.ts generate --simple
# Edit .env: add ANTHROPIC_API_KEY or OPENAI_API_KEY

npm run demo:wallet    # show wallet & balance (faucet = testnet only)
npm run demo:send      # send 0G to a random recent address
npm run demo:deploy    # deploy & verify a contract
```

Switch model provider in `.env`:

```env
AI_PROVIDER=anthropic   # or openai
```

---

## Skills

Built-in Claude Code / Cursor skills (slash commands):

| Skill | What it does |
|-------|--------------|
| `/wallet` | Show wallet address & native balance (claims faucet on testnet) |
| `/send` | Send 0G to a random address from a recent block |
| `/deploy` | Deploy **and** verify a smart contract |
| `/stake` | Delegate 0G to a validator, or review validators & APR *(see [Staking](#staking))* |

---

## Security

### Simple mode (default)

Private key in `.env`, protected by a guard hook that blocks the agent from reading it.

```bash
npx tsx scripts/wallet-manager.ts generate --simple
npm run security-test
# ✓ cat .env            → BLOCKED
# ✓ grep PRIVATE .env   → BLOCKED
# ✓ echo $PRIVATE_KEY   → BLOCKED
# ✓ python3 read .env   → BLOCKED
# ... 27/27 passed ✓
```

### Secure mode (signing daemon)

Private key encrypted in a keystore, decrypted only inside a separate daemon process. The agent physically cannot reach the key.

```bash
# Create an encrypted wallet
npx tsx scripts/wallet-manager.ts generate --secure

# Start the daemon (separate terminal)
npx tsx scripts/signer-daemon.ts            # auto-approve
npx tsx scripts/signer-daemon.ts --manual   # ask y/n per transaction
```

```
┌───────────────────┐     ┌───────────────────┐
│  Agent            │     │  Signer Daemon     │
│  (no key access)  │────▶│  (key in memory)   │
│                   │unix │                    │
│  Gets: signed hex │◀────│  Signs tx          │
└───────────────────┘sock └───────────────────┘
```

In `--manual` mode every signing request prints the tx details and waits for your `y/n` — ideal on mainnet.

### Docker isolation

```bash
docker compose run --rm install                  # install deps in a container
docker compose run --rm dev npx tsx examples/02-send-tokens.ts
docker compose up signer                          # signer daemon, NO network access
```

---

## Staking

`prepare_delegate` / `prepare_undelegate` build a transaction **to the per-validator contract** — the `addr` returned by `list_validators` / `get_validator` (0x-prefixed), **not** the staking root contract. The server encodes `delegate(address)` (selector `0x5c19a95c`) / `undelegate(address,uint256)` (`0x4d99dd16`) with **your own** (`from`) address as the delegator. So pass `validator` = the chosen validator's per-validator contract address, and `from` = your wallet. The **read** path — `list_validators`, `get_validator`, `validator_apr`, `validator_delegations` — returns the same `addr`.

> ⚠️ **Mainnet — real funds.** `/stake` spends real 0G; confirm the amount and prefer secure mode (`y/n` per signature). For a dry run, point the kit at a 0G testnet deployment first.

---

## MCP Tools

The 0G MCP server at `https://api.0g.exploreme.pro/mcp` exposes the explorer's read tools plus the write tools below:

| Category | Tools |
|----------|-------|
| **Transactions** (write) | `prepare_native_transfer`, `prepare_erc20_transfer`, `prepare_transaction`, `broadcast_signed_raw_transaction`, `wait_for_transaction` |
| **Staking** (write + read) | `prepare_delegate`, `prepare_undelegate`, `list_validators`, `get_validator`, `validator_delegations`, `validator_apr` |
| **Balances / accounts** | `rpc_native_balance`, `rpc_token_balance`, `get_account`, `list_account_transactions`, `list_account_tokens` |
| **Blocks / txs** | `list_blocks`, `get_block`, `get_transaction`, `tx_summary`, `list_transactions` |
| **Contracts** | `rpc_read_contract`, `get_contract`, `contract_code`, `verifier_compiler_versions`, `verify_contract_std_json`, `get_verification_status` |
| **Tokens / NFTs** | `list_tokens`, `get_token`, `list_token_holders`, `nft_instance_detail` |
| **0G DA / storage** | `list_da_events`, `da_daily_volume`, `list_da_signers`, `list_storage_files`, `get_storage_file`, `list_storage_miners`, `storage_daily_volume` |
| **Explorer** | `search`, `stats_overview`, `prices` |
| **Faucet** (testnet only) | `claim_faucet_tokens`, `get_faucet_payout_status` |

---

## Project Structure

```
0g-agent-kit/
├── CLAUDE.md                    # Agent instructions for 0G
├── .mcp.json                    # Claude Code MCP config
├── .cursor/mcp.json             # Cursor MCP config
├── .codex/config.toml           # Codex MCP config (via mcp-remote)
│
├── .claude/
│   ├── settings.json            # Guard hook config
│   └── skills/                  # /wallet · /send · /deploy · /stake
│
├── scripts/
│   ├── wallet-manager.ts        # Create / import wallet
│   ├── sign-tx.ts               # Sign tx (stdin → stdout)
│   ├── signer-daemon.ts         # Signing daemon (secure mode)
│   ├── guard.sh                 # Block agent from reading keys
│   ├── security-test.ts         # Test guard (20+ attack vectors)
│   └── run-stake-flow.ts        # Scripted delegate flow
│
├── src/                         # AI SDK core library
│   ├── mcp-client.ts            # MCP client factory
│   ├── wallet.ts                # Wallet (address only for the LLM)
│   ├── signing-bridge.ts        # Auto-sign prepare_* results
│   ├── agent.ts                 # Agent factory (Claude + OpenAI)
│   └── utils.ts                 # Helpers
│
├── examples/                    # AI SDK demos (wallet · send · deploy)
├── contracts/                   # SimpleStorage.sol (+ compiled)
├── docs/                        # setup guides + prompts
├── Dockerfile
└── docker-compose.yml
```

---

## Requirements

- **Node.js 20+** and **npm**
- **Docker** — optional, recommended for supply-chain-isolated installs and the network-less signer
- **Subscription path:** Claude Pro/Max, Cursor Pro, or ChatGPT Pro
- **AI SDK path:** an Anthropic or OpenAI API key

### Run against 0G testnet (Galileo)

For free, low-risk demos, point the kit at a 0G MCP server configured for testnet (chainId `16602`, RPC `https://evmrpc-testnet.0g.ai`, faucet `https://faucet.0g.ai`) and set `ZEROG_MCP_URL` in `.env` accordingly.

---

## License

MIT
