#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import OpenAI from "openai";
import * as dotenv from "dotenv";
import * as fs from "fs/promises";
import * as path from "path";
import { fileURLToPath } from "url";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define the tools available
const TOOLS = {
  generate_image: {
    description: "Generate an image using DALL-E based on a text prompt",
    inputSchema: {
      type: "object",
      properties: {
        prompt: {
          type: "string",
          description: "A detailed description of the image to generate",
        },
        model: {
          type: "string",
          description: "The DALL-E model to use (dall-e-2 or dall-e-3)",
          enum: ["dall-e-2", "dall-e-3"],
          default: "dall-e-3",
        },
        size: {
          type: "string",
          description: "The size of the image to generate",
          enum: ["256x256", "512x512", "1024x1024", "1792x1024", "1024x1792"],
          default: "1024x1024",
        },
        quality: {
          type: "string",
          description: "The quality of the image (standard or hd, only for dall-e-3)",
          enum: ["standard", "hd"],
          default: "standard",
        },
        style: {
          type: "string",
          description: "The style of the image (vivid or natural, only for dall-e-3)",
          enum: ["vivid", "natural"],
          default: "vivid",
        },
        n: {
          type: "number",
          description: "Number of images to generate (1-10 for dall-e-2, only 1 for dall-e-3)",
          minimum: 1,
          maximum: 10,
          default: 1,
        },
      },
      required: ["prompt"],
    },
  },
  edit_image: {
    description: "Edit an image using DALL-E based on a prompt and mask",
    inputSchema: {
      type: "object",
      properties: {
        image_path: {
          type: "string",
          description: "Path to the original image file",
        },
        mask_path: {
          type: "string",
          description: "Path to the mask image file (optional)",
        },
        prompt: {
          type: "string",
          description: "A description of what should be generated in the masked area",
        },
        size: {
          type: "string",
          description: "The size of the output image",
          enum: ["256x256", "512x512", "1024x1024"],
          default: "1024x1024",
        },
        n: {
          type: "number",
          description: "Number of images to generate (1-10)",
          minimum: 1,
          maximum: 10,
          default: 1,
        },
      },
      required: ["image_path", "prompt"],
    },
  },
  create_variation: {
    description: "Create a variation of an existing image using DALL-E",
    inputSchema: {
      type: "object",
      properties: {
        image_path: {
          type: "string",
          description: "Path to the original image file",
        },
        size: {
          type: "string",
          description: "The size of the output image",
          enum: ["256x256", "512x512", "1024x1024"],
          default: "1024x1024",
        },
        n: {
          type: "number",
          description: "Number of variations to generate (1-10)",
          minimum: 1,
          maximum: 10,
          default: 1,
        },
      },
      required: ["image_path"],
    },
  },
};

// Create the MCP server
const server = new Server(
  {
    name: "mcp-chatgpt-image",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: Object.entries(TOOLS).map(([name, tool]) => ({
      name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    })),
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!TOOLS[name as keyof typeof TOOLS]) {
    throw new McpError(
      ErrorCode.MethodNotFound,
      `Unknown tool: ${name}`
    );
  }

  try {
    switch (name) {
      case "generate_image": {
        const { prompt, model = "dall-e-3", size = "1024x1024", quality = "standard", style = "vivid", n = 1 } = args as any;

        // Validate size based on model
        if (model === "dall-e-3" && !["1024x1024", "1792x1024", "1024x1792"].includes(size)) {
          throw new Error("DALL-E 3 only supports sizes: 1024x1024, 1792x1024, 1024x1792");
        }
        if (model === "dall-e-2" && !["256x256", "512x512", "1024x1024"].includes(size)) {
          throw new Error("DALL-E 2 only supports sizes: 256x256, 512x512, 1024x1024");
        }

        const response = await openai.images.generate({
          model,
          prompt,
          size: size as any,
          quality: model === "dall-e-3" ? quality : undefined,
          style: model === "dall-e-3" ? style : undefined,
          n: model === "dall-e-3" ? 1 : n, // DALL-E 3 only supports n=1
        });

        const imageUrls = response.data.map(img => img.url).filter(url => url !== undefined);
        
        return {
          content: [
            {
              type: "text",
              text: `Generated ${imageUrls.length} image(s) successfully.\n\nImage URLs:\n${imageUrls.join('\n')}\n\nPrompt: "${prompt}"\nModel: ${model}\nSize: ${size}`,
            },
          ],
        };
      }

      case "edit_image": {
        const { image_path, mask_path, prompt, size = "1024x1024", n = 1 } = args as any;

        // Read the image file
        const imageBuffer = await fs.readFile(image_path);
        const imageFile = new File([imageBuffer], path.basename(image_path), { type: "image/png" });

        // Read the mask file if provided
        let maskFile: File | undefined;
        if (mask_path) {
          const maskBuffer = await fs.readFile(mask_path);
          maskFile = new File([maskBuffer], path.basename(mask_path), { type: "image/png" });
        }

        const response = await openai.images.edit({
          model: "dall-e-2", // Only DALL-E 2 supports image editing
          image: imageFile,
          mask: maskFile,
          prompt,
          size: size as any,
          n,
        });

        const imageUrls = response.data.map(img => img.url).filter(url => url !== undefined);
        
        return {
          content: [
            {
              type: "text",
              text: `Edited image successfully.\n\nEdited Image URLs:\n${imageUrls.join('\n')}\n\nPrompt: "${prompt}"\nOriginal: ${image_path}${mask_path ? `\nMask: ${mask_path}` : ''}\nSize: ${size}`,
            },
          ],
        };
      }

      case "create_variation": {
        const { image_path, size = "1024x1024", n = 1 } = args as any;

        // Read the image file
        const imageBuffer = await fs.readFile(image_path);
        const imageFile = new File([imageBuffer], path.basename(image_path), { type: "image/png" });

        const response = await openai.images.createVariation({
          model: "dall-e-2", // Only DALL-E 2 supports variations
          image: imageFile,
          size: size as any,
          n,
        });

        const imageUrls = response.data.map(img => img.url).filter(url => url !== undefined);
        
        return {
          content: [
            {
              type: "text",
              text: `Created ${imageUrls.length} variation(s) successfully.\n\nVariation URLs:\n${imageUrls.join('\n')}\n\nOriginal: ${image_path}\nSize: ${size}`,
            },
          ],
        };
      }

      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${name}`
        );
    }
  } catch (error: any) {
    throw new McpError(
      ErrorCode.InternalError,
      `Error executing ${name}: ${error.message}`
    );
  }
});

// Start the server
async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error("Error: OPENAI_API_KEY environment variable is not set");
    console.error("Please set it in a .env file or as an environment variable");
    process.exit(1);
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP ChatGPT Image Generation Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});