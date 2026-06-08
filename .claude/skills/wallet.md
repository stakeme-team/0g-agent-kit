---
name: wallet
description: Create wallet and claim testnet tokens from faucet
---

# /wallet — Wallet Setup & Faucet

## Steps

1. Check if wallet exists:
   ```bash
   grep WALLET_ADDRESS .env | cut -d'=' -f2
   ```

2. If no wallet address found, tell the user:
   > Run `npm run wallet:simple` or `npm run wallet:secure` to create a wallet first.
   Then stop.

3. Get the wallet address from the output above.

4. Check current balance using MCP tool `get_balance` with the wallet address.

5. If balance is 0 or low, claim faucet tokens:
   - Call MCP `claim_faucet_tokens` with `address` = wallet address
   - Note the `requestId` from the response

6. Poll faucet status:
   - Call MCP `get_faucet_payout_status` with the `requestId`
   - If status is not "completed", wait a few seconds and poll again (max 10 attempts)

7. Verify final balance:
   - Call MCP `get_balance` with the wallet address
   - Report the balance to the user

## SECURITY
- NEVER read PRIVATE_KEY from .env
- NEVER use `generate_disposable_test_wallet` MCP tool
- ONLY read WALLET_ADDRESS from .env
