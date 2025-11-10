import { consumeStream, convertToModelMessages, streamText, type UIMessage } from "ai"

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const prompt = convertToModelMessages(messages)

  const result = streamText({
    model: "openai/gpt-5-mini",
    system: `You are TRAFFIX, an AI-powered traffic analyst assistant. You help transportation analysts, planners, and operations managers understand traffic patterns, congestion causes, and road conditions.

Your expertise includes:
- Analyzing traffic congestion patterns and their root causes
- Explaining incidents and their impact on traffic flow
- Providing insights on historical trends
- Interpreting RITIS data and traffic metrics
- Connecting traffic patterns with news events and incidents

Be concise, professional, and data-driven in your responses. When users ask about specific routes or times, provide detailed analysis. Always explain the "why" behind traffic patterns, not just the "what".`,
    prompt,
    abortSignal: req.signal,
  })

  return result.toUIMessageStreamResponse({
    onFinish: async ({ isAborted }) => {
      if (isAborted) {
        console.log("Aborted")
      }
    },
    consumeSseStream: consumeStream,
  })
}
