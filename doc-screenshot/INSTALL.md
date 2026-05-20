# doc-screenshot — Instalação do MCP

Esta skill depende do MCP `chrome-devtools` (oficial do Google). A skill em si
você obtém junto com o repositório; o MCP cada máquina instala uma vez.

## Pré-requisito

- Node.js instalado (o MCP roda via `npx`). Verifique com `node --version`.

## Instalar o MCP (Windows)

```
claude mcp add chrome-devtools -s user -- cmd /c npx -y chrome-devtools-mcp@latest
```

## Instalar o MCP (macOS / Linux)

```
claude mcp add chrome-devtools -s user -- npx -y chrome-devtools-mcp@latest
```

Depois reinicie o Claude Code e confirme com `/mcp` que `chrome-devtools`
aparece como conectado.
