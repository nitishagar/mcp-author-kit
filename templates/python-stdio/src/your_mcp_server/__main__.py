"""Entry point for the MCP server.

stdout is reserved for the MCP protocol; everything human-readable must go to
stderr. The logging module is configured to write to stderr below.
"""
from __future__ import annotations

import asyncio
import logging
import sys

from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import TextContent, Tool

logging.basicConfig(level=logging.INFO, stream=sys.stderr, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("your-mcp-server")

server: Server = Server("your-mcp-server")


@server.list_tools()
async def list_tools() -> list[Tool]:
    return [
        Tool(
            name="echo",
            description=(
                "Use when the user wants to echo a message back verbatim. "
                "Do not use to transform, summarise, or otherwise modify the message — "
                "this tool is intentionally a passthrough."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "message": {
                        "type": "string",
                        "description": "Message to echo back unchanged.",
                    },
                },
                "required": ["message"],
            },
        ),
    ]


@server.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent]:
    if name != "echo":
        raise ValueError(f"Unknown tool: {name}")
    message = arguments.get("message", "")
    return [TextContent(type="text", text=str(message))]


async def _serve() -> None:
    log.info("your-mcp-server starting on stdio")
    async with stdio_server() as (read_stream, write_stream):
        await server.run(read_stream, write_stream, server.create_initialization_options())


def main() -> None:
    asyncio.run(_serve())


if __name__ == "__main__":
    main()
