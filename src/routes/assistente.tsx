import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { SectionTitle, Panel } from "@/components/pka/ui";
import { buildContext } from "@/lib/assistant-context";
import { DB_UPDATED_AT } from "@/lib/pka";

export const Route = createFileRoute("/assistente")({
  head: () => ({
    meta: [
      { title: "Assistente PKA — Pergunte sobre o PokeAlliance" },
      { name: "description", content: "Faça perguntas em linguagem natural e receba respostas baseadas na base do PokeAlliance." },
      { property: "og:title", content: "Assistente PKA" },
      { property: "og:description", content: "Respostas sobre PokeAlliance baseadas na planilha da comunidade." },
    ],
  }),
  component: Assistant,
});

type Msg = { role: "user" | "assistant"; content: string };

const EXAMPLES = [
  "O que o Gengar dropa?",
  "Onde encontro Dratini?",
  "Quanto custa estrelar um T3 de 0 a 5?",
  "Quem dropa earth stone?",
];

function Assistant() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");

  const mutation = useMutation({
    mutationFn: async (question: string) => {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, context: buildContext(question) })
      });
      return res.json();
    },
    onSuccess: (res) =>
      setMessages((m) => [...m, { role: "assistant", content: res.error ? `⚠️ ${res.error}` : res.answer }]),
    onError: () => setMessages((m) => [...m, { role: "assistant", content: "⚠️ Erro ao consultar a IA." }]),
  });

  const send = (q: string) => {
    const question = q.trim();
    if (!question || mutation.isPending) return;
    setMessages((m) => [...m, { role: "user", content: question }]);
    setInput("");
    mutation.mutate(question);
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        icon="🤖"
        title="Assistente PKA"
        subtitle={`Respostas baseadas apenas na base do PKA (atualizada em ${DB_UPDATED_AT})`}
      />

      {messages.length === 0 ? (
        <Panel>
          <p className="mb-3 text-sm text-muted-foreground">Experimente perguntar:</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((e) => (
              <button
                key={e}
                onClick={() => send(e)}
                className="rounded-md border border-border bg-panel-strong px-3 py-1.5 text-sm hover:border-primary/50 hover:text-primary"
              >
                {e}
              </button>
            ))}
          </div>
        </Panel>
      ) : (
        <div className="space-y-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`rounded-lg border p-4 text-sm ${
                m.role === "user"
                  ? "ml-auto max-w-[85%] border-primary/40 bg-primary/10"
                  : "mr-auto max-w-[95%] border-border bg-panel"
              }`}
            >
              <p className="whitespace-pre-line">{m.content}</p>
            </div>
          ))}
          {mutation.isPending ? (
            <div className="mr-auto max-w-[95%] rounded-lg border border-border bg-panel p-4 text-sm text-muted-foreground">
              Consultando a base do PKA...
            </div>
          ) : null}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="sticky bottom-4 flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pergunte algo sobre o PKA..."
          aria-label="Sua pergunta"
          className="h-12 flex-1 rounded-md border border-input bg-panel px-4 text-sm focus:border-primary focus:outline-none"
        />
        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
