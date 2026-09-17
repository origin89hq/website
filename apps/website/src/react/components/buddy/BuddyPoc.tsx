import { useChat } from "@ai-sdk/react";
import {
  type Equipment,
  type EquipmentEdit,
  type Kind,
  type KnowledgePreview,
  kindNames,
  manufacturerReference,
  mergeExtraction,
  newInstallation,
  nextQuestion,
  observationReply,
  type Photo,
  questions,
  type SavedMessage,
  type SessionSnapshot,
} from "@origin89/buddy";
import { fixtureRounds } from "@origin89/buddy/fixtures";
import { type ChatTransport, DefaultChatTransport, type UIMessage, type UIMessageChunk } from "ai";
import {
  ArrowUp,
  Battery,
  Camera,
  Check,
  ChevronRight,
  Download,
  Edit3,
  LoaderCircle,
  PanelTop,
  Plug,
  Radio,
  Settings2,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { journalAssets } from "../../lib/react-assets";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "../ai-elements/conversation";
import { Message, MessageContent } from "../ai-elements/message";
import { Suggestion } from "../ai-elements/suggestion";
import { Button } from "../ui/button";
import { BuddyAvatar } from "./BuddyAvatar";
import "../../styles/buddy-poc.css";

type PocMessage = UIMessage<NonNullable<SavedMessage["metadata"]>, { knowledge: KnowledgePreview }>;
const welcome: SessionSnapshot = {
  installation: newInstallation(),
  messages: [
    {
      id: "welcome",
      role: "assistant",
      parts: [
        {
          type: "text",
          text: "Got a photo of your setup? A wide shot is a great place to start.",
        },
      ],
    },
  ],
  photos: [],
  mode: "fixture",
  pending: false,
};
const iconFor = (kind: Kind) =>
  kind === "battery"
    ? Battery
    : kind === "panel"
      ? PanelTop
      : kind === "monitor"
        ? Radio
        : kind === "charge-controller"
          ? Settings2
          : kind === "inverter"
            ? Zap
            : Plug;
async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/buddy/${path}`, {
    ...init,
    credentials: "same-origin",
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error || "Buddy isn’t available right now. Please try again.");
  }
  return response.json();
}
/** Explicit offline fixture for Storybook, never chosen by photo name or used as live inference. */
function exampleTransport(): ChatTransport<PocMessage> {
  let installation = newInstallation(),
    round = 0;
  return {
    async sendMessages({ messages, body }) {
      const before = installation,
        user = messages.findLast((message) => message.role === "user")!;
      if (body && "action" in body && body.action === "defer") {
        installation = structuredClone(installation);
        const question = nextQuestion(installation);
        if (question) installation.deferred.push(question.id);
        installation.revision++;
      } else {
        installation = mergeExtraction(
          installation,
          fixtureRounds[Math.min(round, 2)],
          user.id,
          [],
        );
        round++;
      }
      const id = crypto.randomUUID();
      return new ReadableStream<UIMessageChunk>({
        start(controller) {
          controller.enqueue({
            type: "start",
            messageId: id,
            messageMetadata: { installation },
          });
          controller.enqueue({ type: "text-start", id });
          controller.enqueue({
            type: "text-delta",
            id,
            delta: observationReply(before, installation, 0),
          });
          controller.enqueue({ type: "text-end", id });
          controller.enqueue({ type: "finish", finishReason: "stop" });
          controller.close();
        },
      });
    },
    async reconnectToStream() {
      return null;
    },
  };
}
export function BuddyPoc({ example = false }: { example?: boolean }) {
  const [snapshot, setSnapshot] = useState<SessionSnapshot | null>(
    example ? structuredClone(welcome) : null,
  );
  const [error, setError] = useState("");
  const [round, setRound] = useState(0);
  const [offline, setOffline] = useState(example);
  // biome-ignore lint/correctness/useExhaustiveDependencies: The retry counter intentionally starts a new session request.
  useEffect(() => {
    if (offline) return;
    let active = true;
    void api<SessionSnapshot>("session")
      .then((value) => {
        if (active) setSnapshot(value);
      })
      .catch((error: Error) => {
        if (active) setError(error.message);
      });
    return () => {
      active = false;
    };
  }, [offline, round]);
  if (!snapshot)
    return (
      <div className="poc-unavailable">
        <BuddyAvatar src={journalAssets.buddy} alt="Buddy" size={100} framing="avatar" />
        <h1>{error ? "Buddy couldn’t connect." : "Opening your setup…"}</h1>
        <p>{error || "Looking for your saved conversation."}</p>
        {error && (
          <>
            <Button
              onClick={() => {
                setError("");
                setRound(round + 1);
              }}
            >
              Try again
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setOffline(true);
                setSnapshot(structuredClone(welcome));
              }}
            >
              Explore the sample flow
            </Button>
            <small>The sample uses prepared observations. It does not analyse photos.</small>
          </>
        )}
      </div>
    );
  return (
    <BuddyPocWorkspace
      key={round}
      initial={snapshot}
      offline={offline}
      onReset={async () => {
        const next = offline
          ? structuredClone(welcome)
          : await api<SessionSnapshot>("session", { method: "DELETE" });
        setSnapshot(next);
        setRound(round + 1);
      }}
    />
  );
}
export function BuddyPocPage() {
  return (
    <main id="main" className="buddy-poc-page">
      <BuddyPoc />
    </main>
  );
}

async function preparePhoto(file: File): Promise<Blob> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw new Error("Use JPG, PNG or WebP photos.");
  if (file.size > 20 * 1024 * 1024) throw new Error("Choose a photo smaller than 20 MB.");
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const scale = Math.min(1, 2048 / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Couldn’t prepare this photo.");
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Couldn’t prepare this photo."))),
        "image/jpeg",
        0.9,
      ),
    );
    if (blob.size > 3 * 1024 * 1024)
      throw new Error("That photo is still too large. Try a closer crop.");
    return blob;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function BuddyPocWorkspace({
  initial,
  offline,
  onReset,
}: {
  initial: SessionSnapshot;
  offline: boolean;
  onReset: () => Promise<void>;
}) {
  const transport = useMemo(
    () =>
      offline
        ? exampleTransport()
        : new DefaultChatTransport<PocMessage>({
            api: "/api/buddy/chat",
            credentials: "same-origin",
            prepareSendMessagesRequest: ({ messages, body }) => {
              const user = messages.findLast((message) => message.role === "user")!;
              return {
                body: {
                  id: user.id,
                  text: user.parts
                    .filter((part) => part.type === "text")
                    .map((part) => part.text)
                    .join("\n"),
                  photoIds: user.parts
                    .filter((part) => part.type === "file")
                    .map((part) => part.url.split("/").at(-1)),
                  action: body?.action || "message",
                },
              };
            },
          }),
    [offline],
  );
  const [knowledgePreview, setKnowledgePreview] = useState<KnowledgePreview | null>(null);
  const { messages, setMessages, sendMessage, status, error, clearError } = useChat<PocMessage>({
    transport,
    messages: initial.messages,
    onData: (part) => {
      if (part.type === "data-knowledge") setKnowledgePreview(part.data);
    },
    onFinish: () => setKnowledgePreview(null),
    onError: () => setKnowledgePreview(null),
  });
  const [record, setRecord] = useState(initial.installation);
  const [draft, setDraft] = useState("");
  const [attachments, setAttachments] = useState<{ file: File; url: string; uploaded?: Photo }[]>(
    [],
  );
  const [working, setWorking] = useState(false);
  const [localError, setLocalError] = useState("");
  const [view, setView] = useState<"chat" | "equipment" | "map">("chat");
  const [editor, setEditor] = useState<Equipment | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [savedPending, setSavedPending] = useState(initial.pending);
  const uploadRef = useRef<HTMLInputElement>(null);
  const urls = useRef(new Set<string>());
  const retryRef = useRef<{
    id: string;
    text: string;
    photoIds: string[];
    action: string;
  } | null>(null);
  const busy = working || savedPending || status === "submitted" || status === "streaming";
  useEffect(
    () => () => {
      urls.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    },
    [],
  );
  useEffect(() => {
    const latest = messages.findLast((message) => message.metadata?.installation)?.metadata
      ?.installation;
    if (latest && latest.revision >= record.revision) setRecord(latest);
  }, [messages, record.revision]);
  useEffect(() => {
    if (!savedPending || offline) return;
    const interval = setInterval(() => {
      void api<SessionSnapshot>("session")
        .then((snapshot) => {
          if (!snapshot.pending) {
            setMessages(snapshot.messages);
            setRecord(snapshot.installation);
            setSavedPending(false);
          }
        })
        .catch(() => setSavedPending(false));
    }, 2500);
    return () => clearInterval(interval);
  }, [savedPending, offline, setMessages]);
  const question = nextQuestion(record);
  const unresolved = questions(record);
  function addFiles(files: FileList | null) {
    if (!files) return;
    if (attachments.length + files.length > 6) {
      setLocalError("Choose up to six photos per message.");
      return;
    }
    setLocalError("");
    // FileList is live: snapshot it before the input is cleared by the caller.
    const added = Array.from(files).map((file) => {
      const url = URL.createObjectURL(file);
      urls.current.add(url);
      return { file, url };
    });
    setAttachments((current) => [...current, ...added]);
  }
  async function send(text = draft, action = "message") {
    if (busy || (!text.trim() && !attachments.length && action === "message")) return;
    clearError();
    setKnowledgePreview(null);
    setLocalError("");
    setWorking(true);
    try {
      const uploaded: Photo[] = [];
      for (const attachment of attachments) {
        if (offline)
          throw new Error(
            "This is a prepared example. Open the live preview to analyse your own photos.",
          );
        const photo =
          attachment.uploaded ??
          (await api<Photo>("photos", {
            method: "POST",
            headers: {
              "Content-Type": "image/jpeg",
              "X-Photo-Name": encodeURIComponent(attachment.file.name),
            },
            body: await preparePhoto(attachment.file),
          }));
        attachment.uploaded = photo;
        uploaded.push(photo);
      }
      const id = crypto.randomUUID();
      retryRef.current = {
        id,
        text: text.trim(),
        photoIds: uploaded.map((photo) => photo.id),
        action,
      };
      setDraft("");
      attachments.forEach(({ url }) => {
        URL.revokeObjectURL(url);
        urls.current.delete(url);
      });
      setAttachments([]);
      setWorking(false);
      await sendMessage(
        {
          id,
          role: "user",
          parts: [
            { type: "text", text: text.trim() },
            ...uploaded.map((photo) => ({
              type: "file" as const,
              mediaType: photo.mediaType,
              filename: photo.name,
              url: photo.url,
            })),
          ],
        },
        { body: { action } },
      );
    } catch (error) {
      setLocalError(
        error instanceof Error ? error.message : "Couldn’t send that. Please try again.",
      );
    } finally {
      setWorking(false);
    }
  }
  async function recover() {
    if (offline) {
      clearError();
      return;
    }
    setWorking(true);
    setLocalError("");
    try {
      const snapshot = await api<SessionSnapshot>("session");
      setMessages(snapshot.messages);
      setRecord(snapshot.installation);
      clearError();
      if (snapshot.pending) setSavedPending(true);
      else if (
        retryRef.current &&
        !snapshot.messages.some((message) => message.id === retryRef.current?.id)
      ) {
        // Retain the original message ID so a retry cannot duplicate a settled turn.
        const last = retryRef.current;
        await sendMessage(
          {
            id: last.id,
            role: "user",
            parts: [
              { type: "text", text: last.text },
              ...last.photoIds.map((id) => {
                const photo = snapshot.photos.find((photo) => photo.id === id)!;
                return {
                  type: "file" as const,
                  mediaType: photo.mediaType,
                  filename: photo.name,
                  url: photo.url,
                };
              }),
            ],
          },
          { body: { action: last.action } },
        );
      }
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : "Couldn’t reconnect.");
    } finally {
      setWorking(false);
    }
  }
  function download() {
    const payload = {
      kind: "Origin89 installation record",
      exportedAt: new Date().toISOString(),
      mode: offline || initial.mode === "fixture" ? "example" : "live",
      installation: record,
      openQuestions: unresolved,
      messages,
      note: "Observed and user-confirmed inventory. Connections and Origin89 compatibility remain unverified. Photo files are not embedded.",
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "origin89-installation.json";
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function saveEdit(input: EquipmentEdit) {
    if (offline) {
      setRecord((current) => ({
        ...current,
        revision: current.revision + 1,
        equipment: current.equipment.map((item) =>
          item.id === input.id ? { ...item, ...input, confirmed: true } : item,
        ),
      }));
    } else {
      const snapshot = await api<SessionSnapshot>("equipment", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      setRecord(snapshot.installation);
      setMessages(snapshot.messages);
    }
    setEditor(null);
  }
  return (
    <div className="poc buddy-ui" data-view={view}>
      <header className="poc-header">
        <a href="/" aria-label="Origin89 home">
          <img src={journalAssets.plate} alt="Origin89" />
        </a>
        <div>
          <h1>Let’s understand your setup.</h1>
          <p>
            {offline || initial.mode === "fixture"
              ? "Sample flow · Prepared observations · No image analysis"
              : `Buddy POC · ${initial.aiProvider ?? "Cloudflare AI"} · Saved in this browser’s session`}
          </p>
        </div>
        <Button variant="ghost" size="icon" aria-label="Download setup record" onClick={download}>
          <Download size={18} />
        </Button>
      </header>
      <nav className="poc-tabs" aria-label="Your setup views">
        {(["chat", "equipment", "map"] as const).map((tab) => (
          <button type="button" key={tab} aria-pressed={view === tab} onClick={() => setView(tab)}>
            {tab === "chat"
              ? "Chat with Buddy"
              : tab === "equipment"
                ? `Equipment (${record.equipment.length})`
                : "Your map"}
          </button>
        ))}
      </nav>
      <div className="poc-body">
        <section className="poc-chat" aria-label="Buddy conversation">
          <Conversation initial="instant" resize="instant" className="poc-conversation">
            <ConversationContent className="poc-messages">
              {messages.map((message) => (
                <Message key={message.id} from={message.role}>
                  <MessageContent>
                    {message.role === "assistant" && (
                      <span className="poc-speaker">
                        <BuddyAvatar
                          src={journalAssets.buddy}
                          alt=""
                          size={messages.length === 1 ? 74 : 30}
                        />
                        Buddy
                      </span>
                    )}
                    {message.parts.map((part, index) =>
                      part.type === "text" ? (
                        // biome-ignore lint/suspicious/noArrayIndexKey: Streamed message parts retain their protocol position and have no stable part ID.
                        <p key={index}>{part.text}</p>
                      ) : part.type === "file" ? (
                        // biome-ignore lint/suspicious/noArrayIndexKey: Streamed message parts retain their protocol position and have no stable part ID.
                        <a key={index} href={part.url} target="_blank" rel="noreferrer">
                          <img
                            className="poc-chat-photo"
                            src={part.url}
                            alt={part.filename || "Installation photo"}
                          />
                        </a>
                      ) : null,
                    )}
                    {!!message.metadata?.solarChecks?.length && (
                      // biome-ignore lint/a11y/useSemanticElements: ARIA group labels these related controls without fieldset form semantics.
                      <div
                        role="group"
                        className="poc-solar-checks"
                        aria-label="Solar setup checks"
                      >
                        {message.metadata.solarChecks.map((check) => (
                          <div className="poc-solar-check" key={check.array}>
                            <strong>
                              {check.array}
                              {check.arrayWatts !== null
                                ? ` · ${check.arrayWatts.toLocaleString()} W of panels`
                                : ""}
                            </strong>
                            <p>
                              {check.findings.find((finding) => finding.level === "warning")
                                ?.text ?? "Preliminary calculations from your setup details."}
                            </p>
                            <details>
                              <summary>See checks and missing details</summary>
                              <ul>
                                {check.findings.map((finding) => (
                                  <li key={finding.text} data-level={finding.level}>
                                    {finding.text}
                                  </li>
                                ))}
                              </ul>
                            </details>
                          </div>
                        ))}
                      </div>
                    )}
                    {!!message.metadata?.sources?.length && (
                      // biome-ignore lint/a11y/useSemanticElements: ARIA group labels these related controls without fieldset form semantics.
                      <div role="group" className="poc-sources" aria-label="Equipment sources">
                        {message.metadata.sources.map((source) => (
                          <a key={source.id} href={source.url} target="_blank" rel="noreferrer">
                            {source.title}
                            {source.page
                              ? ` · p. ${source.page}`
                              : source.row
                                ? ` · row ${source.row}`
                                : source.section
                                  ? ` · ${source.section}`
                                  : ""}
                            {` · ${source.revision}`}
                          </a>
                        ))}
                      </div>
                    )}
                  </MessageContent>
                </Message>
              ))}
              {busy && knowledgePreview && (
                <div className="poc-knowledge-preview" role="status">
                  <span className="poc-kicker">Found in the catalogue</span>
                  {knowledgePreview.records.map((item) => (
                    <article key={item.id}>
                      <strong>{item.name}</strong>
                      <dl>
                        {item.specifications.map((spec) => (
                          <div key={spec.name}>
                            <dt>{spec.name}</dt>
                            <dd>
                              {spec.value} {spec.unit}
                            </dd>
                          </div>
                        ))}
                      </dl>
                      <details>
                        <summary>Rating conditions</summary>
                        {item.specifications.map((spec) => (
                          <p key={spec.name}>
                            {spec.name}: {spec.conditions}
                          </p>
                        ))}
                      </details>
                      {item.integrationStatus && (
                        <p className="poc-integration-status">
                          {
                            {
                              passive: "External monitor needed",
                              documented: "Connection documented · Origin89 integration pending",
                              "decoder-implemented": "Partial decoder · hardware testing pending",
                              "hardware-verified": "Hardware tested · see documented scope",
                            }[item.integrationStatus]
                          }
                        </p>
                      )}
                      <a href={item.source.url} target="_blank" rel="noreferrer">
                        {item.source.title}
                      </a>
                    </article>
                  ))}
                </div>
              )}
              {busy && (
                <div className="poc-reading" role="status">
                  <LoaderCircle size={16} />
                  {working ? "Preparing your photos…" : "Buddy is reading your setup…"}
                </div>
              )}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>
          {(localError || error) && (
            <div className="poc-error" role="alert">
              <p>{localError || error?.message}</p>
              {error && (
                <button type="button" onClick={() => void recover()} disabled={busy}>
                  Reconnect and retry
                </button>
              )}
            </div>
          )}
          <div className="poc-suggestions">
            {offline ? (
              <Suggestion
                suggestion={
                  record.equipment.length === 0
                    ? "1 · Show the solar board"
                    : !record.equipment.some((item) => item.kind === "inverter")
                      ? "2 · Show inverter and wider view"
                      : "3 · Show six batteries"
                }
                onClick={(value) => void send(value)}
                disabled={busy}
              />
            ) : (
              <>
                <Suggestion
                  suggestion="Add a photo"
                  onClick={() => uploadRef.current?.click()}
                  disabled={busy}
                />
                {question && record.equipment.length > 0 && (
                  <Suggestion
                    suggestion="I’m not sure yet"
                    onClick={() => void send("I’m not sure yet", "defer")}
                    disabled={busy}
                  />
                )}
                {question?.kind && (
                  <Suggestion
                    suggestion={`No ${kindNames[question.kind!].toLowerCase()}`}
                    onClick={() =>
                      void send(
                        `I don’t have a ${kindNames[question.kind!].toLowerCase()}.`,
                        "absent",
                      )
                    }
                    disabled={busy}
                  />
                )}
              </>
            )}
          </div>
          <form
            className="poc-composer"
            onSubmit={(event) => {
              event.preventDefault();
              void send();
            }}
          >
            {attachments.length > 0 && (
              <div className="poc-attachments">
                {attachments.map((attachment, index) => (
                  <div key={attachment.url}>
                    <img src={attachment.url} alt={attachment.file.name} />
                    <button
                      type="button"
                      aria-label={`Remove ${attachment.file.name}`}
                      disabled={busy}
                      onClick={() => {
                        URL.revokeObjectURL(attachment.url);
                        urls.current.delete(attachment.url);
                        setAttachments((current) =>
                          current.filter((_, offset) => offset !== index),
                        );
                      }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <textarea
              aria-label="Message Buddy"
              placeholder="Add a photo, or tell me what you have…"
              value={draft}
              maxLength={3000}
              disabled={busy || offline}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  void send();
                }
              }}
            />
            <div>
              <input
                ref={uploadRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                hidden
                onChange={(event) => {
                  addFiles(event.target.files);
                  event.target.value = "";
                }}
              />
              <Button
                type="button"
                variant="ghost"
                aria-label="Attach installation photos"
                disabled={busy || offline}
                onClick={() => uploadRef.current?.click()}
              >
                <Camera size={18} />
                <span>Add photos</span>
              </Button>
              <Button
                type="submit"
                size="icon"
                aria-label="Send message"
                disabled={busy || offline || (!draft.trim() && !attachments.length)}
              >
                <ArrowUp size={18} />
              </Button>
            </div>
          </form>
          <footer className="poc-chat-footer">
            <span>
              {offline
                ? "Example data. Nothing is uploaded."
                : initial.mode === "fixture"
                  ? "Prepared observations. No AI calls."
                  : `Photos are analysed by ${initial.aiProvider ?? "Cloudflare AI"}. Preview records expire after 7 days.`}
            </span>
            <a href="/app/">Explore the app</a>
            <button type="button" disabled={busy} onClick={() => setResetOpen(true)}>
              Start again
            </button>
          </footer>
        </section>
        <aside className="poc-inventory" aria-label="Equipment list">
          <div className="poc-section-title">
            <h2>A clearer picture.</h2>
            <p>
              {record.equipment.length
                ? `${record.equipment.length} equipment entries · ${record.equipment.filter((item) => item.confirmed).length} reviewed by you`
                : "Your equipment will appear here as we go."}
            </p>
          </div>
          <div className="poc-equipment-list">
            {record.equipment.map((item) => {
              const Icon = iconFor(item.kind),
                reference = manufacturerReference(item);
              return (
                <article key={item.id} className="poc-equipment-card">
                  <div className="poc-card-top">
                    <span className="poc-equipment-icon">
                      <Icon size={21} />
                    </span>
                    <div>
                      <h3>{item.name}</h3>
                      <p>
                        {item.model || "Model still to identify"}
                        {item.quantity && item.quantity > 1
                          ? ` · ${item.quantity} visible / reported`
                          : ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label={`Review ${item.name}`}
                      disabled={busy || offline}
                      onClick={() => setEditor(item)}
                    >
                      <Edit3 size={15} />
                    </button>
                  </div>
                  <span className={`poc-evidence ${item.confirmed ? "confirmed" : ""}`}>
                    {item.confirmed ? (
                      <>
                        <Check size={12} />
                        Reviewed by you
                      </>
                    ) : (
                      "Observed · Needs your review"
                    )}
                  </span>
                  <details>
                    <summary>
                      What we know <ChevronRight size={12} />
                    </summary>
                    <p>{item.evidence}</p>
                    {item.photoIds.length > 0 && (
                      <span>
                        {item.photoIds.length} supporting photo
                        {item.photoIds.length === 1 ? "" : "s"}
                      </span>
                    )}
                    {reference && (
                      <>
                        <a href={reference.url} target="_blank" rel="noreferrer">
                          {reference.title} ↗
                        </a>
                        <small>{reference.note}</small>
                      </>
                    )}
                  </details>
                </article>
              );
            })}
            {!record.equipment.length && (
              <div className="poc-inventory-empty">
                <Camera size={30} />
                <p>Start with what’s in front of you.</p>
                <span>
                  Labels, equipment, a wider view.
                  <br />
                  You don’t need to know the technical names.
                </span>
              </div>
            )}
          </div>
          {record.facts.length > 0 && (
            <section className="poc-facts">
              <h3>Details collected</h3>
              {record.facts.map((fact) => (
                <p key={fact.key}>
                  <span>{fact.key.replaceAll("_", " ")}</span>
                  <strong>{fact.value}</strong>
                  <small>{fact.evidence} · Needs review</small>
                </p>
              ))}
            </section>
          )}
          {record.equipment.length > 0 && (
            <section className="poc-open">
              <h3>
                Still to explore <span>{unresolved.length}</span>
              </h3>
              {unresolved.slice(0, 4).map((question) => (
                <p key={question.id}>
                  {question.text}
                  {record.deferred.includes(question.id) && <small>Saved for later</small>}
                </p>
              ))}
              <Button variant="outline" onClick={download}>
                <Download size={15} />
                Download setup record
              </Button>
            </section>
          )}
        </aside>
        <section className="poc-map" aria-label="Installation map">
          <div className="poc-section-title">
            <h2>Your setup, taking shape.</h2>
            <p>Equipment inventory · Wiring not yet established</p>
          </div>
          <div className="poc-map-canvas">
            <div className="poc-map-hub">
              <img src={journalAssets.plate} alt="" />
              <strong>Your installation</strong>
              <span>{record.equipment.length} equipment entries</span>
            </div>
            <div className="poc-map-nodes">
              {(record.equipment.length
                ? record.equipment
                : (["charge-controller", "battery", "inverter", "panel"] as Kind[]).map((kind) => ({
                    id: kind,
                    kind,
                    name: kindNames[kind],
                    model: null,
                    confirmed: false,
                  }))
              ).map((item) => {
                const Icon = iconFor(item.kind);
                return (
                  <button
                    type="button"
                    key={item.id}
                    disabled={!record.equipment.length || busy || offline}
                    onClick={() => {
                      const device = record.equipment.find((entry) => entry.id === item.id);
                      if (device) setEditor(device);
                    }}
                    className={record.equipment.length ? "" : "pending"}
                  >
                    <Icon size={28} />
                    <strong>{item.name}</strong>
                    <span>{item.model || "Details to confirm"}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="poc-map-note">
            <BuddyAvatar src={journalAssets.buddy} alt="" size={40} />
            <p>
              <strong>Where Origin89 could fit comes next.</strong>
              <span>
                First, we identify your equipment and available interfaces. Connections stay open
                until we have evidence.
              </span>
            </p>
          </div>
        </section>
      </div>
      {editor && (
        <EquipmentEditor
          item={editor}
          revision={record.revision}
          onClose={() => setEditor(null)}
          onSave={saveEdit}
        />
      )}
      {resetOpen && (
        <ResetDialog onClose={() => setResetOpen(false)} onDownload={download} onReset={onReset} />
      )}
    </div>
  );
}
function ResetDialog({
  onClose,
  onDownload,
  onReset,
}: {
  onClose: () => void;
  onDownload: () => void;
  onReset: () => Promise<void>;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const keepButton = useRef<HTMLButtonElement>(null);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    dialog.current?.showModal();
    keepButton.current?.focus();
  }, []);
  return (
    <dialog
      ref={dialog}
      role="alertdialog"
      className="poc-modal"
      aria-labelledby="poc-reset-title"
      onClose={onClose}
      onCancel={(event) => {
        if (busy) event.preventDefault();
      }}
    >
      <h2 id="poc-reset-title">Start a new setup?</h2>
      <p>
        This deletes this preview’s conversation and photos. Download your record first if you want
        to keep it.
      </p>
      <Button variant="outline" onClick={onDownload}>
        <Download size={15} />
        Download record
      </Button>
      {error && <p role="alert">{error}</p>}
      <div>
        <Button ref={keepButton} variant="ghost" disabled={busy} onClick={onClose}>
          Keep this setup
        </Button>
        <Button
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await onReset();
            } catch (error) {
              setError(error instanceof Error ? error.message : "Couldn’t reset your setup.");
              setBusy(false);
            }
          }}
        >
          {busy ? "Deleting…" : "Delete and start again"}
        </Button>
      </div>
    </dialog>
  );
}
function EquipmentEditor({
  item,
  revision,
  onClose,
  onSave,
}: {
  item: Equipment;
  revision: number;
  onClose: () => void;
  onSave: (input: EquipmentEdit) => Promise<void>;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    dialog.current?.showModal();
  }, []);
  return (
    <dialog
      ref={dialog}
      className="poc-modal"
      onClose={onClose}
      aria-labelledby="equipment-edit-title"
    >
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          setBusy(true);
          setError("");
          const data = new FormData(event.currentTarget);
          try {
            await onSave({
              revision,
              id: item.id,
              name: String(data.get("name")),
              brand: String(data.get("brand")) || null,
              model: String(data.get("model")) || null,
              quantity: data.get("quantity") ? Number(data.get("quantity")) : null,
            });
          } catch (error) {
            setError(error instanceof Error ? error.message : "Couldn’t save.");
            setBusy(false);
          }
        }}
      >
        <h2 id="equipment-edit-title">Review this equipment</h2>
        <p>Correct what you know. Leave unreadable details blank.</p>
        {(["name", "brand", "model"] as const).map((field) => (
          <label key={field}>
            {field === "name" ? "Equipment name" : field === "brand" ? "Brand" : "Exact model"}
            <input
              name={field}
              defaultValue={item[field] || ""}
              maxLength={160}
              required={field === "name"}
              autoFocus={field === "name"}
            />
          </label>
        ))}
        <label>
          Quantity
          <input
            name="quantity"
            type="number"
            min="1"
            max="2000"
            defaultValue={item.quantity || ""}
          />
        </label>
        {error && <p role="alert">{error}</p>}
        <div>
          <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? "Saving…" : "Confirm these details"}
          </Button>
        </div>
      </form>
    </dialog>
  );
}
