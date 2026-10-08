import assert from "node:assert/strict";
import { createServer } from "node:http";
import test from "node:test";
import { runAgent } from "../src/agent.js";
import { closeMCPClient, getZeroGMCPClient } from "../src/mcp-client.js";

test("failed tool discovery releases the agent connection before another run", { timeout: 10_000 }, async () => {
  let initializations = 0;
  const server = createServer(async (req, res) => {
    if (req.method !== "POST") {
      res.writeHead(405).end();
      return;
    }
    let body = "";
    for await (const chunk of req) body += chunk;
    const request = JSON.parse(body);
    if (request.id === undefined) {
      res.writeHead(202).end();
      return;
    }
    res.setHeader("Content-Type", "application/json");
    if (request.method === "initialize") {
      initializations += 1;
      res.end(JSON.stringify({ jsonrpc: "2.0", id: request.id, result: {
        protocolVersion: "2025-03-26",
        capabilities: { tools: {} },
        serverInfo: { name: "discovery-failure-test", version: "1" },
      } }));
      return;
    }
    res.end(JSON.stringify({ jsonrpc: "2.0", id: request.id,
      error: { code: -32603, message: "Catalogue temporarily unavailable" },
    }));
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const previousUrl = process.env.ZEROG_MCP_URL;
  process.env.ZEROG_MCP_URL = `http://127.0.0.1:${address.port}/mcp`;
  try {
    await assert.rejects(runAgent({ systemPrompt: "Read only", userPrompt: "List blocks", verbose: false }),
      /Catalogue temporarily unavailable/);
    await getZeroGMCPClient();
    assert.equal(initializations, 2, "a failed run must not retain its initialized connection");
  } finally {
    await closeMCPClient();
    if (previousUrl === undefined) delete process.env.ZEROG_MCP_URL;
    else process.env.ZEROG_MCP_URL = previousUrl;
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});
