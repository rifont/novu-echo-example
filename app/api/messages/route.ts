import { SUBSCRIBER_ID } from '@/constants/subscriber';
import { Novu } from '@novu/node';

const novu = new Novu(process.env.NOVU_API_KEY as string);

export async function POST(request: Request) {
    const res = await request.json();

    await novu.trigger('ai-digest', {
        to: {
          subscriberId: SUBSCRIBER_ID,
        },
        payload: {
          message: res.message,
        },
      });

    return Response.json({ success: true });
}
