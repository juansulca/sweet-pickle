import Pusher from 'pusher'
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const pusher = new Pusher({
  appId: process.env.APP_ID,
  key: process.env.VITE_APP_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.VITE_APP_CLUSTER,
  useTLS: true
});

export async function POST(request: Request) {
  const body = await request.json();
  await pusher.trigger("canvas", "update", {
    ...body
  });
  console.log(body);
  const canvas = await redis.get<string[]>('canvas');
  if (!canvas) {
    await redis.set('canvas', JSON.stringify(new Array(250*122).fill('w')));
  } else {
    const { position, color } = body;
    canvas[position] = color;
    await redis.set('canvas',  JSON.stringify(canvas));
  }
  return new Response(JSON.stringify({ok: true}));
}
