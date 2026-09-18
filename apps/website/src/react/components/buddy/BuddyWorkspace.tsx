import { useChat } from "@ai-sdk/react";
import type { ChatTransport, FileUIPart } from "ai";
import { ArrowUpIcon, PaperclipIcon, RotateCcwIcon, XIcon } from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";
import {
  Attachment,
  AttachmentPreview,
  AttachmentRemove,
  Attachments,
} from "../ai-elements/attachments";
import {
  PromptInput,
  PromptInputButton,
  PromptInputFooter,
  PromptInputHeader,
  type PromptInputMessage,
  PromptInputProvider,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  usePromptInputAttachments,
  usePromptInputController,
} from "../ai-elements/prompt-input";
import { Conversation, ConversationContent, ConversationScrollButton } from "../chat/conversation";
import { Message, MessageContent } from "../chat/message";
import { Suggestion } from "../chat/suggestion";
import { Button } from "../ui/button";
import { TooltipProvider } from "../ui/tooltip";
import { BuddyAvatar } from "./BuddyAvatar";
import { SetupMap } from "./SetupMap";
import {
  type BuddyMessage,
  type BuddyScenario,
  initialMessages,
  latestSetup,
  manufacturerModel,
  manufacturerSource,
  suggestions,
} from "./setup-model";
import { createMockTransport } from "./transport";

export interface BuddyWorkspaceProps {
  buddyUrl: string;
  plateUrl: string;
  photoUrl?: string;
  site?: "cottage" | "mining" | "telecom";
  scenario?: BuddyScenario;
  view?: "chat" | "map";
  transport?: ChatTransport<BuddyMessage>;
  onClose?: () => void;
}
export default function BuddyWorkspace(props: BuddyWorkspaceProps) {
  const [round, setRound] = useState(0);
  return (
    <TooltipProvider>
      <PromptInputProvider key={`${props.scenario || "welcome"}-${round}`}>
        <BuddySession
          {...props}
          scenario={round ? "welcome" : props.scenario}
          onReset={() => setRound((value) => value + 1)}
        />
      </PromptInputProvider>
    </TooltipProvider>
  );
}
function PhotoAttachments() {
  const attachments = usePromptInputAttachments();
  if (!attachments.files.length) return null;
  return (
    <PromptInputHeader>
      <Attachments variant="grid">
        {attachments.files.map((file) => (
          <Attachment key={file.id} data={file} onRemove={() => attachments.remove(file.id)}>
            <AttachmentPreview />
            <AttachmentRemove aria-label={`Remove ${file.filename || "photo"}`} />
          </Attachment>
        ))}
      </Attachments>
    </PromptInputHeader>
  );
}
function BuddySession({
  buddyUrl,
  plateUrl,
  photoUrl,
  site = "cottage",
  scenario = "welcome",
  view = "chat",
  transport,
  onClose,
  onReset,
}: BuddyWorkspaceProps & { onReset: () => void }) {
  const id = useId();
  const controller = usePromptInputController();
  const [mobileView, setMobileView] = useState(view);
  const [fileError, setFileError] = useState("");
  const [interrupted, setInterrupted] = useState(false);
  const mockTransport = useMemo(
    () =>
      createMockTransport({
        failFirst: scenario === "error",
        delay: scenario === "streaming" ? 160 : 24,
      }),
    [scenario],
  );
  const { messages, sendMessage, status, error, regenerate, stop, clearError } =
    useChat<BuddyMessage>({
      id,
      transport: transport || mockTransport,
      messages: initialMessages(scenario, photoUrl),
    });
  const state = latestSetup(messages);
  const busy = status === "streaming" || status === "submitted";
  const files = messages.flatMap((message) =>
    message.parts.filter((part): part is FileUIPart => part.type === "file"),
  );
  useEffect(() => setMobileView(view), [view]);
  async function submit({ text, files: attachments }: PromptInputMessage) {
    if (busy || (!text.trim() && !attachments.length)) return;
    setFileError("");
    setInterrupted(false);
    clearError();
    if (files.length + attachments.length > 6) {
      setFileError("Up to six photos in this demo.");
      return;
    }
    for (const file of attachments) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.mediaType)) {
        setFileError("Use JPG, PNG or WebP.");
        return;
      }
      try {
        const image = new Image();
        image.src = file.url;
        await image.decode();
      } catch {
        setFileError("Couldn’t read that image. Choose another photo.");
        return;
      }
    }
    await sendMessage({ text: text.trim(), files: attachments });
  }
  function save() {
    const model = manufacturerModel(state);
    const report = {
      kind: "Origin89 setup concept",
      example: state.example,
      photoAnalysisPerformed: false,
      equipment: state,
      matchedManufacturerModel: model,
      source: model ? manufacturerSource : null,
      photos: files.map((file) => ({
        name: file.filename,
        mediaType: file.mediaType,
      })),
      status:
        "Proposed data relationships. Equipment interfaces, support and electrical installation unverified.",
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(report, null, 2)], { type: "application/json" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "origin89-setup-brief.json";
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function quickReply(value: string) {
    if (value === "Add a photo") {
      controller.attachments.openFileDialog();
      return;
    }
    if (value === "See my map") {
      setMobileView("map");
      return;
    }
    if (value === "Save my setup brief") {
      save();
      return;
    }
    if (value === "I can describe it") {
      controller.textInput.setInput("");
      document.getElementById(`${id}-input`)?.focus();
      return;
    }
    void submit({ text: value, files: [] });
  }
  function stopResponse() {
    setInterrupted(true);
    void stop();
  }
  return (
    <div
      className="buddy-ui buddy-workspace"
      data-site={site}
      data-mobile-view={mobileView}
      data-chat-status={status}
    >
      <header className="setup-header">
        <div>
          <BuddyAvatar src={buddyUrl} alt="" size={46} />
          <div>
            <h2>Let’s map your setup.</h2>
            <span>Buddy · Interactive prototype · No image analysis</span>
          </div>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="setup-close"
            aria-label="Close setup chat"
          >
            <XIcon />
          </Button>
        )}
      </header>
      {/** biome-ignore lint/a11y/useSemanticElements: ARIA group labels these related controls without fieldset form semantics. */}
      <div role="group" className="setup-view-switch" aria-label="Setup views">
        <button
          type="button"
          aria-pressed={mobileView === "chat"}
          onClick={() => setMobileView("chat")}
          data-setup-view="chat"
        >
          Chat with Buddy
        </button>
        <button
          type="button"
          aria-pressed={mobileView === "map"}
          onClick={() => setMobileView("map")}
          data-setup-view="map"
        >
          Your map <span>↗</span>
        </button>
      </div>
      <div className="setup-workspace">
        <section className="setup-conversation" aria-label="Buddy setup chat">
          <Conversation
            className="buddy-conversation"
            initial="instant"
            resize="instant"
            aria-label="Conversation"
          >
            <ConversationContent className="buddy-log">
              {messages.map((message) => (
                <Message
                  key={message.id}
                  from={message.role}
                  className={`chat-message chat-${message.role === "user" ? "user" : "buddy"}`}
                >
                  {message.role === "assistant" && (
                    <>
                      {messages.length === 1 && (
                        <BuddyAvatar
                          className="chat-welcome"
                          src={buddyUrl}
                          alt="Buddy"
                          size={108}
                        />
                      )}
                      <span className="chat-speaker">Buddy</span>
                    </>
                  )}
                  <MessageContent>
                    {message.parts.map((part, index) =>
                      part.type === "text" ? (
                        // biome-ignore lint/suspicious/noArrayIndexKey: Streamed message parts retain their protocol position and have no stable part ID.
                        <p key={index}>{part.text}</p>
                      ) : part.type === "file" ? (
                        <img
                          // biome-ignore lint/suspicious/noArrayIndexKey: Streamed message parts retain their protocol position and have no stable part ID.
                          key={index}
                          src={part.url}
                          alt={part.filename || "Installation photo"}
                          className="chat-photo"
                        />
                      ) : null,
                    )}
                  </MessageContent>
                </Message>
              ))}
              {status === "submitted" && (
                <div className="buddy-thinking" role="status">
                  Buddy is replying<span aria-hidden="true">…</span>
                </div>
              )}
            </ConversationContent>
            <ConversationScrollButton aria-label="Scroll to latest message" />
          </Conversation>
          {(error || interrupted) && (
            <div className="buddy-connection-note" role="status">
              <p>
                {error
                  ? "Connection interrupted. Your messages are still here."
                  : "Reply stopped. Your messages are still here."}
              </p>
              <Button
                variant="ghost"
                onClick={() => {
                  setInterrupted(false);
                  clearError();
                  void regenerate();
                }}
                disabled={busy}
              >
                Try again <RotateCcwIcon />
              </Button>
            </div>
          )}
          {/** biome-ignore lint/a11y/useSemanticElements: ARIA group labels these related controls without fieldset form semantics. */}
          <div role="group" className="setup-quick-replies" aria-label="Suggested replies">
            {suggestions(state).map((value) => (
              <Suggestion key={value} suggestion={value} onClick={quickReply} disabled={busy} />
            ))}
          </div>
          <PromptInput
            className="buddy-prompt"
            onSubmit={submit}
            accept="image/jpeg,image/png,image/webp"
            multiple
            maxFiles={Math.max(0, 6 - files.length)}
            maxFileSize={12 * 1024 * 1024}
            onError={(err) => setFileError(err.message)}
          >
            <PhotoAttachments />
            <PromptInputTextarea
              id={`${id}-input`}
              aria-label="Message Buddy"
              placeholder="Message Buddy…"
              maxLength={300}
              disabled={busy}
            />
            <PromptInputFooter>
              <PromptInputTools>
                <PromptInputButton
                  aria-label="Attach a photo"
                  onClick={() => controller.attachments.openFileDialog()}
                  disabled={busy || files.length >= 6}
                >
                  <PaperclipIcon />
                </PromptInputButton>
                <span className="composer-hint">A label photo helps</span>
              </PromptInputTools>
              <PromptInputSubmit
                status={status}
                onStop={stopResponse}
                aria-label={busy ? "Stop reply" : "Send message"}
                disabled={
                  !busy &&
                  !controller.textInput.value.trim() &&
                  !controller.attachments.files.length
                }
              >
                {busy ? undefined : <ArrowUpIcon />}
              </PromptInputSubmit>
            </PromptInputFooter>
          </PromptInput>
          <div className="chat-footnote">
            <span>Photos stay on this device</span>
            <button
              type="button"
              data-chat-reset
              onClick={() => {
                void stop();
                onReset();
              }}
            >
              Start over ↺
            </button>
          </div>
          {fileError && (
            <p className="setup-error" role="alert">
              {fileError}
            </p>
          )}
        </section>
        <SetupMap key={state.kind} state={state} buddyUrl={buddyUrl} plateUrl={plateUrl} />
      </div>
    </div>
  );
}
