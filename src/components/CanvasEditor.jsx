import { useEffect, useState } from "react";
import { loadSnapshot, Tldraw } from "tldraw";

export default function CanvasEditor({ initialSnapshot, onSaveSnapshot }) {
  const [editor, setEditor] = useState(null);

  useEffect(() => {
    if (!editor || !initialSnapshot) return;
    try {
      loadSnapshot(editor.store, initialSnapshot);
    } catch (error) {
      console.error("Unable to load saved canvas snapshot.", error);
    }
  }, [editor, initialSnapshot]);

  const saveCanvas = () => {
    if (!editor) return;
    onSaveSnapshot(editor.store.getSnapshot());
  };

  return (
    <div className="canvas-shell">
      <div className="canvas-header">
        <p>Infinite Canvas Workspace</p>
        <button className="secondary-btn" type="button" onClick={saveCanvas}>
          Save Canvas State
        </button>
      </div>
      <div className="canvas-frame">
        <Tldraw onMount={setEditor} />
      </div>
    </div>
  );
}
