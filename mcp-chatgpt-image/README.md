# MCP ChatGPT Image Generation Server

An MCP (Model Context Protocol) server that provides image generation capabilities using OpenAI's DALL-E API. This server allows AI assistants to generate, edit, and create variations of images through natural language prompts.

## Features

- **Generate Images**: Create images from text descriptions using DALL-E 2 or DALL-E 3
- **Edit Images**: Modify existing images with text prompts and optional masks
- **Create Variations**: Generate variations of existing images
- **Flexible Configuration**: Support for different image sizes, quality settings, and styles

## Prerequisites

- Node.js 18 or higher
- An OpenAI API key with access to DALL-E

## Installation

1. Clone or download this repository
2. Navigate to the project directory:
   ```bash
   cd mcp-chatgpt-image
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Copy `.env.example` to `.env` and add your OpenAI API key:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and replace `your_openai_api_key_here` with your actual API key.

## Building

To build the TypeScript code:

```bash
npm run build
```

## Usage

### Running with MCP Inspector

The easiest way to test the server is using the MCP Inspector:

```bash
npm run inspector
```

This will open the MCP Inspector where you can interact with the available tools.

### Running as a standalone server

For development:
```bash
npm run dev
```

For production:
```bash
npm run build
npm start
```

### Integrating with Claude Desktop

To use this MCP server with Claude Desktop, add the following to your Claude Desktop configuration file:

**On macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**On Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "chatgpt-image": {
      "command": "node",
      "args": ["/path/to/mcp-chatgpt-image/build/index.js"],
      "env": {
        "OPENAI_API_KEY": "your_openai_api_key_here"
      }
    }
  }
}
```

Replace `/path/to/mcp-chatgpt-image` with the actual path to this project directory.

Alternatively, if you have the server installed globally or want to use tsx directly:

```json
{
  "mcpServers": {
    "chatgpt-image": {
      "command": "npx",
      "args": ["tsx", "/path/to/mcp-chatgpt-image/src/index.ts"],
      "env": {
        "OPENAI_API_KEY": "your_openai_api_key_here"
      }
    }
  }
}
```

## Available Tools

### 1. generate_image

Generate an image from a text prompt.

**Parameters:**
- `prompt` (required): A detailed description of the image to generate
- `model`: The DALL-E model to use (`dall-e-2` or `dall-e-3`, default: `dall-e-3`)
- `size`: Image size (varies by model, default: `1024x1024`)
  - DALL-E 2: `256x256`, `512x512`, `1024x1024`
  - DALL-E 3: `1024x1024`, `1792x1024`, `1024x1792`
- `quality`: Image quality for DALL-E 3 (`standard` or `hd`, default: `standard`)
- `style`: Image style for DALL-E 3 (`vivid` or `natural`, default: `vivid`)
- `n`: Number of images to generate (1-10 for DALL-E 2, only 1 for DALL-E 3)

**Example:**
```
Generate an image of a serene Japanese garden with cherry blossoms
```

### 2. edit_image

Edit an existing image based on a prompt and optional mask.

**Parameters:**
- `image_path` (required): Path to the original image file
- `prompt` (required): Description of what should be generated
- `mask_path`: Path to the mask image file (optional)
- `size`: Output image size (`256x256`, `512x512`, or `1024x1024`)
- `n`: Number of edited images to generate (1-10)

**Note:** Only available with DALL-E 2.

### 3. create_variation

Create variations of an existing image.

**Parameters:**
- `image_path` (required): Path to the original image file
- `size`: Output image size (`256x256`, `512x512`, or `1024x1024`)
- `n`: Number of variations to generate (1-10)

**Note:** Only available with DALL-E 2.

## Error Handling

The server includes comprehensive error handling for:
- Missing API keys
- Invalid parameters
- API rate limits
- File reading errors
- Network issues

## Development

### Project Structure

```
mcp-chatgpt-image/
├── src/
│   └── index.ts        # Main server implementation
├── build/              # Compiled JavaScript (generated)
├── package.json        # Project dependencies
├── tsconfig.json       # TypeScript configuration
├── .env.example        # Example environment variables
├── .gitignore         # Git ignore rules
└── README.md          # This file
```

### Scripts

- `npm run build`: Build the TypeScript code
- `npm run dev`: Run in development mode with hot reload
- `npm start`: Run the built server
- `npm run inspector`: Run with MCP Inspector for testing

## API Limits and Pricing

- DALL-E API usage is subject to OpenAI's pricing
- Rate limits apply based on your OpenAI account tier
- Generated images are hosted temporarily by OpenAI

## Security Considerations

- Never commit your `.env` file with your API key
- Keep your OpenAI API key secure
- Be aware of costs associated with image generation
- Validate file paths when using edit_image or create_variation

## Troubleshooting

### Common Issues

1. **"OPENAI_API_KEY environment variable is not set"**
   - Make sure you've created a `.env` file with your API key
   - Ensure the `.env` file is in the project root directory

2. **"Invalid API key"**
   - Verify your API key is correct and has access to DALL-E
   - Check that your OpenAI account is active

3. **Rate limit errors**
   - You may have exceeded your API quota
   - Check your OpenAI dashboard for usage limits

4. **File not found errors**
   - Ensure image paths are correct when using edit_image or create_variation
   - Use absolute paths or paths relative to where the server is running

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues related to:
- This MCP server: Open an issue in this repository
- OpenAI API: Contact OpenAI support
- MCP protocol: See the MCP documentation