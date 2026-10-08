interface MCPResult {
  isError?: boolean;
  content?: Array<{ type: string; text?: string }>;
  structuredContent?: { status?: unknown; data?: unknown };
}

/** Unwrap native-current results without rounding wei/shares or hiding errors. */
export function mcpData(result: unknown): unknown {
  if (!result || typeof result !== "object") {
    throw new Error("Invalid MCP result");
  }
  const response = result as MCPResult;
  if (response.isError) {
    const message = response.content?.find((item) => item.type === "text")?.text;
    throw new Error(message || "MCP tool returned an error");
  }
  const envelope = response.structuredContent;
  if (!envelope || !Object.prototype.hasOwnProperty.call(envelope, "data")) {
    throw new Error("MCP tool returned no structuredContent.data");
  }
  return envelope.data;
}
