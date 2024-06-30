import { FromSchema, workflow } from '@novu/framework';
import OpenAI from 'openai';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

const openai = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'],
});

const DEFAULT_SYSTEM_MESSAGE = `You are a notification AI digest bot.
You receive a stream of messages intended for a user. The user has requested that you summarize the messages and send them a digest as json.
The 'category' of the messages are Urgent, Important, Normal, and Low. The category represents the time sensitivity of the message.
The digest 'message' should be a maximum of 3 sentences and summarise the messages in order of priority from most important to least important.

The messages are as follows:
`;

const emojiFromCategory = {
  Urgent: "🔴",
  Important: "🟡",
  Normal: "🟢",
  Low: "ℹ️",
}

type MessagePayload = FromSchema<typeof notificationSchemaZod>

const notificationSchemaZod = z.object({
  message: z.string().describe("The message to be sent."),
  category: z.enum(['Urgent', 'Important', 'Normal', 'Low']).describe("The priority of the message."),
})
export const notificationSchemaJson = zodToJsonSchema(notificationSchemaZod)

export const aiDigest = workflow('ai-digest', async ({ step, payload }) => {
  const digest = await step.digest('ai-digest', () => ({
    amount: payload.digestDuration,
    unit: 'seconds',
  }));

  await step.inApp('send-digest', async (controls) => {
    const userMessages = digest.events.reduce((acc, event, index) => {
      acc += `Message ${index + 1}: ${event.payload.message}

`;
      return acc;
    }, '' as string);

    const message = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: controls.prompt },
        { role: 'user', content: userMessages }
      ],
      model: controls.model,
      response_format: { type: "json_object" },
      n: 1,
      temperature: controls.temperature,
      // See https://platform.openai.com/docs/guides/function-calling for more information
      functions: [
        {
          name: "digest_notifications",
          description: "Create a notification digest for a user.",
          parameters: notificationSchemaJson,
        }
      ],
      function_call: 'auto',
    });

    const content = JSON.parse(message.choices[0].message.function_call?.arguments as string) as MessagePayload;

    return {
      body: `${emojiFromCategory[content.category]}${controls.showCount ? ` (${digest.events.length})` : ''} ${content.message}`,
    }
  }, {
    controlSchema: z.object({
      prompt: z.string().default(DEFAULT_SYSTEM_MESSAGE).describe("The system message to be sent."),
      showCount: z.boolean().default(false).describe("Whether to show the count of the messages."),
      showSummary: z.boolean().default(true).describe("Whether to show the summary of the messages."),
      model: z.enum(['gpt-3.5-turbo-1106', 'gpt-4-turbo']).default('gpt-3.5-turbo-1106').describe("The OpenAI model to use for completion."),
      temperature: z.number().min(0).max(2).default(0.5).describe("The temperature of the model. Lower values are more deterministic, higher values are more creative."),
    })
  });
}, {
  payloadSchema: z.object({
    message: z.string().default("Hello, world!").describe("The message to be sent."),
    digestDuration: z.number().default(5).describe("The duration of the digest in seconds."),
  })
});
