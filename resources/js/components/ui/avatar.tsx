import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "@/lib/utils";
import { Decoration } from "@/types";

function Avatar({
  className,
  decoration,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & {
  decoration?: Decoration;
}) {
  const isTelevision = decoration?.name === "Television";
  return (
    <div className="relative inline-block">
      <AvatarPrimitive.Root
        data-slot="avatar"
        className={cn(
          "relative flex size-8 m-0.5 shrink-0 overflow-hidden",
          decoration && isTelevision ? "rounded-md" : "rounded-full",
          className,
        )}
        {...props}
      />
      {decoration && (
        <img
          src={decoration.image_url}
          alt="Decoration"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        />
      )}
    </div>
  );
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center",
        className,
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
