import type { VercelRequest, VercelResponse } from '@vercel/node';

const SYSTEM_PROMPT = `Você é o PKA Helper, o assistente oficial de inteligência artificial do PokeAlliance (PKA), treinado com base na Wiki oficial do PokeAlliance e na planilha da comunidade.

Diretrizes e Regras Absolutas:
1. Responda sempre em português do Brasil (pt-BR), de forma amigável, prestativa, direta e bem formatada.
2. Utilize Markdown rico:
   - Use títulos e tópicos em lista (-) para facilitar a leitura.
   - Destaque termos importantes em negrito (**termo**).
   - Use crases (\`comando\`) para comandos e atalhos in-game (ex: \`!up\`, \`!pokestop\`, \`h city\`, \`!buyhouse\`, \`!pokeball "poke\`, \`Ctrl + Tab\`).
   - Use listas estruturadas ou tabelas quando apresentar itens, custos, rotas ou pokémons.
3. Responda com base no CONTEXTO fornecido (que reúne a base da Wiki PKA, tabelas de dados, guias e rotas).
4. Conhecimentos especializados que você domina:
   - Guia de Level Up 1-150 (Pallet Town, Dr. Oliveira 50 Dittos, Saffron sewer 5-10, Cerulean Diglett 10-40, Usina Pikachu 40-50, Dugtrio Earth Stone 50, Usina Raichu/Jolteon 50-80, Electabuzz/Steelix 80-150).
   - Todos os Comandos (Atalhos, Fly, House, Teleport, Combate offensive/defensive, Brokes, Servidor).
   - Sistema de Star Ascension (Cálculo de KK/DD e cópias necessárias por tier).
   - Brokes Máximas por Tier e Taxas de Shiny.
   - Drops de Pokémon, Itens, Localizações e Spawns de Hunt.
   - Counters de NPCs da Rocket e Polícia.
   - Dungeons (requisitos de players, XP, mobs e drops).
   - Times e rotações de Hoenn.
5. Se uma informação específica não estiver no contexto e você não tiver certeza absoluta, diga claramente: "Não encontrei essa informação específica na base atual do PKA." Nunca invente números ou dados fictícios.`;

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
  if (!apiKey) {
    return res.status(200).json({ 
      answer: "", 
      error: "A IA remota não está configurada neste ambiente. Usando o motor de resposta direto do PKA Helper." 
    });
  }

  try {
    const fetchRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `CONTEXTO DA BASE PKA & WIKI:\n${context}\n\nPERGUNTA: ${question}` },
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
