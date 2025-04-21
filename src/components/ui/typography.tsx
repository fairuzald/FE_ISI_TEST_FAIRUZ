"use client";

import { cn } from "@/lib/utils";
import * as React from "react";

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  level?:
    | "xs"
    | "sm"
    | "base"
    | "lg"
    | "xl"
    | "2xl"
    | "3xl"
    | "6xl"
    | "biggest"
    | "tr";
}

const Typography: React.ForwardRefRenderFunction<
  HTMLElement,
  TypographyProps
> = ({ className, level = "base", as: Component = "span", ...props }, ref) => {
  const levelClasses = {
    xs: "text-[10px] lg:text-xs",
    sm: "text-xs lg:text-sm",
    base: "text-sm lg:text-base",
    lg: "text-sm md:text-base xl:text-lg",
    xl: "text-base lg:text-lg 2xl:text-xl",
    "2xl": "text-lg lg:text-xl xl:text-2xl",
    "3xl": "text-2xl font-semibold lg:text-[32px]",
    "6xl": "text-4xl lg:text-5xl 2xl:text-6xl",
    biggest: "text-5xl lg:text-6xl 2xl:text-7xl",
    tr: "text-[12px] lg:text-sm",
  };

  const handleRef = React.useCallback(
    (node: HTMLElement | null) => {
      if (typeof ref === "function") {
        ref(node);
      } else if (ref && typeof ref === "object") {
        const mutableRef =
          Object.isExtensible(ref) && ref.current !== undefined
            ? ref
            : { current: null };
        mutableRef.current = node;
      }
    },
    [ref]
  );

  return (
    <Component
      className={cn(
        "font-normal text-gray-900 dark:text-gray-100",
        levelClasses[level],
        className
      )}
      ref={handleRef}
      {...props}
    />
  );
};

Typography.displayName = "Typography";

// Specialized Typography components
export const H1: React.FC<Omit<TypographyProps, "as">> = (props) => (
  <Typography as="h1" level="3xl" className="font-bold" {...props} />
);

export const H2: React.FC<Omit<TypographyProps, "as">> = (props) => (
  <Typography as="h2" level="2xl" className="font-semibold" {...props} />
);

export const H3: React.FC<Omit<TypographyProps, "as">> = (props) => (
  <Typography as="h3" level="xl" className="font-medium" {...props} />
);

export const H4: React.FC<Omit<TypographyProps, "as">> = (props) => (
  <Typography as="h4" level="lg" className="font-medium" {...props} />
);

export const H5: React.FC<Omit<TypographyProps, "as">> = (props) => (
  <Typography as="h5" level="base" className="font-medium" {...props} />
);

export const P: React.FC<Omit<TypographyProps, "as">> = (props) => (
  <Typography as="p" level="base" {...props} />
);

export const Small: React.FC<Omit<TypographyProps, "as">> = (props) => (
  <Typography
    as="small"
    level="sm"
    className="text-gray-600 dark:text-gray-400"
    {...props}
  />
);

export const Label: React.FC<
  Omit<TypographyProps, "as"> & { htmlFor?: string }
> = (props) => (
  <Typography
    as="label"
    level="sm"
    className="font-medium text-gray-700 dark:text-gray-300"
    {...props}
  />
);

export { Typography };
