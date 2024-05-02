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
    amount: 5,
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
      temperature: 0.5,
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
        prompt: { type: "string", default: DEFAULT_SYSTEM_MESSAGE },
        showCount: { type: "boolean", default: false },
        showSummary: { type: "boolean", default: true },
        model: {
          type: "string", default: "gpt-3.5-turbo-1106", enum: [
            'gpt-3.5-turbo-1106',
            'gpt-4-1106-preview',
            'gpt-3.5-turbo',
            'gpt-4',
            'gpt-4-turbo',
          ]
        }
      },
      required: [],
      additionalProperties: false,
    } as const
  });
}, {
  payloadSchema: { type: "object", properties: { message: { type: "string" } }, required: ["message"], additionalProperties: false } as const
}
)


// echo.workflow(
//   "hello-world",
//   async ({ step }) => {
//     await step.email(
//       "send-email",
//       async (inputs) => {
//         return {
//           subject: "This is an email subject",
//           body: renderReactEmail(inputs),
//         };
//       },
//       {
//         inputSchema: {
//           type: "object",

//           properties: {
//             showButton: { type: "boolean", default: true },
//             username: { type: "string", default: "alanturing" },
//             userImage: {
//               type: "string",
//               default:
//                 "https://react-email-demo-bdj5iju9r-resend.vercel.app/static/vercel-user.png",
//               format: "uri",
//             },
//             invitedByUsername: { type: "string", default: "Alan" },
//             invitedByEmail: {
//               type: "string",
//               default: "alan.turing@example.com",
//               format: "email",
//             },
//             teamName: { type: "string", default: "Team Awesome" },
//             teamImage: {
//               type: "string",
//               default:
//                 "https://react-email-demo-bdj5iju9r-resend.vercel.app/static/vercel-team.png",
//               format: "uri",
//             },
//             inviteLink: {
//               type: "string",
//               default: "https://vercel.com/teams/invite/foo",
//               format: "uri",
//             },
//             inviteFromIp: { type: "string", default: "204.13.186.218" },
//             inviteFromLocation: {
//               type: "string",
//               default: "São Paulo, Brazil",
//             },
//           },
//         },
//       },
//     );
//   },
//   { payloadSchema: { type: "object", properties: {} } },
// );
