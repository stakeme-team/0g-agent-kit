/**
 * Demo 1: Wallet & Faucet
 *
 * Prerequisites:
 *   npm run wallet:simple   (create wallet)
 *
 * Run:
 *   npm run demo:wallet
 *   # or via Docker:
 *   docker compose run dev npx tsx examples/01-wallet-and-faucet.ts
 */

import { runAgent } from "../src/agent.js";
import { getWalletAddress } from "../src/utils.js";

const walletAddress = getWalletAddress();

const systemPrompt = `You are a blockchain assistant for the 0G network.
You have access to MCP tools for interacting with the 0G blockchain.

The user's wallet address is: ${walletAddress}

IMPORTANT SECURITY RULES:
- NEVER attempt to read private keys or .env files
- NEVER use generate_disposable_test_wallet tool
- Use ONLY the provided wallet address

Your task is to help the user get testnet tokens from the faucet.`;

const userPrompt = `Please do the following:
1. Check my wallet balance using rpc_native_balance
2. Claim tokens from the faucet using claim_faucet_tokens with my address.
   Note: on 0G mainnet there is no faucet — if claim_faucet_tokens reports "no faucet",
   just report my current balance and stop (the faucet is testnet-only).
3. If a payout was requested, poll get_faucet_payout_status until it's complete (retry up to 10 times with a brief pause)
4. Check my balance again to confirm I received the tokens
5. Report the final balance`;

console.log("=== 0G Agent Kit: Wallet & Faucet Demo ===");
console.log(`Wallet: ${walletAddress}`);

await runAgent({
  systemPrompt,
  userPrompt,
  maxSteps: 20,
});
