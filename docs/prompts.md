# Ready-to-Use Prompts

Copy-paste these into Claude Code, Cursor, or Codex chat.

## Wallet & Faucet

```
Check if I have a wallet set up, and if so, check its balance.
```

```
Claim testnet tokens from the faucet for my wallet and show me the balance after.
```

## Send Tokens

```
Find a random address from the latest block on 0G and send 0.001 0G to it. Show me the transaction receipt.
```

```
Send 0.01 0G to address 0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18 and wait for confirmation.
```

## Deploy & Verify Contract

```
Deploy the SimpleStorage contract from contracts/SimpleStorage.sol to 0G and verify it on the explorer.
```

```
Deploy SimpleStorage, then call store(42), then call retrieve() to confirm the value was stored.
```

## Exploration

```
Show me the last 5 blocks on 0G with their transaction counts.
```

```
Search for the top ERC-20 tokens on 0G and show their details.
```

```
Look up my wallet's transaction history.
```

## 0G-native prompts

### Staking
- "List 0G validators by APR and show the top 5 with their commission."
- "Delegate 0.5 0G to validator <addr>: prepare, sign, broadcast, and confirm the delegation."
- "Show my current delegations and the network APR."

### Data Availability (DA)
- "Show 0G DA daily volume for the last 7 days."
- "List recent DA events and the active DA signers."

### Storage
- "List the latest 0G storage files and the top storage miners."
- "Show 0G storage daily volume trend this month."

### Explorer
- "Search 0G for <address-or-tx-or-block> and summarize what it is."
- "Give me a 0G network overview: latest block, tx throughput, gas, native price."
