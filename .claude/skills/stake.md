---
name: stake
description: Delegate (stake) 0G to a validator, or review validators/APR
---

# /stake — 0G staking

Help the user stake 0G to a validator (mainnet, real funds — confirm amounts).

> ⚠️ **Experimental write path — verify on testnet first.** The 0G staking contract is a BeaconProxy whose delegate ABI could not be confirmed, so `prepare_delegate` / `prepare_undelegate` use a best-effort signature. The READ path (`list_validators`, `validator_apr`, `validator_delegations`) is solid. If a delegation reverts, confirm against a testnet deployment before spending real 0G.

## Review validators
1. `list_validators` — show active validators with commission.
2. `validator_apr` — show network/validator APR.
3. Help the user pick a validator (address).

## Delegate
1. Get wallet: `grep WALLET_ADDRESS .env | cut -d'=' -f2`.
2. Check balance: `rpc_native_balance` for the wallet.
3. `prepare_delegate` with `from`=wallet, `validator`=address, `amount`=<0G to stake>.
4. Sign: `echo '<unsigned_tx>' | npx tsx scripts/sign-tx.ts`.
5. `broadcast_signed_raw_transaction` with the signed hex.
6. `wait_for_transaction` with the hash.
7. `validator_delegations` for the validator to confirm the delegation landed.

## Undelegate
Use `prepare_undelegate` (from, validator, shares) → sign → broadcast → wait.

> Mainnet spends real 0G. In secure mode the signer daemon will ask for `y/n` per signature.
