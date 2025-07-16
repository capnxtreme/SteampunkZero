# MCP ChatGPT Image Generation - Usage Examples

This document provides examples of how to use the MCP ChatGPT Image Generation server with various AI assistants.

## Example Prompts for Claude Desktop

Once you have configured the MCP server in Claude Desktop, you can use these example prompts:

### Basic Image Generation

```
Using the ChatGPT image tools, generate an image of a futuristic city skyline at sunset with flying cars and neon lights.
```

### High-Quality Image Generation

```
Generate a high-quality image using DALL-E 3 of a majestic mountain landscape with a crystal-clear lake in the foreground, snow-capped peaks, and dramatic clouds. Use HD quality and natural style.
```

### Multiple Images (DALL-E 2 only)

```
Create 3 different images of cute robot characters using DALL-E 2. Each robot should have a unique design and color scheme.
```

### Wide Format Image

```
Generate a wide panoramic image (1792x1024) of an underwater coral reef scene with colorful fish, sea turtles, and rays of sunlight penetrating the water.
```

### Portrait Format Image

```
Create a tall portrait-oriented image (1024x1792) of a magical forest with towering ancient trees, glowing mushrooms, and mystical fog.
```

## Example Prompts for Image Editing (DALL-E 2 only)

### Basic Image Edit

```
I have an image at /path/to/beach.jpg. Edit it to add a sailboat on the horizon.
```

### Image Edit with Mask

```
Edit the image at /path/to/portrait.jpg using the mask at /path/to/mask.png to change the background to a cosmic nebula.
```

## Example Prompts for Image Variations (DALL-E 2 only)

### Create Variations

```
Create 3 variations of the image at /path/to/original.jpg, maintaining the same style but with slight differences.
```

## Advanced Examples

### Combining with Analysis

```
Generate an image of a data visualization dashboard showing various charts and graphs in a modern, minimalist style. Then describe what each element could represent.
```

### Creative Storytelling

```
Create an image of a mysterious ancient library with floating books and magical glowing orbs. Then write a short story intro based on this scene.
```

### Design Iteration

```
Generate an image of a modern coffee shop logo with a minimalist design. If I like it, we can create variations or refine the concept.
```

## Tips for Better Results

1. **Be Specific**: The more detailed your prompt, the better the results
2. **Specify Style**: Mention artistic styles, moods, or references
3. **Include Context**: Describe lighting, atmosphere, and composition
4. **Use Model Features**: 
   - For DALL-E 3: Specify HD quality for detailed images
   - For DALL-E 2: Generate multiple options to choose from

## Common Patterns

### Product Design
```
Generate an image of a sleek, modern smartwatch design with a holographic display showing health metrics and notifications.
```

### Architecture
```
Create an architectural visualization of a sustainable eco-friendly house with solar panels, green roof, and large windows, set in a forest clearing.
```

### Character Design
```
Design a friendly alien character for a children's book - purple skin, big expressive eyes, wearing a colorful space suit, waving hello.
```

### Abstract Art
```
Generate an abstract artwork inspired by music - flowing shapes, vibrant colors transitioning from cool blues to warm oranges, suggesting rhythm and melody.
```

## Error Handling Examples

If you encounter errors, here are some common solutions:

### API Key Issues
```
If you see "Invalid API key", make sure your OPENAI_API_KEY is correctly set in the .env file or Claude Desktop config.
```

### Size Limitations
```
Remember: DALL-E 3 only supports 1024x1024, 1792x1024, and 1024x1792 sizes.
DALL-E 2 supports 256x256, 512x512, and 1024x1024.
```

### File Path Issues
```
When editing images, use absolute paths or ensure the file exists:
/Users/username/Pictures/image.jpg (macOS)
C:\Users\username\Pictures\image.jpg (Windows)
```