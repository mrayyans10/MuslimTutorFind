import * as React from "react";
import { AlertCircle } from "lucide-react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface FormErrorProps {
  id?: string;
  message?: string | null;
  className?: string;
}

export function FormError({ id, message, className }: FormErrorProps) {
  if (!message) return null;

  return (
    <p
      id={id}
      role="alert"
      className={cn(
        "flex items-start gap-2 text-sm font-medium text-destructive",
        className,
      )}
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
      <span>{message}</span>
    </p>
  );
}

export interface FieldWrapperProps {
  id: string;
  label: string;
  description?: string;
  error?: string | null;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function FieldWrapper({
  id,
  label,
  description,
  error,
  required,
  className,
  children,
}: FieldWrapperProps) {
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>
        {label}
        {required ? (
          <span className="ml-1 text-destructive" aria-hidden>
            *
          </span>
        ) : null}
      </Label>
      {description ? (
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {description}
        </p>
      ) : null}
      {React.isValidElement(children)
        ? React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
            id,
            "aria-invalid": error ? true : undefined,
            "aria-describedby":
              [descriptionId, errorId].filter(Boolean).join(" ") || undefined,
          })
        : children}
      {error ? <FormError id={errorId} message={error} /> : null}
    </div>
  );
}
