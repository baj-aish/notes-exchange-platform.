import { useEffect, useState } from "react";

export default function CommentsPanel({ noteId, comments, onLoad, onSubmit }) {
  const [text, setText] = useState("");

  useEffect(() => {
    if (!noteId) return;
    onLoad(noteId);
  }, [noteId]);

  return (
    <section className="comments-shell">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Comments</p>
          <h3>Discussion</h3>
        </div>
      </div>

      <div className="stack">
        {comments.length === 0 ? (
          <p className="muted">No comments yet. Start the first discussion.</p>
        ) : (
          comments.map((comment) => (
            <article className="comment-card" key={comment.id}>
              <strong>{comment.userName}</strong>
              <p>{comment.text}</p>
            </article>
          ))
        )}
      </div>

      <div className="comment-form">
        <textarea
          placeholder="Write a meaningful comment..."
          rows="3"
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        <button
          className="primary-btn"
          type="button"
          onClick={async () => {
            if (!text.trim()) return;
            await onSubmit(noteId, text.trim());
            setText("");
          }}
        >
          Post Comment
        </button>
      </div>
    </section>
  );
}
