import type { VercelRequest, VercelResponse } from '@vercel/node';

const SYSTEM_PROMPT = `Você é o PKA Helper, assistente do jogo PokeAlliance (PKA).
Regras absolutas:
- Responda SOMENTE com base no CONTEXTO fornecido, que vem da planilha oficial da comunidade.
- Se a informação não estiver no contexto, diga claramente: "Não encontrei essa informação na base atual do PKA."
- Nunca invente drops, locais, tasks, custos ou nomes.
- Responda em português do Brasil, de forma curta, direta e organizada (listas quando fizer sentido).
- Inclua links do contexto quando existirem.`;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { question, context } = req.body || {};
  if (!question || !context) {
    return res.status(400).json({ error: 'Bad Request' });
  }

  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) return res.status(200).json({ answer: "", error: "A IA não está configurada neste projeto." });

  try {
    const fetchRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `CONTEXTO DA BASE PKA:\n${context}\n\nPERGUNTA: ${question}` },
        ],
      }),
    });

    if (fetchRes.status === 429) return res.status(200).json({ answer: "", error: "Muitas perguntas em pouco tempo. Tente de novo em instantes." });
    if (fetchRes.status === 402) return res.status(200).json({ answer: "", error: "Créditos de IA esgotados no workspace." });
    if (!fetchRes.ok) {
      console.error("AI gateway error", fetchRes.status, await fetchRes.text());
      return res.status(200).json({ answer: "", error: "A IA está indisponível agora. Tente novamente." });
    }

    const json = (await fetchRes.json()) as any;
    const answer = json.choices?.[0]?.message?.content?.trim() ?? "";
    if (!answer) return res.status(200).json({ answer: "", error: "A IA não retornou resposta. Tente reformular a pergunta." });
    
    return res.status(200).json({ answer, error: null });
  } catch (e) {
    console.error("AI gateway request failed", e);
    return res.status(200).json({ answer: "", error: "Falha ao falar com a IA. Tente novamente." });
  }
}
