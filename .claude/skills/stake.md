---
name: stake
description: Delegate (stake) 0G to a validator, or review validators/APR
---

# /stake — 0G staking

Help the user stake 0G to a validator (mainnet, real funds — confirm amounts).

> ⚠️ **Mainnet — real funds.** `/stake` spends real 0G. Confirm the amount, and prefer secure mode so every signature needs your `y/n`. For a dry run, point the kit at a 0G testnet deployment first.

> 📌 **`validator` = the per-validator contract address**, i.e. the `addr` from `list_validators` / `get_validator` (0x-prefixed) — **not** the staking root contract. The server builds a `delegate(<your address>)` / `undelegate(<your address>, shares)` call **to that per-validator contract**, passing your own (`from`) address as the delegator.

## Review validators
1. `list_validators` — show active validators with commission.
2. `validator_apr` — show network/validator APR.
3. Help the user pick a validator — note its `addr` (the per-validator contract address; prefix with `0x`).

## Delegate
1. Get wallet: `grep WALLET_ADDRESS .env | cut -d'=' -f2`.
2. Check balance: `rpc_native_balance` for the wallet.
3. `prepare_delegate` with `from`=wallet, `validator`=the chosen validator's `addr` (0x-prefixed per-validator contract), `amount`=<0G to stake>.
4. Sign: `echo '<unsigned_tx>' | npx tsx scripts/sign-tx.ts`.
5. `broadcast_signed_raw_transaction` with the signed hex.
6. `wait_for_transaction` with the hash.
7. `validator_delegations` for the validator to confirm the delegation landed.

## Undelegate
Use `prepare_undelegate` (from=wallet, validator=per-validator contract `addr`, shares) → sign → broadcast → wait.

> Mainnet spends real 0G. In secure mode the signer daemon will ask for `y/n` per signature.
