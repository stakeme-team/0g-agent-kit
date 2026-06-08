# 0G Agent Kit

You are working with the **0G blockchain** through an MCP server. This file tells you how to interact with it safely and effectively.

> ⚠️ **MAINNET — REAL FUNDS.** The default network is 0G mainnet (chainId 16661). `prepare_native_transfer` / `prepare_transaction` move **real 0G**. Prefer **secure mode with manual approval** (`npm run signer -- --manual`) so every signature needs your `y/n`. There is **no faucet on mainnet**.

## MCP Server

The 0G MCP server is connected automatically via `.mcp.json` (`https://api.0g.exploreme.pro/mcp`). Key tools:

- **Transactions (write):** `prepare_native_transfer`, `prepare_erc20_transfer`, `prepare_transaction`, `broadcast_signed_raw_transaction`, `wait_for_transaction`
- **Balances / accounts (read):** `rpc_native_balance`, `rpc_token_balance`, `get_account`, `list_account_transactions`, `list_account_tokens`
- **Blocks / txs (read):** `list_blocks`, `get_block`, `get_transaction`, `tx_summary`, `list_transactions`
- **Contracts (read + verify):** `rpc_read_contract`, `get_contract`, `contract_code`, `verifier_compiler_versions`, `verify_contract_std_json`, `get_verification_status`
- **Tokens / NFTs (read):** `list_tokens`, `get_token`, `list_token_holders`, `nft_instance_detail`
- **Staking (write + read):** `prepare_delegate`, `prepare_undelegate`, `list_validators`, `get_validator`, `validator_delegations`, `validator_apr`
- **0G DA / storage (read):** `list_da_events`, `da_daily_volume`, `list_da_signers`, `list_storage_files`, `get_storage_file`, `list_storage_miners`, `storage_daily_volume`
- **Explorer (read):** `search`, `stats_overview`, `prices`
- **Faucet (testnet only):** `claim_faucet_tokens`, `get_faucet_payout_status`

## SECURITY RULES — MANDATORY

### NEVER do any of the following:
- Read the `.env` file (cat, head, tail, less, grep, or any other method)
- Read the `.keystore/` directory or any files in it
- Access, print, or log the `PRIVATE_KEY` environment variable
- Run `env`, `printenv`, `set`, or `export` to list environment variables
- Store, display, or transmit any private key in any form

### Wallet address
Read `WALLET_ADDRESS` from `.env` using grep — this is the ONLY value you may read from `.env`:
```bash
grep WALLET_ADDRESS .env | cut -d'=' -f2
```

## Transaction Signing Flow

You CANNOT sign transactions directly. Use the signing script:

1. **Prepare** via MCP: call `prepare_native_transfer` / `prepare_transaction` → unsigned tx JSON.
2. **Sign** locally: `echo '<unsigned_tx_json>' | npx tsx scripts/sign-tx.ts` → prints ONLY the signed hex.
3. **Broadcast** via MCP: `broadcast_signed_raw_transaction` with the signed hex.
4. **Confirm** via MCP: `wait_for_transaction` with the returned hash.

## Contract Deployment Flow

1. Read bytecode from `contracts/compiled/SimpleStorage.json`.
2. `prepare_transaction` with `from`=wallet, **no** `to`, `data`=bytecode.
3. Sign: `echo '<unsigned_tx>' | npx tsx scripts/sign-tx.ts`.
4. `broadcast_signed_raw_transaction`.
5. `wait_for_transaction` — the receipt's `contractAddress` is the deployed address.
6. Verify: `verifier_compiler_versions` → then `verify_contract_std_json` with address + standard-JSON input.

## Staking Flow (0G-native)

1. `list_validators` → choose a validator (note its address + `validator_apr`).
2. `prepare_delegate` with `from`=wallet, `validator`=address, `amount`=0G to stake.
3. Sign → `broadcast_signed_raw_transaction` → `wait_for_transaction`.
4. `validator_delegations` (or `get_account`) to confirm the new delegation.

> ⚠️ **Experimental write path — verify on testnet first.** The 0G staking contract is a BeaconProxy and its delegate ABI could not be confirmed, so `prepare_delegate` / `prepare_undelegate` use a best-effort `delegate(address)` / `undelegate(address,uint256)` signature. The READ path (`list_validators`, `validator_apr`, `validator_delegations`) is solid. If a delegation reverts, treat staking writes as experimental and confirm against a testnet deployment before spending real 0G.

## Faucet Flow (testnet only)

On mainnet there is no faucet — `claim_faucet_tokens` will say so. On a testnet deployment: `claim_faucet_tokens` with your address → poll `get_faucet_payout_status` → `rpc_native_balance` to confirm.

## Available Scripts
- `npx tsx scripts/sign-tx.ts` — sign tx (stdin JSON → stdout signed hex)
- `npx tsx scripts/wallet-manager.ts` — wallet management (USER runs this, not the agent)
- `npx tsx scripts/signer-daemon.ts` — signing daemon, secure mode (USER runs this)
