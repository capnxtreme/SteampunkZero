#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import dotenv from 'dotenv';
import { SourceManager } from './source-manager.js';
import { SearchParamsSchema } from './types.js';

// Load environment variables
dotenv.config();

// Initialize source manager with API keys from environment
const sourceManager = new SourceManager({
  unsplash: {
    accessKey: process.env.UNSPLASH_ACCESS_KEY || '',
  },
  pexels: {
    apiKey: process.env.PEXELS_API_KEY || '',
  },
  pixabay: {
    apiKey: process.env.PIXABAY_API_KEY || '',
  },
});

// Create MCP server
const server = new Server(
  {
    name: 'mcp-image-sources',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define tools
const TOOLS = [
  {
    name: 'search_images',
    description: 'Search for public domain or open license images from multiple sources',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query for images',
        },
        sources: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['unsplash', 'pexels', 'pixabay', 'wikimedia', 'openlibrary', 'metmuseum', 'smithsonian'],
          },
          description: 'Specific sources to search (optional, defaults to all available)',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results per source (1-100, default: 20)',
          minimum: 1,
          maximum: 100,
        },
        page: {
          type: 'number',
          description: 'Page number for pagination (default: 1)',
          minimum: 1,
        },
        license: {
          type: 'string',
          enum: ['public-domain', 'cc0', 'cc-by', 'cc-by-sa', 'any'],
          description: 'Filter by license type',
        },
        orientation: {
          type: 'string',
          enum: ['landscape', 'portrait', 'square', 'any'],
          description: 'Filter by image orientation',
        },
        color: {
          type: 'string',
          description: 'Filter by dominant color (e.g., "red", "blue")',
        },
        minWidth: {
          type: 'number',
          description: 'Minimum image width in pixels',
        },
        minHeight: {
          type: 'number',
          description: 'Minimum image height in pixels',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'search_single_source',
    description: 'Search for images from a specific source',
    inputSchema: {
      type: 'object',
      properties: {
        source: {
          type: 'string',
          enum: ['unsplash', 'pexels', 'pixabay', 'wikimedia', 'openlibrary', 'metmuseum', 'smithsonian'],
          description: 'Image source to search',
        },
        query: {
          type: 'string',
          description: 'Search query for images',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results (1-100, default: 20)',
          minimum: 1,
          maximum: 100,
        },
        page: {
          type: 'number',
          description: 'Page number for pagination (default: 1)',
          minimum: 1,
        },
        license: {
          type: 'string',
          enum: ['public-domain', 'cc0', 'cc-by', 'cc-by-sa', 'any'],
          description: 'Filter by license type',
        },
        orientation: {
          type: 'string',
          enum: ['landscape', 'portrait', 'square', 'any'],
          description: 'Filter by image orientation',
        },
      },
      required: ['source', 'query'],
    },
  },
  {
    name: 'get_image_details',
    description: 'Get detailed information about a specific image',
    inputSchema: {
      type: 'object',
      properties: {
        source: {
          type: 'string',
          enum: ['unsplash', 'pexels', 'pixabay', 'wikimedia', 'openlibrary', 'metmuseum', 'smithsonian'],
          description: 'Image source',
        },
        imageId: {
          type: 'string',
          description: 'Image ID from the source',
        },
      },
      required: ['source', 'imageId'],
    },
  },
  {
    name: 'list_available_sources',
    description: 'List all available image sources and their status',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

// Handle list tools request
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: TOOLS,
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  try {
    switch (name) {
      case 'search_images': {
        const params = SearchParamsSchema.parse(args);
        const sources = args.sources as string[] | undefined;
        
        const { results, errors } = await sourceManager.searchAll(params, sources);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                totalResults: results.length,
                images: results,
                errors: errors.length > 0 ? errors : undefined,
              }, null, 2),
            },
          ],
        };
      }
      
      case 'search_single_source': {
        const source = z.string().parse(args.source);
        const params = SearchParamsSchema.parse({
          query: args.query,
          limit: args.limit,
          page: args.page,
          license: args.license,
          orientation: args.orientation,
        });
        
        const results = await sourceManager.searchSingle(source, params);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                source,
                totalResults: results.length,
                images: results,
              }, null, 2),
            },
          ],
        };
      }
      
      case 'get_image_details': {
        const source = z.string().parse(args.source);
        const imageId = z.string().parse(args.imageId);
        
        const image = await sourceManager.getImage(source, imageId);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                found: image !== null,
                image,
              }, null, 2),
            },
          ],
        };
      }
      
      case 'list_available_sources': {
        const sources = sourceManager.getAvailableSources();
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                sources,
                totalSources: sources.length,
              }, null, 2),
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
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Invalid parameters: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`
      );
    }
    
    throw new McpError(
      ErrorCode.InternalError,
      `Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error('MCP Image Sources server started');
  console.error('Available sources:', sourceManager.getAvailableSources().map(s => s.name).join(', '));
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});