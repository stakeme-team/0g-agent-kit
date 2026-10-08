# Read-only 0G prompts

Use tools/list from the connected native-current service as the authority. First ask indexer_info for indexed coverage; do not infer complete chain coverage from empty pages.

- “Describe indexer_info coverage and stats_overview.”
- “List five latest indexed blocks with list_blocks, then fetch one with get_block using its id.”
- “Look up transaction <hash> with get_transaction.”
- “Search for <query> using search with q.”
- “Read get_account for public address <address>; preserve all wei as decimal strings.”
- “List validators with limit 5; inspect a validator using get_validator with address, not pool_id.”
- “Show account_staking_summary, account_delegations and account_undelegations for public address <address>; preserve exact shares.”
- “Read staking_parameters and validator_statistics.”
- “Show the next page using the returned cursor as a string, without offset.”

Do not ask this service to transfer, delegate, withdraw, deploy, verify, claim a faucet, sign or broadcast: those capabilities are absent. No private key is required for reads.
