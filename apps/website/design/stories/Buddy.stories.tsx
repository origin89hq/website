import { journalAssets } from "../../src/react/lib/react-assets";

const { buddy, plate, cottage } = journalAssets;

import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "storybook/test";
import BuddyWorkspace from "../../src/react/components/buddy/BuddyWorkspace";

const meta = {
  title: "Buddy/Setup conversation",
  component: BuddyWorkspace,
  parameters: { renderer: "react", reviewLayout: "buddy" },
  args: {
    buddyUrl: buddy,
    plateUrl: plate,
    photoUrl: cottage,
    site: undefined,
    scenario: "welcome",
    view: "chat",
  },
  argTypes: {
    scenario: {
      control: "select",
      options: ["welcome", "photo", "identified", "unknown", "complete", "error", "streaming"],
    },
    site: { control: "select", options: ["cottage", "mining", "telecom"] },
    view: { control: "inline-radio", options: ["chat", "map"] },
    buddyUrl: { table: { disable: true } },
    plateUrl: { table: { disable: true } },
    photoUrl: { table: { disable: true } },
    transport: { table: { disable: true } },
    onClose: { table: { disable: true } },
  },
} satisfies Meta<typeof BuddyWorkspace>;
export default meta;
type Story = StoryObj<typeof meta>;
export const StartWithAPhoto: Story = {};
export const PhotoAttached: Story = { args: { scenario: "photo" } };
export const ModelIdentified: Story = { args: { scenario: "identified" } };
export const ModelUnknown: Story = { args: { scenario: "unknown" } };
export const SetupMapped: Story = { args: { scenario: "complete" } };
export const Phone: Story = {
  globals: { viewport: { value: "phone", isRotated: false } },
};
export const PhoneMap: Story = {
  args: { scenario: "complete", view: "map" },
  globals: { viewport: { value: "phone", isRotated: false } },
};
export const Mining: Story = { args: { site: "mining" } };
export const Telecom: Story = { args: { site: "telecom" } };
export const ConnectionInterrupted: Story = {
  args: { scenario: "error" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: "Try a solar example" }));
    await expect(
      await canvas.findByText("Connection interrupted. Your messages are still here."),
    ).toBeVisible();
  },
};
export const Streaming: Story = {
  args: { scenario: "streaming" },
  play: async ({ canvasElement }) => {
    await userEvent.click(
      await within(canvasElement).findByRole("button", {
        name: "Try a solar example",
      }),
    );
  },
};
