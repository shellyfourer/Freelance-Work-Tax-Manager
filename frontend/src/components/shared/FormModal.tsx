"use client";

import { type SubmitEvent, type ReactNode, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface FormModalProps {
  open: boolean;
  title: string;
  isSubmitting: boolean;
  isDirty: boolean;
  apiError: string | null;
  onSubmit: (e: SubmitEvent<HTMLFormElement>) => void;
  onClose: () => void;
  children: ReactNode;
}

const cardClass =
  "w-full flex flex-col gap-5 p-6 rounded-modal border-[1.5px] border-border bg-card shadow-elevation-sm";
const buttonClass = "flex-1 h-12 cursor-pointer";

export function FormModal({
  open,
  title,
  isSubmitting,
  isDirty,
  apiError,
  onSubmit,
  onClose,
  children,
}: FormModalProps) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const requestClose = () => {
    if (isDirty) setShowCancelConfirm(true);
    else onClose();
  };

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (showCancelConfirm) setShowCancelConfirm(false);
      else if (isDirty) setShowCancelConfirm(true);
      else onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, showCancelConfirm, isDirty, onClose]);

  if (!open) return null;

  return (
    <>
      <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <AlertDialogContent className="shadow-elevation-sm border-[1.5px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel? Your input will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="border-t-0 bg-transparent mx-0 mb-0 px-0 pb-0 pt-0">
            <AlertDialogCancel className="cursor-pointer">Keep editing</AlertDialogCancel>
            <AlertDialogAction
              variant="outline"
              onClick={onClose}
              className="cursor-pointer border-destructive text-destructive hover:bg-destructive/10! hover:text-destructive!"
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div
        role="button"
        tabIndex={0}
        aria-label="Close modal"
        className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/45"
        onClick={requestClose}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") requestClose();
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          className={cn(cardClass, "max-w-110")}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <p className="text-h4 text-foreground m-0">{title}</p>
          <Separator className="opacity-40" />

          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
            {children}

            {apiError && (
              <div className="flex items-center gap-2 px-3 py-2 border border-dashed rounded-lg border-destructive">
                <p className="text-caption text-destructive">⚠ {apiError}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting} className={buttonClass}>
                {isSubmitting ? "Saving…" : "Save"}
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={requestClose}
                disabled={isSubmitting}
                className={buttonClass}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
