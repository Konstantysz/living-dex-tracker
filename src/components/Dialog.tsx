import { useEffect, useRef, type ReactNode } from 'react';

/** Native <dialog> opened as modal while mounted. Escape/backdrop close via onClose. */
export function Dialog({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal?.();
  }, []);
  return (
    <dialog ref={ref} onClose={onClose} aria-label={title}>
      <h3>{title}</h3>
      {children}
    </dialog>
  );
}

export function CopyButton({ text }: { text: string }) {
  const ref = useRef<HTMLButtonElement>(null);
  const flash = (msg: string) => {
    const b = ref.current;
    if (!b) return;
    b.textContent = msg;
    setTimeout(() => (b.textContent = 'Kopiuj'), 1500);
  };
  return (
    <button
      ref={ref}
      onClick={() =>
        navigator.clipboard.writeText(text).then(
          () => flash('Skopiowano'),
          () => flash('Zaznacz i Ctrl+C'),
        )
      }
    >
      Kopiuj
    </button>
  );
}
