const defaultBaseUrl = 'https://chat-ai.academiccloud.de/v1';

export function hasGwdgConfig() {
  return Boolean(process.env.GWDG_API_KEY && process.env.GWDG_ARCANA_ID);
}

export async function askGwdg({ message, contextPack = {} }) {
  const response = await fetch(`${process.env.GWDG_BASE_URL || defaultBaseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.GWDG_API_KEY}`,
      'Content-Type': 'application/json',
      'inference-service': 'saia-openai-gateway'
    },
    body: JSON.stringify({
      model: process.env.GWDG_MODEL || 'qwen3-30b-a3b-instruct-2507',
      messages: [
        {
          role: 'system',
          content: 'You are the Ludus narrative assistant. Separate observations, possible explanations, checks, and next steps. Be imaginative but clearly label uncertainty.'
        },
        {
          role: 'user',
          content: `User request: ${message}\n\nLudus context:\n${JSON.stringify(contextPack)}`
        }
      ],
      temperature: 0.7,
      top_p: 0.1,
      'enable-tools': true,
      arcana: { id: process.env.GWDG_ARCANA_ID }
    })
  });

  if (!response.ok) throw new Error(`GWDG request failed with status ${response.status}`);
  const data = await response.json();
  return { text: data.choices?.[0]?.message?.content?.trim() || '', raw: data };
}
