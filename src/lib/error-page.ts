export function renderErrorPage(error?: unknown): string {
  const errorMessage = error instanceof Error ? `${error.name}: ${error.message}\n${error.stack ?? ""}` : error ? String(error) : "";

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <title>PKA Helper — Erro no Carregamento</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 15px/1.5 system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 36rem; width: 100%; text-align: center; padding: 2rem; background: #1e293b; border-radius: 1rem; border: 1px solid #334155; }
      h1 { font-size: 1.35rem; margin: 0 0 0.5rem; color: #f8fafc; font-weight: bold; }
      p { color: #94a3b8; margin: 0 0 1.5rem; font-size: 0.9rem; }
      .actions { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; margin-bottom: 1.5rem; }
      a, button { padding: 0.6rem 1.25rem; border-radius: 0.5rem; font: inherit; cursor: pointer; text-decoration: none; border: 1px solid transparent; font-weight: 600; font-size: 0.875rem; }
      .primary { background: #3b82f6; color: #fff; }
      .secondary { background: #334155; color: #f8fafc; border-color: #475569; }
      pre { text-align: left; background: #0b0f19; color: #f87171; padding: 1rem; border-radius: 0.5rem; font-size: 0.75rem; overflow-x: auto; max-height: 250px; border: 1px solid #7f1d1d; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Ops! Ocorreu um erro no servidor (SSR)</h1>
      <p>Tentando restabelecer a conexão com a página inicial do PKA Helper.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Recarregar</button>
        <a class="secondary" href="/">Ir para o Início</a>
      </div>
      ${errorMessage ? `<pre><code>${errorMessage}</code></pre>` : ""}
    </div>
  </body>
</html>`;
}

