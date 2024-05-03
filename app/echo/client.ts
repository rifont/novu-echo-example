import { Echo } from "@novu/echo";
import OpenAI from 'openai';
import { renderReactEmail } from "./emails/vercel";

export const echo = new Echo({
  /**
   * Enable this flag only during local development
   */
  devModeBypassAuthentication: process.env.NODE_ENV === "development",
  apiKey: process.env.NOVU_API_KEY,
});

const openai = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'],
});

const DEFAULT_SYSTEM_MESSAGE = `
You are a notification AI digest bot. 
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

type MessagePayload = {
  message: string;
  category: "Urgent" | "Important" | "Normal" | "Low";
}

echo.workflow('ai-digest', async ({ step, payload }) => {
  const digest = await step.digest('ai-digest', () => ({
    amount: payload.digestDuration,
    unit: 'seconds',
  }));

  await step.inApp('send-digest', async (inputs) => {
    const userMessages = digest.events.reduce((acc, event, index) => {
      acc += `Message ${index + 1}: ${event.payload.message}

`;
      return acc;
    }, '' as string);

    const message = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: inputs.prompt },
        { role: 'user', content: userMessages }
      ],
      model: inputs.model,
      response_format: { type: "json_object" },
      n: 1,
      temperature: inputs.temperature,
      // See https://platform.openai.com/docs/guides/function-calling for more information
      functions: [
        {
          name: "digest_notifications",
          description: "Create a notification digest for a user.",
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
      function_call: 'auto',
  });

    const content = JSON.parse(message.choices[0].message.function_call?.arguments as string) as MessagePayload;

    return {
      body: `${emojiFromCategory[content.category]}${inputs.showCount ? ` (${digest.events.length})` : ''} ${content.message}`,
    }
  }, {
    inputSchema: {
      type: "object",
      properties: {
        prompt: {
          title: "System Message",
          type: "string",
          default: DEFAULT_SYSTEM_MESSAGE,
          description: "The system message to be sent.",
        },
        showCount: {
          title: "Show Digest Count",
          type: "boolean",
          default: false,
          description: "Whether to show the count of the messages.",
        },
        showSummary: {
          title: "Show Digest Summary",
          type: "boolean",
          default: true,
          description: "Whether to show the summary of the messages.",
        },
        model: {
          title: "Model",
          type: "string",
          description: "The OpenAI model to use for completion.",
          default: "gpt-3.5-turbo-1106",
          enum: [
            'gpt-3.5-turbo-1106',
            'gpt-4-turbo',
          ]
        },
        temperature: {
          type: "number",
          default: 0.5,
          minimum: 0,
          maximum: 2,
          description: "The temperature of the model. Lower values are more deterministic, higher values are more creative.",
        },
      },
      required: [],
      additionalProperties: false,
    } as const
  });
}, {
  payloadSchema: {
    type: "object",
    properties: { 
      message: {
        type: "string",
        description: "The message to be sent.",
        default: "Hello, world!"
      },
      digestDuration: {
        type: "number",
        default: 5,
        description: "The duration of the digest in seconds.",
      },
    },
    required: ["message", "digestDuration"],
    additionalProperties: false
  } as const
}
)
