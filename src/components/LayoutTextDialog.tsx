import { layoutAsText } from '../core/entry';
import type { Box } from '../core/layout';
import { CopyButton, Dialog } from './Dialog';

export function LayoutTextDialog({ boxes, onClose }: { boxes: Box[]; onClose: () => void }) {
  const text = layoutAsText(boxes);
  return (
    <Dialog title="Układ boxów" onClose={onClose}>
      <textarea readOnly value={text} aria-label="Układ jako tekst" />
      <div className="dialog-row">
        <CopyButton text={text} />
        <button onClick={onClose}>Zamknij</button>
      </div>
    </Dialog>
  );
}
