import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import { SectionTitle, Panel } from "@/components/pka/ui";
import { buildContext, generateDirectAnswer } from "@/lib/assistant-context";
import { DB_UPDATED_AT } from "@/lib/pka";
import { Bot, User, Send, Copy, Check, RotateCcw, Sparkles, Terminal, Flame, Shield, HelpCircle } from "lucide-react";

export const Route = createFileRoute("/assistente")({
  head: () => ({
    meta: [
      { title: "Assistente PKA — Inteligência Artificial do PokeAlliance" },
      {
        name: "description",
        content: "Faça perguntas em linguagem natural sobre rotas de level up, comandos, brokes, star ascension, drops e counters do PokeAlliance.",
      },
      { property: "og:title", content: "Assistente PKA" },
      { property: "og:description", content: "Respostas precisas treinadas com a base e wiki do PokeAlliance." },
    ],
  }),
  component: Assistant,
});

type Msg = { role: "user" | "assistant"; content: string };

const EXAMPLE_CATEGORIES = [
  {
    category: "🚀 Level Up & Iniciantes",
    icon: Flame,
    questions: [
      "Como upar do level 1 ao 100 rápido?",
      "Onde upar level 80 com Dugtrio?",
      "Como funciona a evolução do Steelix?",
    ],
  },
  {
    category: "⌨️ Comandos & Atalhos",
    icon: Terminal,
    questions: [
      "Quais os comandos de casa (house)?",
      "Como subir e descer no Fly?",
      "Como dar teleport para cidades?",
    ],
  },
  {
    category: "⭐ Estrelas, Brokes & Boost",
    icon: Sparkles,
    questions: [
      "Quanto custa estrelar um T3 de 0 a 5?",
      "Qual a tabela de brokes máximas por tier?",
      "Quais itens são usados no boost de Fogo?",
    ],
  },
  {
    category: "🐾 Drops, Spawns & Counters",
    icon: Shield,
    questions: [
      "O que o Gengar dropa e onde fica?",
      "Onde posso caçar Dratini e Charmeleon?",
      "Qual o counter dos NPCs da Equipe Rocket?",
    ],
  },
];

function FormattedContent({ content }: { content: string }) {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Render markdown-like sections
  const lines = content.split("\n");

  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // Headers
        if (trimmed.startsWith("### ")) {
          return (
            <h3 key={idx} className="text-base font-bold text-foreground pt-2 first:pt-0">
              {trimmed.replace(/^###\s+/, "")}
            </h3>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h2 key={idx} className="text-lg font-bold text-foreground pt-2 first:pt-0">
              {trimmed.replace(/^##\s+/, "")}
            </h2>
          );
        }

        // Horizontal line
        if (trimmed === "---" || trimmed === "***") {
          return <hr key={idx} className="my-2 border-border/60" />;
        }

        // Bullet points
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          const rawText = trimmed.replace(/^[-*]\s+/, "");
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="text-primary mt-1 shrink-0">•</span>
              <div className="flex-1 text-muted-foreground">{renderInline(rawText, handleCopy, copiedText)}</div>
            </div>
          );
        }

        // Empty line
        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        // Regular paragraph
        return (
          <p key={idx} className="text-muted-foreground">
            {renderInline(line, handleCopy, copiedText)}
          </p>
        );
      })}
    </div>
  );
}

function renderInline(text: string, onCopy: (txt: string) => void, copiedText: string | null) {
  // Regex to match `code/commands`, **bold**, *italic*, and [links](url)
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(regex);

  return parts.map((part, i) => {
    if (!part) return null;

    // Command / Inline code
    if (part.startsWith("`") && part.endsWith("`")) {
      const codeVal = part.slice(1, -1);
      const isCommand = codeVal.startsWith("!") || codeVal.startsWith("h ") || codeVal.includes("Ctrl");
      return (
        <span
          key={i}
          onClick={() => isCommand && onCopy(codeVal)}
          title={isCommand ? "Clique para copiar comando" : undefined}
          className={`inline-flex items-center gap-1 rounded bg-panel-strong px-1.5 py-0.5 font-mono text-xs text-primary border border-primary/20 transition-all ${
            isCommand ? "cursor-pointer hover:border-primary hover:bg-primary/10 active:scale-95" : ""
          }`}
        >
          <span>{codeVal}</span>
          {isCommand && (
            <span className="text-[10px] opacity-70">
              {copiedText === codeVal ? <Check className="inline size-3 text-success" /> : <Copy className="inline size-3" />}
            </span>
          )}
        </span>
      );
    }

    // Bold
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Italic
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={i} className="italic text-foreground/90">
          {part.slice(1, -1)}
        </em>
      );
    }

    // Markdown link
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch && linkMatch[1] && linkMatch[2]) {
      return (
        <a
          key={i}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline hover:text-primary/80 font-medium inline-flex items-center gap-0.5"
        >
          {linkMatch[1]}
        </a>
      );
    }

    return part;
  });
}

function Assistant() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const mutation = useMutation({
    mutationFn: async (question: string) => {
      try {
        const context = buildContext(question);
        const res = await fetch("/api/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question, context }),
        });

        if (!res.ok) {
          throw new Error("HTTP error " + res.status);
        }

        const data = await res.json();
        if (data.answer && data.answer.trim().length > 0) {
          return { answer: data.answer };
        }
        // Fallback to local intelligent answer generator if no answer or error
        return { answer: generateDirectAnswer(question) };
      } catch {
        // Fallback gracefully to instant local engine
        return { answer: generateDirectAnswer(question) };
      }
    },
    onSuccess: (res) => {
      setMessages((m) => [...m, { role: "assistant", content: res.answer }]);
    },
    onError: (_err, question) => {
      const fallbackAns = generateDirectAnswer(question);
      setMessages((m) => [...m, { role: "assistant", content: fallbackAns }]);
    },
  });

  const send = (q: string) => {
    const question = q.trim();
    if (!question || mutation.isPending) return;
    setMessages((m) => [...m, { role: "user", content: question }]);
    setInput("");
    mutation.mutate(question);
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionTitle
          icon="🤖"
          title="Assistente PKA"
          subtitle={`Inteligência Artificial treinada com a Wiki oficial e base do PKA (Atualizado em ${DB_UPDATED_AT})`}
        />
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-panel px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-danger/40 hover:text-danger"
          >
            <RotateCcw className="size-3.5" />
            <span>Nova Conversa</span>
          </button>
        )}
      </div>

      {messages.length === 0 ? (
        <div className="space-y-6">
          <Panel className="border-primary/20 bg-primary/5 p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                <Bot className="size-6" />
              </div>
              <div className="space-y-1">
                <h2 className="font-bold text-foreground text-sm sm:text-base">
                  Olá! Sou o Assistente IA do PokeAlliance.
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Fui treinado com todos os conhecimentos da **Wiki PKA**, guias de level up, listas de comandos, sistemas de star/boost, drops de criaturas e counters de NPCs.
                </p>
              </div>
            </div>
          </Panel>

          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <HelpCircle className="size-4 text-primary" />
              <span>Sugestões de Perguntas por Categoria:</span>
            </h2>

            <div className="grid gap-3 sm:grid-cols-2">
              {EXAMPLE_CATEGORIES.map((cat, ci) => {
                const IconComp = cat.icon;
                return (
                  <div key={ci} className="rounded-xl border border-border bg-panel p-4 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                      <IconComp className="size-4 text-primary" />
                      <span>{cat.category}</span>
                    </div>
                    <div className="space-y-1.5">
                      {cat.questions.map((q, qi) => (
                        <button
                          key={qi}
                          onClick={() => send(q)}
                          className="w-full text-left rounded-lg border border-border/70 bg-panel-strong px-3 py-2 text-xs text-muted-foreground transition-all hover:border-primary/50 hover:bg-primary/5 hover:text-foreground"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4 min-h-[300px]">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 ${
                m.role === "user" ? "ml-auto max-w-[85%] flex-row-reverse" : "mr-auto max-w-[95%]"
              }`}
            >
              <div
                className={`size-8 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "border border-primary/40 bg-panel-strong text-primary shadow-sm"
                }`}
              >
                {m.role === "user" ? <User className="size-4" /> : <Bot className="size-4" />}
              </div>

              <div
                className={`rounded-xl border p-4 text-sm shadow-sm ${
                  m.role === "user"
                    ? "border-primary/40 bg-primary/10 text-foreground"
                    : "border-border bg-panel text-foreground"
                }`}
              >
                {m.role === "user" ? (
                  <p className="whitespace-pre-line font-medium">{m.content}</p>
                ) : (
                  <FormattedContent content={m.content} />
                )}
              </div>
            </div>
          ))}

          {mutation.isPending && (
            <div className="mr-auto max-w-[95%] flex items-start gap-3">
              <div className="size-8 shrink-0 rounded-full border border-primary/40 bg-panel-strong text-primary flex items-center justify-center shadow-sm">
                <Bot className="size-4 animate-spin text-primary" />
              </div>
              <div className="rounded-xl border border-border bg-panel p-4 text-sm text-muted-foreground flex items-center gap-2">
                <span className="inline-block size-2 animate-ping rounded-full bg-primary" />
                <span>Consultando a base de dados da Wiki PKA...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="sticky bottom-4 z-10 flex gap-2 rounded-xl border border-border bg-background/90 p-1.5 backdrop-blur shadow-lg"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pergunte sobre rotas de up, comandos, brokes, drops, counters..."
          aria-label="Sua pergunta"
          className="h-12 flex-1 rounded-lg border-0 bg-panel px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          type="submit"
          disabled={mutation.isPending || !input.trim()}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Enviar</span>
          <Send className="size-4" />
        </button>
      </form>
    </div>
  );
}
