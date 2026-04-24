export default function Dashboard({
  profile,
  notes,
  requests,
  savedNotes,
  onOpenPublished,
  onOpenFeed,
  onOpenRequests,
  onOpenFollowers,
  onOpenFollowing
}) {
  const totalEngagement = notes.reduce(
    (sum, note) => sum + (note.metrics?.likes || 0) + (note.metrics?.saves || 0) + (note.metrics?.views || 0),
    0
  );

  return (
    <section className="stack">
      <section className="card dashboard-hero">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h2>{profile?.name || "Student"}'s workspace</h2>
          <p className="muted">
            Track your publishing activity, social reach, and note performance from one place.
          </p>
        </div>
        <button className="primary-btn" onClick={onOpenPublished} type="button">
          Open Published Notes
        </button>
      </section>

      <section className="stats-grid">
        <button className="stat-card stat-clickable" onClick={onOpenPublished} type="button">
          <span>{notes.length}</span>
          <p>Published Notes</p>
        </button>
        <button className="stat-card stat-clickable" onClick={onOpenFollowers} type="button">
          <span>{profile?.followers?.length || 0}</span>
          <p>Followers</p>
        </button>
        <button className="stat-card stat-clickable" onClick={onOpenFollowing} type="button">
          <span>{profile?.following?.length || 0}</span>
          <p>Following</p>
        </button>
        <button className="stat-card stat-clickable" onClick={onOpenRequests} type="button">
          <span>{requests.length}</span>
          <p>Pending Requests</p>
        </button>
      </section>

      <section className="dashboard-grid">
        <article className="card hover-lift">
          <p className="eyebrow">Performance</p>
          <h3>Total Engagement</h3>
          <div className="metric-line">{totalEngagement}</div>
          <p className="muted">Likes, saves, and views collected across your published notes.</p>
        </article>

        <article className="card hover-lift">
          <p className="eyebrow">Saved Library</p>
          <h3>Saved Notes</h3>
          <div className="metric-line">{savedNotes.length}</div>
          <p className="muted">Notes you saved from the home feed for future revision.</p>
        </article>

        <article className="card hover-lift">
          <p className="eyebrow">Discoverability</p>
          <h3>Open Feed</h3>
          <div className="metric-line">{notes.length}</div>
          <p className="muted">See the notes feed exactly the way users discover it.</p>
          <button className="secondary-btn" onClick={onOpenFeed} type="button">
            Open Feed
          </button>
        </article>
      </section>
    </section>
  );
}
