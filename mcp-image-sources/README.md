# MCP Image Sources Server

A Model Context Protocol (MCP) server that provides access to public domain and open license images from multiple sources.

## Features

- Search images across multiple sources simultaneously
- Filter by license type (public domain, CC0, CC-BY, CC-BY-SA)
- Filter by orientation, color, and size
- Built-in caching for improved performance
- Supports pagination for large result sets

## Supported Image Sources

### No Authentication Required
- **Wikimedia Commons** - Millions of freely licensed media files
- **Open Library** - Book covers and author photos
- **Metropolitan Museum of Art** - Public domain artworks
- **Smithsonian Open Access** - Millions of items from Smithsonian collections

### API Key Required
- **Unsplash** - High-quality photos with flexible licensing
- **Pexels** - Free stock photos
- **Pixabay** - Free images with various licenses

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd mcp-image-sources

# Install dependencies
npm install

# Build the project
npm run build
```

## Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Add your API keys to `.env`:
```env
UNSPLASH_ACCESS_KEY=your_unsplash_access_key
PEXELS_API_KEY=your_pexels_api_key
PIXABAY_API_KEY=your_pixabay_api_key
```

### Getting API Keys

- **Unsplash**: Sign up at [Unsplash Developers](https://unsplash.com/developers)
- **Pexels**: Get your key at [Pexels API](https://www.pexels.com/api/)
- **Pixabay**: Register at [Pixabay API](https://pixabay.com/api/docs/)

## Usage

### As an MCP Server

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "image-sources": {
      "command": "node",
      "args": ["path/to/mcp-image-sources/dist/index.js"]
    }
  }
}
```

### Available Tools

#### 1. `search_images`
Search for images across multiple sources.

**Parameters:**
- `query` (required): Search query
- `sources`: Array of source IDs to search (optional)
- `limit`: Max results per source (1-100, default: 20)
- `page`: Page number for pagination
- `license`: Filter by license type
- `orientation`: Filter by orientation (landscape/portrait/square)
- `color`: Filter by dominant color
- `minWidth`: Minimum width in pixels
- `minHeight`: Minimum height in pixels

**Example:**
```json
{
  "query": "mountains",
  "sources": ["unsplash", "wikimedia"],
  "limit": 10,
  "license": "cc0"
}
```

#### 2. `search_single_source`
Search images from a specific source.

**Parameters:**
- `source` (required): Source ID
- `query` (required): Search query
- Other parameters same as `search_images`

#### 3. `get_image_details`
Get detailed information about a specific image.

**Parameters:**
- `source` (required): Source ID
- `imageId` (required): Image ID from the source

#### 4. `list_available_sources`
List all available image sources and their status.

## Response Format

### Image Metadata
Each image result includes:
```json
{
  "id": "unique-image-id",
  "url": "https://...",
  "thumbnailUrl": "https://...",
  "title": "Image Title",
  "description": "Image description",
  "author": "Author Name",
  "authorUrl": "https://...",
  "license": "CC0",
  "licenseUrl": "https://...",
  "source": "Unsplash",
  "width": 4000,
  "height": 3000,
  "tags": ["nature", "mountain"],
  "downloadUrl": "https://..."
}
```

## Development

```bash
# Run in development mode
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

## License Types

- **Public Domain**: No copyright restrictions
- **CC0**: Creative Commons Zero - No rights reserved
- **CC-BY**: Attribution required
- **CC-BY-SA**: Attribution + ShareAlike

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details