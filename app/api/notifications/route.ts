import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'],
});

const systemMessage = `You are a creative bot that excels in creating diverse content in json.`
const userMessage = (profession: string) => `Create a sample notification for a person who is a ${profession}. Give a diverse range of categories, the most common being Normal.`

export async function GET(request: Request) {
  const profession = new URL(request.url).searchParams.get('profession') || 'Software Engineer';
  const message = await openai.chat.completions.create({
    messages: [
      { role: 'system', content: systemMessage },
      { role: 'user', content: userMessage(profession) },
    ],
    model: 'gpt-3.5-turbo-1106',
    response_format: { type: "json_object" },
    n: 3,
    temperature: 1.5,
    functions: [
      {
        name: "create_sample_notification",
        description: "A sample notification for a user.",
        parameters: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "The message to be sent."
            },
            category: {
              type: "string",
              enum: ["Urgent", "Important", "Normal", "Low"],
              description: "The priority of the message."
            }
          },
          required: ["message", "category"],
          additionalProperties: false,
        }
      }
    ],
  });

  const messages = message.choices.reduce((acc: any[], choice: any) => {
    if (choice.finish_reason === 'function_call') {
      acc.push(JSON.parse(choice.message.function_call.arguments));
    }
    return acc;
  }, [] as any);

  return Response.json({
    messages,
  });
}
