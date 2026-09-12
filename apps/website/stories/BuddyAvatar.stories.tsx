import type { Meta, StoryObj } from "@storybook/react";
import { BuddyAvatar, type BuddyExpression } from "../src/react/components/buddy/BuddyAvatar";

const expressions: BuddyExpression[] = [
  "welcoming",
  "explaining",
  "thinking",
  "delighted",
  "concerned",
  "surprised",
  "playful",
];
const meta = {
  title: "Buddy/Avatar",
  component: BuddyAvatar,
  args: { size: 64, expression: "welcoming", alt: "Buddy" },
  argTypes: {
    expression: { control: "select", options: expressions },
    framing: {
      control: "inline-radio",
      options: ["auto", "avatar", "portrait", "scene"],
    },
    shape: { control: "inline-radio", options: ["auto", "circle", "rounded"] },
    size: { control: { type: "range", min: 24, max: 320, step: 8 } },
    src: { table: { disable: true } },
  },
  parameters: { renderer: "react", layout: "centered" },
} satisfies Meta<typeof BuddyAvatar>;
export default meta;
type Story = StoryObj<typeof meta>;
const row = {
  display: "flex",
  flexWrap: "wrap" as const,
  gap: 24,
  alignItems: "center",
};

export const Greeting: Story = {};
export const Sizes: Story = {
  render: (args) => (
    <div style={{ ...row, padding: 32 }}>
      {[24, 32, 48, 64, 96, 160].map((size) => (
        <figure key={size} style={{ margin: 0, textAlign: "center" }}>
          <BuddyAvatar {...args} size={size} />
          <figcaption style={{ fontSize: 12, marginTop: 12 }}>{size} px</figcaption>
        </figure>
      ))}
    </div>
  ),
};
export const Expressions: Story = {
  args: { size: 96 },
  render: (args) => (
    <div style={{ ...row, padding: 32 }}>
      {expressions.map((expression) => (
        <figure key={expression} style={{ margin: 0, textAlign: "center" }}>
          <BuddyAvatar {...args} expression={expression} />
          <figcaption style={{ fontSize: 14, marginTop: 12 }}>{expression}</figcaption>
        </figure>
      ))}
    </div>
  ),
};
export const LightAndDark: Story = {
  render: (args) => (
    <div style={row}>
      {["#f4f3ef", "#172021"].map((background) => (
        <div key={background} style={{ background, padding: 32, borderRadius: 20 }}>
          <BuddyAvatar {...args} />
        </div>
      ))}
    </div>
  ),
};
export const BesideAMessage: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        gap: 16,
        padding: 24,
        maxWidth: 430,
        alignItems: "start",
      }}
    >
      <BuddyAvatar size={48} alt="" />
      <div>
        <strong>Buddy</strong>
        <p style={{ margin: "4px 0 0" }}>
          Hi, I’m Buddy. Show me your setup, and we’ll figure it out together.
        </p>
      </div>
    </div>
  ),
};
export const ChatFraming: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 32, padding: 32, maxWidth: 500 }}>
      <div style={{ display: "flex", gap: 16, alignItems: "start" }}>
        <BuddyAvatar size={48} alt="" />
        <div>
          <strong>Buddy</strong>
          <p style={{ margin: "4px 0 0" }}>
            Hi, I’m Buddy. Show me your setup, and we’ll figure it out together.
          </p>
        </div>
      </div>
      <div>
        <p style={{ fontSize: 12 }}>Transparent portrait for larger layouts</p>
        <BuddyAvatar size={240} alt="Buddy" />
      </div>
    </div>
  ),
};
export const AppIcons: Story = {
  render: () => (
    <div style={{ ...row, padding: 32 }}>
      {["buddy-app-512.png", "buddy-maskable-512.png", "buddy-favicon-48.png"].map((file, i) => (
        <figure key={file} style={{ margin: 0, textAlign: "center" }}>
          <img
            src={`/brand/${file}`}
            alt="Buddy app icon"
            width={i === 2 ? 48 : 160}
            height={i === 2 ? 48 : 160}
            style={{ borderRadius: i === 1 ? "50%" : i === 0 ? 32 : 0 }}
          />
          <figcaption style={{ fontSize: 12, marginTop: 12 }}>
            {["App / Apple", "Circular mask", "Browser tab"][i]}
          </figcaption>
        </figure>
      ))}
    </div>
  ),
};

export const Playful: Story = {
  args: { expression: "playful", size: 280, framing: "portrait" },
  render: (args) => (
    <div style={{ display: "grid", gap: 24, padding: 32, maxWidth: 400 }}>
      <BuddyAvatar {...args} />
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <BuddyAvatar expression="playful" size={48} alt="" />
        <div>
          <strong>Buddy</strong>
          <p style={{ margin: "4px 0 0" }}>Small legs. Big curiosity.</p>
        </div>
      </div>
      <p style={{ margin: 0, fontSize: 14 }}>
        A playful moment for introductions and celebrations.
      </p>
    </div>
  ),
};

export const Rendering: Story = {
  render: () => (
    <div style={{ ...row, padding: 32, alignItems: "start" }}>
      <section style={{ maxWidth: 360 }}>
        <h2 style={{ fontSize: 20 }}>Small circular avatars</h2>
        <p>A front-facing close-up on green, with the default tongue tucked in.</p>
        <div style={row}>
          {[24, 32, 48, 64, 96].map((size) => (
            <BuddyAvatar key={size} size={size} alt="Buddy" />
          ))}
        </div>
        <BuddyAvatar
          framing="avatar"
          shape="circle"
          size={240}
          alt="Buddy"
          style={{ marginTop: 24 }}
        />
      </section>
      <section style={{ maxWidth: 320 }}>
        <h2 style={{ fontSize: 20 }}>Large portraits</h2>
        <p>A transparent portrait that fits the surrounding layout.</p>
        <BuddyAvatar size={280} alt="Buddy" />
      </section>
    </div>
  ),
};

export const PortraitExpressions: Story = {
  render: () => (
    <div style={{ ...row, padding: 24, maxWidth: 1040 }}>
      {expressions.map((expression) => (
        <figure key={expression} style={{ margin: 0 }}>
          <BuddyAvatar expression={expression} size={224} />
          <figcaption style={{ marginTop: 8, fontSize: 14 }}>{expression}</figcaption>
        </figure>
      ))}
    </div>
  ),
};

export const PortraitBackgrounds: Story = {
  render: () => (
    <div style={{ ...row, padding: 24 }}>
      {["#f4f3ef", "#20352e", "#b9cdd9"].map((background) => (
        <div key={background} style={{ background, padding: 20, borderRadius: 16 }}>
          <BuddyAvatar size={224} alt="Buddy on a page background" />
        </div>
      ))}
    </div>
  ),
};
