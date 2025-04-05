import { cn } from "@/lib/utils";
import { FC, HTMLAttributes, ReactNode } from "react";

interface PageHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export const PageHeader: FC<PageHeaderProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn("flex flex-col space-y-2", className)} {...props}>
      {children}
    </div>
  );
};

interface PageHeaderHeadingProps extends HTMLAttributes<HTMLHeadingElement> {}

export const PageHeaderHeading: FC<PageHeaderHeadingProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <h1
      className={cn(
        "text-3xl font-bold tracking-tight text-foreground md:text-4xl",
        className
      )}
      {...props}
    >
      {children}
    </h1>
  );
};

interface PageHeaderDescriptionProps
  extends HTMLAttributes<HTMLParagraphElement> {}

export const PageHeaderDescription: FC<PageHeaderDescriptionProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <p
      className={cn("text-lg text-muted-foreground", className)}
      {...props}
    >
      {children}
    </p>
  );
};