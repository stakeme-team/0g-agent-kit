# Codex + 0G native-current MCP

Current Codex supports remote Streamable HTTP MCP directly. No STDIO bridge or `mcp-remote` installation is needed.

```toml
[mcp_servers.0g]
url = "https://0g.exploreme.pro/api/v1/mcp"
```

This is the source-contract URL pending release, not a production availability claim. Replace it in `.codex/config.toml` with a running local/operator-approved backend URL for development. Do not use the retired API hostname.

Start Codex from this folder; inspect its MCP connections and discovered tools. Ask: “Read indexer_info and list five latest blocks; state coverage limitations.” No wallet, signing daemon or private key is required.

Native-current tools are read-only. Pagination uses cursor and limit 1–100; look up validators by address. Legacy transaction preparation/broadcast, faucet, verification, DA and storage claims do not apply. If connection fails, verify deployment/URL first; an unreleased endpoint cannot be fixed with a transport bridge.
