import { type ChatTransport, DefaultChatTransport, type UIMessageChunk } from "ai";
import { type BuddyMessage, nextReply } from "./setup-model";

/** Connect this only when the same-origin Cloudflare Worker endpoint is implemented. */
export function createCloudflareTransport(api = "/api/buddy/chat"): ChatTransport<BuddyMessage> {
  return new DefaultChatTransport<BuddyMessage>({
    api,
    credentials: "same-origin",
  });
}

/** In-memory UI stream for Storybook and the concept site. No fetch or image analysis. */
export function createMockTransport({
  delay = 24,
  failFirst = false,
}: {
  delay?: number;
  failFirst?: boolean;
} = {}): ChatTransport<BuddyMessage> {
  let failed = false;
  return {
    async sendMessages({ messages, abortSignal }) {
      if (failFirst && !failed) {
        failed = true;
        throw new Error("Demo connection interrupted. Please try again.");
      }
      const { state, response } = nextReply(messages);
      const id = crypto.randomUUID();
      let cancelled = false;
      const chunks: UIMessageChunk[] = [
        { type: "start", messageId: id, messageMetadata: { setup: state } },
        { type: "text-start", id },
      ];
      for (const word of response.match(/\S+\s*/g) || [])
        chunks.push({ type: "text-delta", id, delta: word });
      chunks.push({ type: "text-end", id }, { type: "finish", finishReason: "stop" });
      return new ReadableStream<UIMessageChunk>({
        async pull(controller) {
          if (cancelled) return;
          if (abortSignal?.aborted) {
            cancelled = true;
            controller.close();
            return;
          }
          const chunk = chunks.shift();
          if (!chunk) {
            controller.close();
            return;
          }
          if (chunk.type === "text-delta" && delay > 0)
            await new Promise((resolve) => setTimeout(resolve, delay));
          if (cancelled) return;
          if (abortSignal?.aborted) {
            cancelled = true;
            controller.close();
            return;
          }
          controller.enqueue(chunk);
        },
        cancel() {
          cancelled = true;
        },
      });
    },
    async reconnectToStream() {
      return null;
    },
  };
}
