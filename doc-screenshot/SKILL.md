---
name: doc-screenshot
description: Use when the user asks to document an app page or screen ("documente a página X", "tira print anotado da tela Y") — captures annotated screenshots (numbered click order or labeled options) via the Chrome DevTools MCP, saved under docs/screenshots/ for use in wiki docs.
---

# doc-screenshot

Documenta uma tela do app tirando um print e **anotando** a imagem — ordem de
cliques (pins numerados) ou descrição de opções (callouts). O resultado vai
para `docs/screenshots/<pagina>/`. A skill **não** sobe nada para a wiki.

## Pré-condições

1. O MCP `chrome-devtools` precisa estar disponível. Se as ferramentas
   `mcp__chrome-devtools__*` não existirem, mostre ao usuário o comando de
   instalação de `.claude/skills/doc-screenshot/INSTALL.md` e peça para
   reiniciar o Claude Code. Não continue.
2. O app ou site que você quer documentar precisa estar acessível por uma URL
   (local ou remota).

## Fluxo

### 1. Navegar
Use `navigate_page` para abrir a URL pedida (ou `new_page` se não houver aba).

### 2. Verificar login
Se a URL final cair em `/login`, **pause**: peça ao usuário para logar
manualmente no Chrome controlado pelo MCP e confirme antes de continuar. A
skill reaproveita a sessão aberta — não tenta logar sozinha.

### 3. Definir o modo
- **Numerado** — 1 print único com pins ①②③ marcando a ordem.
- **Sequência** — 1 print por passo; entre os passos a skill executa o clique.

Se o usuário não disse, pergunte.

### 4. Coletar os passos
O usuário descreve em linguagem natural ("clica no menu, depois Contas, depois
Salvar" / "descreve as opções do formulário"). Use `take_snapshot` para mapear
os elementos e escolher um seletor CSS estável para cada um.

### 5. Gerar os prints

Carregue o script de anotação uma vez:
- Leia `.claude/skills/doc-screenshot/annotate.js` (caminho relativo a esta skill).
- Para anotar, chame `evaluate_script` com uma função no formato:

```js
() => {
  /* conteúdo completo de annotate.js */
  return __docAnnotate(/* objeto spec */);
}
```

O `spec` é `{ items: [...] }`. Todo item tem um `selector` (CSS) obrigatório e
um `type`. Tipos e campos:
- `box` — caixa ao redor do elemento.
- `pin` — pino numerado; `number` opcional (sem ele, numera 1, 2, 3… na ordem dos itens).
- `callout` — `text` com o rótulo descritivo.
- `arrow` — `fromSide` opcional (`top`/`bottom`/`left`/`right`, padrão `top`), `length` opcional (padrão `80`).
- `spotlight` — escurece o resto da tela, destacando o elemento.
- `blur` — borra o elemento (esconder dados sensíveis).

`color` (`#hex`) é opcional em qualquer item; sem ele, usa a paleta padrão na
ordem dos itens. Para limpar o overlay, chame com `{ clear: true }`.

`__docAnnotate` retorna `{ drawn, missing }` — `drawn` é a contagem de itens
desenhados; `missing` lista os seletores não encontrados (ou itens sem seletor).

- **Modo numerado:** monte um único `spec` com todos os itens de anotação,
  injete, depois `take_screenshot` salvando em `docs/screenshots/<pagina>/fluxo.png`.
- **Modo sequência:** para cada passo — injete a anotação só daquele passo,
  `take_screenshot` em `docs/screenshots/<pagina>/NN-<slug>.png` (NN = 01, 02…),
  chame `{ clear: true }`, execute o `click` no elemento, e siga para o próximo.

`<pagina>` é um slug da tela (ex.: `dashboard`, `contas-nova`).

### 6. Gravar a legenda
Crie `docs/screenshots/<pagina>/legenda.md`:

```md
# <Página> — <YYYY-MM-DD>

## fluxo.png
1. <descrição do passo 1>
2. <descrição do passo 2>
```

Uma seção `##` por arquivo de imagem, com a lista numerada das marcações.

### 7. Resumo
Mostre no chat os prints gerados e o caminho da pasta. Se `missing` veio não
vazio em algum passo, liste os seletores que falharam.

## Casos de borda

- **MCP ausente** → comando de instalação + reiniciar; aborta (pré-condição 1).
- **Tela de login** → pausa e pede login manual (passo 2).
- **Elemento não encontrado** → `__docAnnotate` o pula e reporta em `missing`;
  anote o resto e avise no resumo. Não aborte.
- **`docs/screenshots/<pagina>/` já existe** → pergunte ao usuário se sobrescreve
  ou se usa outro slug (ex.: `<pagina>-v2`).

## Fora de escopo

Não suba imagens para a wiki, não crie/edite páginas, não pós-processe a
imagem. O `legenda.md` é a ponte: a publicação na wiki é um passo separado.
