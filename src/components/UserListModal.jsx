export default function UserListModal({ title, users, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <section className="modal-card" onClick={(event) => event.stopPropagation()} role="dialog">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Connections</p>
            <h2>{title}</h2>
          </div>
          <button className="secondary-btn" onClick={onClose} type="button">
            Close
          </button>
        </div>

        <div className="stack">
          {users.length === 0 ? (
            <p className="muted">No users to show here yet.</p>
          ) : (
            users.map((user) => (
              <article className="list-card" key={user.id}>
                <div className="avatar-circle">{(user.name || "S").slice(0, 1).toUpperCase()}</div>
                <div>
                  <h3>{user.name}</h3>
                  <p className="muted">{user.email}</p>
                  {user.course ? <p className="muted">{user.course}</p> : null}
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
