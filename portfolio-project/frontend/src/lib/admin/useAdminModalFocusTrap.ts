import { RefObject, useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const getFocusableElements = (container: HTMLElement): HTMLElement[] =>
  Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) =>
      !element.hasAttribute("disabled") &&
      element.getAttribute("aria-hidden") !== "true" &&
      window.getComputedStyle(element).display !== "none" &&
      window.getComputedStyle(element).visibility !== "hidden",
  );

export function useAdminModalFocusTrap(
  activeModalRef: RefObject<HTMLElement | null> | null,
) {
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const activeModal = activeModalRef?.current ?? null;

    if (!activeModal) {
      previouslyFocusedElementRef.current?.focus();
      previouslyFocusedElementRef.current = null;
      return;
    }

    if (!previouslyFocusedElementRef.current) {
      const activeElement = document.activeElement;
      if (activeElement instanceof HTMLElement) {
        previouslyFocusedElementRef.current = activeElement;
      }
    }

    const focusInitialElement = () => {
      const focusableElements = getFocusableElements(activeModal);
      (focusableElements[0] || activeModal).focus();
    };

    const animationFrameId = requestAnimationFrame(focusInitialElement);

    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = getFocusableElements(activeModal);
      if (focusableElements.length === 0) {
        event.preventDefault();
        activeModal.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const currentActive = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (!currentActive || currentActive === firstElement || !activeModal.contains(currentActive)) {
          event.preventDefault();
          lastElement.focus();
        }
        return;
      }

      if (!currentActive || currentActive === lastElement || !activeModal.contains(currentActive)) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    activeModal.addEventListener("keydown", trapFocus);
    return () => {
      cancelAnimationFrame(animationFrameId);
      activeModal.removeEventListener("keydown", trapFocus);
    };
  }, [activeModalRef]);
}
