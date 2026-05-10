/**
 * iStoryToon - Edge Function: image-generate
 * Replicate FLUX.1-schnell (유료, 안정적)
 * Prefer: wait 헤더로 동기 응답
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const REPLICATE_URL = 'https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const { prompt } = await req.json();
    if (!prompt) return json({ error: 'prompt 필요' }, 400);

    const apiKey = Deno.env.get('REPLICATE_API_KEY');
    if (!apiKey) return json({ error: 'Replicate API 키 없음' }, 500);

    // Replicate 호출 (429 시 최대 5회 재시도)
    let res: Response | null = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      res = await fetch(REPLICATE_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'wait=55',
        },
        body: JSON.stringify({
          input: {
            prompt: prompt.slice(0, 500),
            num_outputs: 1,
            output_format: 'jpg',
            output_quality: 85,
            num_inference_steps: 4,
            go_fast: true,
            megapixels: '1',
          },
        }),
        signal: AbortSignal.timeout(58000),
      });

      if (res.status === 429) {
        const retryAfter = parseInt(res.headers.get('retry-after') || '10');
        console.log(`429 rate limit, ${retryAfter}초 대기... (${attempt+1}/5)`);
        await new Promise(r => setTimeout(r, (retryAfter + 2) * 1000));
        continue;
      }
      break;
    }

    if (!res || !res.ok) {
      const err = await res?.json().catch(() => ({})) || {};
      console.error('Replicate 오류:', res?.status, err);
      return json({ error: `Replicate 오류: ${res?.status}` }, 502);
    }

    const data = await res.json();
    const output = data.output;
    const imageUrl = Array.isArray(output) ? output[0] : output;

    if (!imageUrl) {
      // 아직 처리 중이면 폴링
      if (data.id && data.status !== 'failed') {
        const pollUrl = `https://api.replicate.com/v1/predictions/${data.id}`;
        for (let i = 0; i < 10; i++) {
          await new Promise(r => setTimeout(r, 3000));
          const poll = await fetch(pollUrl, { headers: { 'Authorization': `Bearer ${apiKey}` } });
          const pd = await poll.json();
          if (pd.status === 'succeeded') {
            const u = Array.isArray(pd.output) ? pd.output[0] : pd.output;
            if (u) return json({ url: u });
          }
          if (pd.status === 'failed') break;
        }
      }
      return json({ error: '이미지 URL 없음' }, 502);
    }

    return json({ url: imageUrl });

  } catch (err) {
    console.error('Edge Function 오류:', err);
    return json({ error: err.message }, 500);
  }
});
