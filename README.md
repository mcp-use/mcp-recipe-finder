# Recipe Finder — Discover recipes in your chat

<p>
  <a href="https://github.com/mcp-use/mcp-use">Built with <b>mcp-use</b></a>
  &nbsp;
  <a href="https://github.com/mcp-use/mcp-use">
    <img src="https://img.shields.io/github/stars/mcp-use/mcp-use?style=social" alt="mcp-use stars">
  </a>
</p>

Recipe discovery MCP App with rich recipe cards. Search by ingredient or cuisine, get detailed recipes with instructions, and browse a built-in recipe catalog — all rendered as interactive cards in your chat.

![Recipe Finder Demo](./repo-assets/demo.gif)

## Try it now

Connect to the hosted instance:

```
https://bold-tree-1fe79.run.mcp-use.com/mcp
```

Or open the [Inspector](https://inspector.manufact.com/inspector?autoConnect=https%3A%2F%2Fbold-tree-1fe79.run.mcp-use.com%2Fmcp) to test it interactively.

### Setup on ChatGPT

1. Open **Settings** > **Apps and Connectors** > **Advanced Settings** and enable **Developer Mode**
2. Go to **Connectors** > **Create**, name it "Recipe Finder", paste the URL above
3. In a new chat, click **+** > **More** and select the Recipe Finder connector

### Setup on Claude

1. Open **Settings** > **Connectors** > **Add custom connector**
2. Paste the URL above and save
3. The Recipe Finder tools will be available in new conversations

## Features

- **Recipe cards** — beautiful recipe widgets with ingredients and instructions
- **Search** — find recipes by name, ingredient, or cuisine
- **Built-in catalog** — curated recipes with MCP resources
- **Streaming** — recipe details appear progressively
- **Meal planning** — get meal plan suggestions

## Tools

| Tool | Description |
|------|-------------|
| `search-recipes` | Search recipes by keyword or ingredient |
| `get-recipe` | Get full recipe details by name |
| `meal-plan` | Generate a meal plan |
| `recipe-suggestion` | Get a random recipe suggestion |

## Available Widgets

| Widget | Preview |
|--------|---------|
| `recipe-card` | <img src="./repo-assets/widget-recipe-card.png" width="500" /> |

## Local development

```bash
git clone https://github.com/mcp-use/mcp-recipe-finder.git
cd mcp-recipe-finder
npm install
npm run dev
```

## Deploy

```bash
npx mcp-use deploy
```

## Built with

- [mcp-use](https://github.com/mcp-use/mcp-use) — MCP server framework

## License

MIT
