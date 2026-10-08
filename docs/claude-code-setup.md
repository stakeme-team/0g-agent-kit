# Claude Code + 0G native-current MCP

Use a current Claude Code release with HTTP MCP support. Install dependencies with `npm ci` for SDK examples; wallet setup is not required.

The checked-in `.mcp.json` points to `https://0g.exploreme.pro/api/v1/mcp`, a source-contract endpoint pending release. Replace its URL with a running local/operator-approved service until released. The retired `api.0g.exploreme.pro/mcp` is not used.

Start `claude` in this checkout and inspect `/mcp` to verify discovery. Ask: “Use indexer_info to describe coverage, then list five latest indexed blocks.” Tools are read-only; do not request legacy /send, /deploy or /stake execution. MCP cannot sign or broadcast.

Existing local signing/guard utilities are separate from explorer reads. Never expose private keys, `.env`, keystores or passwords. Obsolete write/faucet skill integrations were removed; use docs/prompts.md instead. See README for catalogue and limitations.
