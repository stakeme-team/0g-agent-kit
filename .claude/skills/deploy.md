---
name: deploy
description: Deploy and verify a smart contract on 0G
---

# /deploy — Deploy & Verify Smart Contract

## Steps

1. Get wallet address:
   ```bash
   grep WALLET_ADDRESS .env | cut -d'=' -f2
   ```

2. Check balance using MCP `rpc_native_balance`. Deployment needs gas.

3. Read the compiled contract:
   ```bash
   cat contracts/compiled/SimpleStorage.json
   ```
   Extract the `bytecode` field (starts with 0x).

4. Prepare deployment transaction:
   - Call MCP `prepare_transaction` with:
     - `from`: wallet address
     - `data`: bytecode from step 3
     - Do NOT include `to` (contract creation)

5. Sign the transaction:
   ```bash
   echo '<unsigned_tx_json>' | npx tsx scripts/sign-tx.ts
   ```

6. Broadcast:
   - Call MCP `broadcast_signed_raw_transaction` with signed hex

7. Wait for receipt:
   - Call MCP `wait_for_transaction` with tx hash — the receipt's `contractAddress` is the deployed address

8. Verify the contract:
   - Call MCP `verifier_compiler_versions` to find Solidity versions
   - Read source: `cat contracts/SimpleStorage.sol`
   - Call MCP `verify_contract_std_json` with:
     - `address`: deployed contract address
     - `compilerType`: "solidity"
     - `compilerVersion`: matching version (e.g., "v0.8.28+commit.7893614a")
     - `standardJson`: Solidity standard JSON input with the source code

9. Test the contract:
   - Call MCP `rpc_read_contract` with:
     - `address`: contract address
     - `abi`: the ABI from compiled JSON
     - `functionName`: "retrieve"
   - Report the result

10. Report to user:
    - Contract address
    - Deployment tx hash
    - Verification status
    - Current stored value

## SECURITY
- NEVER read PRIVATE_KEY — use sign-tx.ts for signing
- NEVER access .env except for WALLET_ADDRESS
