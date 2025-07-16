# Quick Start Guide

Get up and running with the MCP ChatGPT Image Generation Server in 5 minutes!

## 1. Prerequisites

- Node.js 18+ installed ([Download here](https://nodejs.org/))
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

## 2. Installation

### Option A: Using Setup Script (Recommended)

**On macOS/Linux:**
```bash
cd mcp-chatgpt-image
./setup.sh
```

**On Windows:**
```cmd
cd mcp-chatgpt-image
setup.bat
```

### Option B: Manual Setup

```bash
cd mcp-chatgpt-image
npm install
cp .env.example .env
# Edit .env and add your OpenAI API key
npm run build
```

## 3. Add Your API Key

Edit the `.env` file and replace `your_openai_api_key_here` with your actual OpenAI API key:

```
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
```

## 4. Test the Server

Run the MCP Inspector to test the server:

```bash
npm run inspector
```

This will open a web interface where you can:
1. See the available tools (generate_image, edit_image, create_variation)
2. Test image generation with sample prompts
3. View the server logs

## 5. Configure Claude Desktop

Add this to your Claude Desktop config file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "chatgpt-image": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-chatgpt-image/build/index.js"],
      "env": {
        "OPENAI_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

## 6. Restart Claude Desktop

After saving the config, restart Claude Desktop to load the MCP server.

## 7. Start Creating!

Try this prompt in Claude:
```
Generate an image of a cozy coffee shop on a rainy day with warm lighting and people reading books.
```

## Troubleshooting

- **"command not found: node"** → Install Node.js first
- **"Invalid API key"** → Check your OpenAI API key in .env
- **"Module not found"** → Run `npm install` in the project directory
- **Claude doesn't see the tools** → Restart Claude Desktop

## Need Help?

Check the full [README.md](README.md) for detailed documentation and advanced usage.