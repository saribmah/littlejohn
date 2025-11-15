# Source Code Structure

This directory contains the organized source code for the Claude Agent API server.

## Directory Structure

```
src/
├── index.ts           # Main server entry point
├── app.ts             # Hono app configuration
├── config/            # Application configuration
│   └── index.ts       # Config exports
├── routes/            # Route handlers
│   ├── index.ts       # Route exports
│   ├── health.ts      # Health check endpoint
│   └── message.ts     # Message streaming endpoint
├── mcp/               # MCP (Model Context Protocol) tools
│   ├── index.ts       # MCP server setup
│   └── tools/         # Individual tool definitions
│       └── browser-info.ts
├── utils/             # Utility functions
│   └── sse.ts         # SSE streaming helpers
└── types/             # TypeScript type definitions
    └── index.ts       # Type exports
```

## Module Responsibilities

### `index.ts`
- Main entry point
- Starts the server
- Exports server configuration for Bun

### `app.ts`
- Creates and configures Hono app
- Sets up middleware (CORS)
- Registers routes

### `config/`
- Application configuration
- Environment variables
- Constants

### `routes/`
- HTTP route handlers
- Request/response logic
- Each route in its own file

### `mcp/`
- MCP server configuration
- Custom tool definitions
- Tool implementations

### `utils/`
- Shared utility functions
- Helper functions
- Common operations

### `types/`
- TypeScript type definitions
- Interfaces
- Type aliases

## Adding New Features

### Adding a New Route
1. Create a new file in `src/routes/`
2. Export the route handler function
3. Import and register it in `src/app.ts`

### Adding a New MCP Tool
1. Create a new file in `src/mcp/tools/`
2. Define the tool using the `tool()` function
3. Import and add it to the tools array in `src/mcp/index.ts`

### Adding Utilities
1. Create a new file in `src/utils/` or add to existing file
2. Export the utility functions
3. Import where needed

## Best Practices

- Keep files small and focused (single responsibility)
- Use TypeScript types from `src/types/`
- Export from index files for cleaner imports
- Document complex functions with JSDoc comments
- Separate concerns: routes, logic, utilities
