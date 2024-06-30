import { SUBSCRIBER_ID } from '@/constants/subscriber';
import { aiDigest } from '@/lib/novu/workflows';

export async function POST(request: Request) {
  const res = await request.json();

  await aiDigest.trigger({
    to: [SUBSCRIBER_ID],
    payload: {
      message: res.message,
      digestDuration: res.digestDuration,
    },
  });

  return Response.json({ success: true });
}
