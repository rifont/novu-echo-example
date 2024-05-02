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
  apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
});

echo.workflow('ai-digest', async ({ step, payload }) => {
  const digest = await step.digest('ai-digest', () => ({
    amount: 30,
    unit: 'seconds',
  }));

  await step.inApp('send-digest', async (inputs) => {
    const messages = digest.events.reduce((acc, event, index) => {
      acc += `Message ${index + 1}: ${event.payload.message}\n\n`;
      return acc;
    }, '' as string);

    const messageToComplete = `${inputs.prompt}\n\n${messages}`

    const message = await openai.chat.completions.create({
      messages: [{ role: 'user', content: messageToComplete }],
      model: 'gpt-3.5-turbo',
    });
    return {
      body: `${inputs.showRaw ? `Raw content: ${messages}\n\n` : ''}${inputs.showSummary ? `AI Digest: ${message.choices[0].message.content as string}` : ''}`,
    }
  }, {
    inputSchema: {
      type: "object",
      properties: {
        prompt: { type: "string", default: "You are a notification AI digest bot. You must rank each of the messages in the digest and provide a summary of the digest. You must provide a detailed summary of the digest and the messages in the digest." },
        showRaw: { type: "boolean", default: true },
        showSummary: { type: "boolean", default: true },
      },
      required: ["prompt"],
      additionalProperties: false,
    } as const
  });
},{
  payloadSchema: {type: "object", properties: {message: {type: "string"}},required: ["message"], additionalProperties: false} as const}
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
