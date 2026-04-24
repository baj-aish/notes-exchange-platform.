import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import CanvasEditor from "./CanvasEditor.jsx";
import { useSpeechToText } from "../hooks/useSpeechToText.js";

const blankForm = {
  title: "",
  tags: "",
  visibility: "public",
  body: "",
  aiSummary: "",
  questionInsights: "",
  canvasSnapshot: null
};

export default function NoteEditor({
  activeUser,
  saving,
  editingNote,
  onSave,
  onCancelEdit,
  onLoadDraft,
  onSummarize,
  onAnalyzeQuestions
}) {
  const [form, setForm] = useState(blankForm);
  const { listening, supported, transcript, startListening, stopListening } =
    useSpeechToText();

  useEffect(() => {
    if (!editingNote) {
      setForm(blankForm);
      return;
    }

    setForm({
      title: editingNote.title || "",
      tags: Array.isArray(editingNote.tags) ? editingNote.tags.join(", ") : editingNote.tags || "",
      visibility: editingNote.visibility || "public",
      body: editingNote.body || "",
      aiSummary: editingNote.aiSummary || "",
      questionInsights: editingNote.questionInsights || "",
      canvasSnapshot: editingNote.canvasSnapshot || null
    });
  }, [editingNote]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    await onSave({
      ...form,
      id: editingNote?.id,
      authorId: activeUser.uid,
      authorName: activeUser.name
    });
    setForm(blankForm);
  };

  const exportPdf = () => {
    const pdf = new jsPDF();
    pdf.setFontSize(18);
    pdf.text(form.title || "Untitled Note", 14, 20);
    pdf.setFontSize(11);
    pdf.text(`Author: ${activeUser.name}`, 14, 30);
    pdf.text(`Tags: ${form.tags}`, 14, 38);
    pdf.text(`Visibility: ${form.visibility}`, 14, 46);
    pdf.text("Main Notes:", 14, 56);
    pdf.text(pdf.splitTextToSize(form.body || "-", 180), 14, 64);

    if (form.aiSummary) {
      pdf.addPage();
      pdf.text("AI Summary", 14, 20);
      pdf.text(pdf.splitTextToSize(form.aiSummary, 180), 14, 30);
    }

    if (form.questionInsights) {
      pdf.addPage();
      pdf.text("Question Paper Insights", 14, 20);
      pdf.text(pdf.splitTextToSize(form.questionInsights, 180), 14, 30);
    }

    pdf.save(`${form.title || "smart-note"}.pdf`);
  };

  const saveDraftToDevice = () => {
    const blob = new Blob([JSON.stringify(form, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${form.title || "smart-note-draft"}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="card stack">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Create Notes</p>
          <h2>{editingNote ? "Edit your note" : "AI-assisted editor"}</h2>
        </div>
        <div className="toolbar">
          {editingNote ? (
            <button className="secondary-btn" onClick={onCancelEdit} type="button">
              Cancel Edit
            </button>
          ) : null}
          <button className="secondary-btn" onClick={saveDraftToDevice} type="button">
            Save Draft to Device
          </button>
          <label className="secondary-btn upload-btn">
            Publish Saved Draft
            <input
              accept=".json,application/json"
              className="hidden-input"
              type="file"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                const text = await file.text();
                const draft = JSON.parse(text);
                setForm({
                  ...blankForm,
                  ...draft
                });
                onLoadDraft?.();
              }}
            />
          </label>
          <button className="secondary-btn" type="button" onClick={exportPdf}>
            Export PDF
          </button>
        </div>
      </div>

      <form className="stack" onSubmit={handleSave}>
        <div className="grid-2">
          <label className="field">
            <span>Note title</span>
            <input
              required
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
            />
          </label>

          <label className="field">
            <span>Visibility</span>
            <select
              value={form.visibility}
              onChange={(event) => updateField("visibility", event.target.value)}
            >
              <option value="public">Public</option>
              <option value="followers">Followers only</option>
              <option value="private">Private</option>
            </select>
          </label>
        </div>

        <label className="field">
          <span>Tags (comma separated)</span>
          <input
            placeholder="os, dbms, ai, sem-6"
            value={form.tags}
            onChange={(event) => updateField("tags", event.target.value)}
          />
        </label>

        <label className="field">
          <span>Study material / main notes</span>
          <textarea
            rows="8"
            value={form.body}
            onChange={(event) => updateField("body", event.target.value)}
          />
        </label>

        <div className="toolbar">
          {supported ? (
            <>
              <button
                className={listening ? "danger-btn" : "secondary-btn"}
                type="button"
                onClick={listening ? stopListening : startListening}
              >
                {listening ? "Stop voice input" : "Start voice input"}
              </button>
              <button
                className="secondary-btn"
                disabled={!transcript}
                type="button"
                onClick={() =>
                  updateField("body", `${form.body}\n${transcript}`.trim())
                }
              >
                Insert transcript
              </button>
            </>
          ) : (
            <span className="muted">Speech recognition is not supported in this browser.</span>
          )}
          <button
            className="secondary-btn"
            type="button"
            onClick={async () => updateField("aiSummary", await onSummarize(form.body))}
          >
            Generate AI summary
          </button>
          <button
            className="secondary-btn"
            type="button"
            onClick={async () =>
              updateField("questionInsights", await onAnalyzeQuestions(form.body))
            }
          >
            Analyze previous year questions
          </button>
        </div>

        <label className="field">
          <span>AI Summary</span>
          <textarea
            rows="4"
            value={form.aiSummary}
            onChange={(event) => updateField("aiSummary", event.target.value)}
          />
        </label>

        {transcript && (
          <label className="field">
            <span>Latest voice transcript</span>
            <textarea readOnly rows="3" value={transcript} />
          </label>
        )}

        <label className="field">
          <span>Question Paper Insights</span>
          <textarea
            rows="4"
            value={form.questionInsights}
            onChange={(event) => updateField("questionInsights", event.target.value)}
          />
        </label>

        <CanvasEditor
          initialSnapshot={form.canvasSnapshot}
          onSaveSnapshot={(snapshot) => updateField("canvasSnapshot", snapshot)}
        />

        <button className="primary-btn" disabled={saving} type="submit">
          {saving ? "Saving..." : editingNote ? "Update note" : "Publish note"}
        </button>
      </form>
    </section>
  );
}
