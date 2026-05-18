# Teamcamp MCP Server

> **Unofficial** - This project is not affiliated with, endorsed by, or maintained by Teamcamp.

MCP server that exposes the [Teamcamp API](https://api.teamcamp.app) as tools for any MCP client (Claude Code, opencode, Cursor, etc.).

## Tools

### Auth

| Tool | Description |
|------|-------------|
| `verify_api_key` | Verify API key and return workspace details |

### Company

| Tool | Description |
|------|-------------|
| `get_users` | List all users in the workspace |
| `get_customers` | List all customers in the workspace |

### Project

| Tool | Description |
|------|-------------|
| `get_project_list` | Get all projects |
| `get_project` | Get project details by ID |
| `create_project` | Create a new project |
| `update_project` | Update project details |
| `delete_project` | Delete a project by ID |
| `get_project_groups` | Get project groups by project ID |

### Task

| Tool | Description |
|------|-------------|
| `get_task_list` | Get all tasks in a project (optional `complete` filter) |
| `get_task` | Get task details by ID |
| `create_task` | Create a new task |
| `update_task` | Update an existing task |
| `post_comment` | Post a comment on a task |

## Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/) (or npm/yarn)
- A Teamcamp API key - get one at [dash.teamcamp.app/settings/apikey](https://dash.teamcamp.app/settings/apikey)

## Installation

### From npm

```sh
# Global install (lets you use `teamcamp-mcp-server` directly)
pnpm add -g teamcamp-mcp-server

# Or via npx (no install needed)
npx teamcamp-mcp-server serve
```

### From source

```sh
git clone <repo-url>
cd teamcamp-mcp-server
pnpm install
pnpm run build
```

## Usage

Set your API key and run the server:

```sh
export TEAMCAMP_API_KEY=your_key_here
teamcamp-mcp-server serve
```

Or in one go:

```sh
TEAMCAMP_API_KEY=your_key_here teamcamp-mcp-server serve
```

### Development

```sh
TEAMCAMP_API_KEY=your_key_here pnpm dev
```

## Configuring with MCP clients

When installed globally, you can reference the command by name instead of a full path.

### opencode

Add to `~/.config/opencode/opencode.json`:

```json
{
  "mcp": {
    "teamcamp": {
      "type": "local",
      "command": ["teamcamp-mcp-server", "serve"],
      "environment": {
        "TEAMCAMP_API_KEY": "your_key_here"
      }
    }
  }
}
```

### Claude Code

```json
{
  "mcpServers": {
    "teamcamp": {
      "command": "teamcamp-mcp-server",
      "args": ["serve"],
      "env": {
        "TEAMCAMP_API_KEY": "your_key_here"
      }
    }
  }
}
```

### Cursor / others

Same pattern - command `teamcamp-mcp-server` with arg `serve` and `TEAMCAMP_API_KEY` env var.

> If you haven't installed globally, use `npx teamcamp-mcp-server serve` instead, or provide the full path to `dist/index.js`.

## API Reference

All endpoints use the base URL `https://api.teamcamp.app/v1.0/` and authenticate via the `apiKey` header. See the [full API docs](https://api.teamcamp.app/api-reference/introduction) for details.
