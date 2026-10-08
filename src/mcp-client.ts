import { createMCPClient } from "@ai-sdk/mcp";
import { jsonSchema } from "ai";
import { getMcpUrl } from "./utils.js";

let mcpClient: Awaited<ReturnType<typeof createMCPClient>> | null = null;

export async function getZeroGMCPClient() {
  if (mcpClient) return mcpClient;

  const url = getMcpUrl();

  mcpClient = await createMCPClient({
    transport: {
      type: "http",
      url,
    },
  });

  return mcpClient;
}

export async function getMCPTools() {
  const client = await getZeroGMCPClient();
  const tools = await client.tools();
  // MCP SDK uses inputSchema; the pinned AI SDK 4 consumes parameters.
  return Object.fromEntries(Object.entries(tools).map(([name, tool]) => {
    const schema = tool.inputSchema;
    if (!schema || typeof schema !== "object" || !("jsonSchema" in schema)) {
      throw new Error(`Missing discovered JSON schema for MCP tool: ${name}`);
    }
    // Both SDK versions use JSON Schema; only their wrapper types differ.
    const parameters = schema.jsonSchema as Parameters<typeof jsonSchema>[0];
    return [name, {
      description: tool.description,
      parameters: jsonSchema(parameters),
      execute: tool.execute,
    }];
  }));
}

export async function closeMCPClient() {
  if (mcpClient) {
    await mcpClient.close();
    mcpClient = null;
  }
}
