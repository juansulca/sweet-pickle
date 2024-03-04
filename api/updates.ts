import Pusher from 'pusher'

const pusher = new Pusher({
  appId: process.env.APP_ID,
  key: process.env.VITE_APP_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.VITE_APP_CLUSTER,
  useTLS: true
});

export async function POST(request: Request) {
  const body = await request.json();
  console.log(body);
  await pusher.trigger("canvas", "update", {
    ...body
  });
  return new Response(JSON.stringify({ok: true}));
}