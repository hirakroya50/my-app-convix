import OpenAI from "openai";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

// MCP-style tool definitions for OpenAI function calling
export const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "getMenu",
      description:
        "Get the Brew Haven coffee shop menu with all available drinks and their prices",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "getTimings",
      description:
        "Get the Brew Haven coffee shop opening and closing hours",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "getServices",
      description:
        "Get the list of services offered by Brew Haven coffee shop (WiFi, takeaway, dine-in, etc.)",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
];

// Execute a tool call by querying the corresponding Convex function
export async function executeTool(
  convex: ConvexHttpClient,
  toolName: string,
): Promise<string> {
  switch (toolName) {
    case "getMenu":
      return JSON.stringify(await convex.query(api.tools.getMenu));
    case "getTimings":
      return JSON.stringify(await convex.query(api.tools.getTimings));
    case "getServices":
      return JSON.stringify(await convex.query(api.tools.getServices));
    default:
      return JSON.stringify({ error: `Unknown tool: ${toolName}` });
  }
}
