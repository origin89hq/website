import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "storybook/test";
import { BuddyPoc } from "../../src/react/components/buddy/BuddyPoc";

const meta = {
  title: "Buddy/Photo inventory POC",
  component: BuddyPoc,
  args: { example: true },
  parameters: { renderer: "react", reviewLayout: "buddy" },
} satisfies Meta<typeof BuddyPoc>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Welcome: Story = {};
export const ProgressiveInventory: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.querySelector(".poc-chat")!);
    await userEvent.click(await canvas.findByRole("button", { name: "1 · Show the solar board" }));
    await expect(await canvas.findByText(/Do you also have an inverter/)).toBeVisible();
    await userEvent.click(
      await canvas.findByRole("button", {
        name: "2 · Show inverter and wider view",
      }),
    );
    await expect(await canvas.findByText(/We’re missing your battery bank/)).toBeVisible();
    await userEvent.click(await canvas.findByRole("button", { name: "3 · Show six batteries" }));
    await expect(
      await canvas.findByText(/Could you take a close-up of the model label on one battery/),
    ).toBeVisible();
  },
};
export const Phone: Story = {
  globals: { viewport: { value: "phone", isRotated: false } },
};
