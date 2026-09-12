import type { UIMessage } from "ai";

export type SetupStage =
  | "start"
  | "kind"
  | "model"
  | "port"
  | "battery"
  | "panel"
  | "count"
  | "arrangement"
  | "done";
export type SetupKind = "solar" | "pump" | "generator" | "telecom" | "battery" | "other";
export interface SetupState {
  stage: SetupStage;
  kind: SetupKind;
  controller: string;
  port: string;
  battery: string;
  panel: string;
  panelCount: string;
  arrangement: string;
  example: boolean;
}
export type BuddyMessage = UIMessage<{ setup: SetupState }>;
export const emptySetup: SetupState = {
  stage: "start",
  kind: "solar",
  controller: "",
  port: "",
  battery: "",
  panel: "",
  panelCount: "",
  arrangement: "",
  example: false,
};
export const manufacturerSource =
  "https://www.epever.com/wp-content/uploads/2021/05/EPEVER-Tracer-AN50A-100A-Series-Datasheet.pdf";
export const isUnknown = (value: string) =>
  !value || /^(not sure|unknown|later|no batteries)$/i.test(value);
export function manufacturerModel(state: SetupState) {
  if (state.kind !== "solar") return null;
  const label = state.controller.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return (
    ["10415AN", "10420AN"].find((model) =>
      [model, "TRACER" + model, "EPEVER" + model, "EPEVERTRACER" + model].includes(label),
    ) || null
  );
}
export function latestSetup(messages: BuddyMessage[]): SetupState {
  return (
    [...messages]
      .reverse()
      .find((message) => message.role === "assistant" && message.metadata?.setup)?.metadata
      ?.setup || { ...emptySetup }
  );
}
export function suggestions(state: SetupState): string[] {
  const options: Record<SetupStage, string[]> = {
    start: ["Add a photo", "Try a solar example"],
    kind: ["Solar / MPPT", "Pump / motor", "Generator", "Telecom", "Batteries"],
    model: state.example
      ? ["Tracer 10415AN", "Tracer 10420AN", "Not sure"]
      : ["Add a photo", "Not sure"],
    port: ["Display / logger", "Nothing attached", "Not sure"],
    battery: ["Add a photo", "Not sure", "No batteries"],
    panel: ["Add a photo", "Not sure"],
    count: ["4", "6", "8", "Not sure"],
    arrangement: ["Not sure", "I can describe it"],
    done: ["See my map", "Save my setup brief"],
  };
  return options[state.stage];
}
export function nextReply(messages: BuddyMessage[]) {
  const lastUser = messages.findLastIndex((message) => message.role === "user");
  const previous = latestSetup(messages.slice(0, lastUser));
  const state = { ...previous };
  const message = messages[lastUser];
  const text =
    message?.parts
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join("")
      .trim() || "";
  const photo = message?.parts.some((part) => part.type === "file");
  let response = "";
  const ask = (stage: SetupStage, question: string) => {
    state.stage = stage;
    response = question;
  };
  const finish = () => ask("done", "Your first map is ready. Tap a device to explore.");
  if (photo && state.stage !== "start" && !text) {
    return {
      state,
      response: "Photo added. Type the model from the label, or choose “Not sure”.",
    };
  }
  switch (state.stage) {
    case "start":
      if (text === "Try a solar example") {
        state.example = true;
        ask("model", "Which EPEVER model is on the label?");
      } else ask("kind", "What should we look at first?");
      break;
    case "kind":
      state.kind =
        (
          {
            "Solar / MPPT": "solar",
            "Pump / motor": "pump",
            Generator: "generator",
            Telecom: "telecom",
            Batteries: "battery",
          } as Record<string, SetupKind>
        )[text] || "other";
      ask("model", "What’s the exact make and model on its label?");
      break;
    case "model":
      state.controller = text;
      ask(
        "port",
        manufacturerModel(state)
          ? "Found the manufacturer reference. Is its data port already in use?"
          : "We’ll keep that model open for review. Is there a display or logger?",
      );
      break;
    case "port":
      state.port = text;
      if (state.kind === "battery") finish();
      else ask("battery", "What batteries do you have? A label photo helps.");
      break;
    case "battery":
      state.battery = text;
      if (state.kind !== "solar") finish();
      else ask("panel", "Do you know the solar panel model?");
      break;
    case "panel":
      state.panel = text;
      ask("count", "How many panels are there?");
      break;
    case "count":
      if (text !== "Not sure" && (!/^\d+$/.test(text) || Number(text) < 1 || Number(text) > 2000)) {
        response = "A panel count, or “Not sure”, is enough for now.";
        break;
      }
      state.panelCount = text;
      ask("arrangement", "Do you know how they’re grouped into strings?");
      break;
    case "arrangement":
      state.arrangement = text;
      finish();
      break;
    case "done":
      response = "The unknowns stay open. Tap a device to explore, or save your brief.";
      break;
  }
  return { state, response };
}
export type BuddyScenario =
  | "welcome"
  | "photo"
  | "identified"
  | "unknown"
  | "complete"
  | "error"
  | "streaming";
export function initialMessages(
  scenario: BuddyScenario = "welcome",
  photoUrl?: string,
): BuddyMessage[] {
  const first: BuddyMessage = {
    id: "buddy-welcome",
    role: "assistant",
    parts: [{ type: "text", text: "Got a photo of your setup?" }],
    metadata: { setup: { ...emptySetup } },
  };
  if (scenario === "welcome" || scenario === "error" || scenario === "streaming") return [first];
  if (scenario === "photo")
    return [
      first,
      {
        id: "example-photo",
        role: "user",
        parts: photoUrl
          ? [
              {
                type: "file",
                mediaType: "image/png",
                filename: "installation-example.png",
                url: photoUrl,
              },
            ]
          : [{ type: "text", text: "My installation photo" }],
      },
      {
        id: "buddy-photo",
        role: "assistant",
        parts: [{ type: "text", text: "What should we look at first?" }],
        metadata: { setup: { ...emptySetup, stage: "kind", example: true } },
      },
    ];
  const controller = scenario === "unknown" ? "EPEVER 100 A" : "Tracer 10415AN";
  const state: SetupState = {
    ...emptySetup,
    example: true,
    controller,
    stage: scenario === "complete" ? "done" : "port",
    ...(scenario === "complete"
      ? {
          port: "Display / logger",
          battery: "Not sure",
          panel: "Not sure",
          panelCount: "6",
          arrangement: "Not sure",
        }
      : {}),
  };
  return [
    first,
    {
      id: "example-model",
      role: "user",
      parts: [{ type: "text", text: controller }],
    },
    {
      id: "buddy-reference",
      role: "assistant",
      parts: [
        {
          type: "text",
          text:
            scenario === "complete"
              ? "Your first map is ready. Tap a device to explore."
              : scenario === "unknown"
                ? "Let’s confirm the exact model before choosing an interface."
                : "Found the manufacturer reference. Is its data port already in use?",
        },
      ],
      metadata: { setup: state },
    },
  ];
}
