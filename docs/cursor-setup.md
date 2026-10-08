# Cursor + 0G native-current MCP

Use a current Cursor release with remote MCP support. `.cursor/mcp.json` supplies the HTTP URL `https://0g.exploreme.pro/api/v1/mcp`. This source-contract endpoint is pending release; replace the URL with your running local/operator-approved backend when developing.

Open this folder in Cursor, inspect its MCP settings and confirm the discovered catalogue. Ask: “Show indexer_info and five validators using list_validators with limit 5.” No wallet or private key is required. Pagination uses cursor, not offset. Validator lookups use address, not pool_id.

Native-current is read-only and has limited indexed coverage. It cannot prepare transfers/delegations, deploy/verify contracts, claim faucets, sign or broadcast. Do not follow legacy write examples or expose `.env`/keystore files. See README for the supported catalogue.
