"use client";

import type { FileUIPart } from "ai";
import { ImageIcon, XIcon } from "lucide-react";
import { createContext, type HTMLAttributes, type ReactNode, useContext, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* Photos waiting to be sent. Buddy accepts images only and lays them out as a grid of thumbnails,
 * so there is no variant here and no media-type table: anything that is not a readable image falls
 * back to one icon. */
export type AttachmentData = FileUIPart & { id: string };

type AttachmentContextValue = { data: AttachmentData; onRemove?: () => void };
const AttachmentContext = createContext<AttachmentContextValue | null>(null);

const useAttachment = () => {
  const value = useContext(AttachmentContext);
  if (!value) throw new Error("Attachment parts must be rendered inside an Attachment.");
  return value;
};

export type AttachmentsProps = HTMLAttributes<HTMLDivElement>;

export const Attachments = ({ className, children, ...props }: AttachmentsProps) => (
  <div className={cn("ml-auto flex w-fit flex-wrap items-start gap-2", className)} {...props}>
    {children}
  </div>
);

export type AttachmentProps = HTMLAttributes<HTMLDivElement> & {
  data: AttachmentData;
  onRemove?: () => void;
};

export const Attachment = ({ data, onRemove, className, children, ...props }: AttachmentProps) => {
  const value = useMemo(() => ({ data, onRemove }), [data, onRemove]);
  return (
    <AttachmentContext.Provider value={value}>
      <div
        className={cn("group relative size-24 overflow-hidden rounded-lg", className)}
        {...props}
      >
        {children}
      </div>
    </AttachmentContext.Provider>
  );
};

export type AttachmentPreviewProps = HTMLAttributes<HTMLDivElement> & {
  fallbackIcon?: ReactNode;
};

export const AttachmentPreview = ({
  fallbackIcon,
  className,
  ...props
}: AttachmentPreviewProps) => {
  const { data } = useAttachment();
  const isImage = data.mediaType?.startsWith("image/") && data.url;
  return (
    <div
      className={cn(
        "flex size-full shrink-0 items-center justify-center overflow-hidden bg-muted",
        className,
      )}
      {...props}
    >
      {isImage ? (
        <img
          alt={data.filename || "Image"}
          className="size-full object-cover"
          height={96}
          src={data.url}
          width={96}
        />
      ) : (
        (fallbackIcon ?? <ImageIcon className="size-4 text-muted-foreground" />)
      )}
    </div>
  );
};

export type AttachmentRemoveProps = React.ComponentProps<typeof Button> & { label?: string };

export const AttachmentRemove = ({
  label = "Remove",
  className,
  children,
  ...props
}: AttachmentRemoveProps) => {
  const { onRemove } = useAttachment();
  if (!onRemove) return null;
  return (
    <Button
      aria-label={label}
      className={cn(
        "absolute top-2 right-2 size-6 rounded-full bg-background/80 p-0 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-background [&>svg]:size-3",
        className,
      )}
      onClick={(event) => {
        event.stopPropagation();
        onRemove();
      }}
      type="button"
      variant="ghost"
      {...props}
    >
      {children ?? <XIcon />}
      <span className="sr-only">{label}</span>
    </Button>
  );
};
