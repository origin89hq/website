import type { Meta, StoryObj } from "@storybook/react";
import { ArrowUpRightIcon } from "lucide-react";
import { Button } from "../src/react/components/ui/button";

const meta = {
  title: "Components/Buttons",
  component: Button,
  parameters: { renderer: "react" },
  args: {
    children: "Show Buddy your setup",
    variant: "default",
    size: "lg",
    disabled: false,
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "outline", "ghost", "link", "destructive"],
    },
    size: { control: "select", options: ["sm", "default", "lg", "icon"] },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Primary: Story = {};
export const Outline: Story = {
  args: { variant: "outline", children: "Explore the equipment" },
};
export const Quiet: Story = {
  args: { variant: "ghost", children: "Not sure yet" },
};
export const Disabled: Story = {
  args: { disabled: true, children: "Review connection" },
};
export const States: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
      <Button size="lg">Show Buddy your setup</Button>
      <Button size="lg" disabled>
        Review connection
      </Button>
      <Button variant="outline" size="lg">
        Explore the equipment
      </Button>
      <Button variant="outline" size="lg" disabled>
        Explore the equipment
      </Button>
    </div>
  ),
};
export const Icon: Story = {
  args: {
    size: "icon",
    children: <ArrowUpRightIcon />,
    "aria-label": "Explore equipment",
  },
};
