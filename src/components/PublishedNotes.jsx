import { useState } from "react";
import CommentsPanel from "./CommentsPanel.jsx";

export default function PublishedNotes({
  notes,
  selectedNoteId,
  comments,
  onSelect,
  onEdit,
  onDelete,
  onLoadComments,
  onAddComment
}) {
  const [expandedId, setExpandedId] = useState(null);

  return (
    <section className="stack">
      <section className="card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Published Notes</p>
            <h2>Your note library</h2>
          </div>
        </div>

        {notes.length === 0 ? (
          <p className="muted">No notes published yet.</p>
        ) : (
          <div className="stack">
            {notes.map((note) => (
              <article className="note-library-card" key={note.id}>
                <div className="feed-top">
                  <div>
                    <h3>{note.title}</h3>
                    <p className="muted">{note.visibility}</p>
                  </div>
                  <div className="toolbar">
                    <button className="secondary-btn" onClick={() => onEdit(note)} type="button">
                      Edit
                    </button>
                    <button className="danger-btn" onClick={() => onDelete(note.id)} type="button">
                      Delete
                    </button>
                  </div>
                </div>

                <p>{note.body?.slice(0, 240) || "No description added yet."}</p>

                <div className="toolbar">
                  <button
                    className="secondary-btn"
                    onClick={() => {
                      onSelect(note);
                      setExpandedId((current) => (current === note.id ? null : note.id));
                    }}
                    type="button"
                  >
                    {expandedId === note.id ? "Hide details" : "Open details"}
                  </button>
                  <span className="muted">Likes {note.metrics?.likes || 0}</span>
                  <span className="muted">Saves {note.metrics?.saves || 0}</span>
                  <span className="muted">Views {note.metrics?.views || 0}</span>
                </div>

                {expandedId === note.id ? (
                  <div className="note-detail-shell">
                    {note.aiSummary ? (
                      <div className="detail-block">
                        <h4>AI Summary</h4>
                        <p>{note.aiSummary}</p>
                      </div>
                    ) : null}
                    {note.questionInsights ? (
                      <div className="detail-block">
                        <h4>Question Insights</h4>
                        <p>{note.questionInsights}</p>
                      </div>
                    ) : null}
                    <CommentsPanel
                      comments={selectedNoteId === note.id ? comments : []}
                      noteId={note.id}
                      onLoad={onLoadComments}
                      onSubmit={onAddComment}
                    />
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
