import { Novu } from '@novu/node';

const novu = new Novu(process.env.NOVU_API_KEY as string);

export async function POST(request: Request) {
    const res = await request.json();

    const novuRes = await novu.trigger('ai-digest', {
        to: {
          subscriberId: 'richard@fontein.co',
          email: 'richard@fontein.co',
          firstName: 'Richard',
          lastName: 'Fontein',
        },
        payload: {
          message: res.message,
        },
      });

    return Response.json({ success: true });
}
