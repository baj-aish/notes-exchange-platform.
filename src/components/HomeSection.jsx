import { useMemo, useRef, useState } from "react";
import CommentsPanel from "./CommentsPanel.jsx";

export default function HomeSection({
  notes,
  trending,
  pendingRequests,
  comments,
  selectedNoteId,
  filterPreferences,
  savedPreferences,
  socialStats,
  onSearch,
  onApplySavedPreferences,
  onFilterChange,
  onSavePreferences,
  onLike,
  onSave,
  onFollow,
  onRespond,
  onOpenProfile,
  onLoadComments,
  onAddComment
}) {
  const [expandedId, setExpandedId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [preferencesView, setPreferencesView] = useState(savedPreferences ? "saved" : "edit");
  const requestsRef = useRef(null);
  const discoverableRef = useRef(null);
  const feedRef = useRef(null);

  const hasSavedPreferences = Boolean(savedPreferences);

  const availableTags = useMemo(
    () => [...new Set(trending.concat(notes).flatMap((note) => note.tags || []))].slice(0, 20),
    [notes, trending]
  );

  return (
    <section className="stack">
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">Smart Student Notes</p>
          <h1>Study, publish, and grow your own academic network.</h1>
          <p className="muted">
            Build cleaner notes, use AI to simplify content, and discover quality study material from classmates.
          </p>
          <div className="toolbar">
            <button className="primary-btn" onClick={onOpenProfile} type="button">
              Open My Profile
            </button>
          </div>
        </div>

        <div className="hero-grid">
          <button
            className="hero-metric stat-clickable"
            onClick={() => discoverableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
            type="button"
          >
            <span>{notes.length}</span>
            <p>Discoverable Notes</p>
          </button>
          <article className="hero-metric">
            <span>{trending.length}</span>
            <p>Trending Picks</p>
          </article>
          <button
            className="hero-metric stat-clickable"
            onClick={() => setShowRequestsModal(true)}
            type="button"
          >
            <span>{pendingRequests.length}</span>
            <p>Pending Requests</p>
          </button>
        </div>
      </section>

      <section className="card" ref={discoverableRef}>
        <div className="section-heading">
          <div>
            <p className="eyebrow">Explore</p>
            <h2>Search and trending notes</h2>
          </div>
          <div className="toolbar">
            {hasSavedPreferences ? (
              <button
                className="secondary-btn"
                onClick={() => {
                  setPreferencesView("saved");
                  setShowFilters(true);
                }}
                type="button"
              >
                View Saved Preference
              </button>
            ) : null}
            <button className="secondary-btn" onClick={() => setShowFilters(true)} type="button">
              Filters
            </button>
          </div>
        </div>

        <label className="field">
          <span>Search notes by title, tag, or author</span>
          <input placeholder="Try dbms, python, sem 6..." onChange={(event) => onSearch(event.target.value)} />
        </label>
      </section>

      <section className="card" ref={requestsRef}>
        <div className="section-heading">
          <div>
            <p className="eyebrow">Social Activity</p>
            <h2>Reach and pending requests</h2>
          </div>
        </div>

        <div className="dashboard-grid">
          <article className="card hover-lift">
            <p className="eyebrow">Reach</p>
            <h3>Total Reach</h3>
            <div className="metric-line">{socialStats.totalReach}</div>
            <p className="muted">Combined views, likes, saves, and comments on your content.</p>
          </article>
          <article className="card hover-lift">
            <p className="eyebrow">Views</p>
            <h3>Content Views</h3>
            <div className="metric-line">{socialStats.totalViews}</div>
            <p className="muted">How many people viewed your notes.</p>
          </article>
          <article className="card hover-lift">
            <p className="eyebrow">Requests</p>
            <h3>Pending Requests</h3>
            <div className="metric-line">{pendingRequests.length}</div>
            <p className="muted">Review requests in a quick centered pop-up.</p>
            <button className="secondary-btn" onClick={() => setShowRequestsModal(true)} type="button">
              Open Requests
            </button>
          </article>
        </div>
      </section>

      <section className="card" ref={feedRef}>
        <div className="section-heading">
          <div>
            <p className="eyebrow">Published Feed</p>
            <h2>All visible feeds</h2>
          </div>
          <button
            className="secondary-btn"
            onClick={() => feedRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
            type="button"
          >
            Open Feed
          </button>
        </div>

        <div className="stack">
          <div className="stack">
            <div>
              <p className="eyebrow">Trending Picks</p>
              <h3>Most liked, most discussed, and matched to your preference</h3>
            </div>
            {trending.length === 0 ? (
              <p className="muted">No trending picks yet.</p>
            ) : (
              <div className="trend-grid">
                {trending.map((note) => (
                  <article key={note.id} className="trend-card hover-lift">
                    <p className="eyebrow">Trending Pick</p>
                    <h3>{note.title}</h3>
                    <p className="muted">{note.authorName}</p>
                    <div className="toolbar">
                      <span className="soft-pill">Likes {note.metrics?.likes || 0}</span>
                      <span className="soft-pill">Views {note.metrics?.views || 0}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {notes.length === 0 ? (
            <p className="muted">No posts yet to display.</p>
          ) : (
            notes.map((note) => (
              <article className="feed-card hover-lift" key={note.id}>
                <div className="feed-top">
                  <div>
                    <h3>{note.title}</h3>
                    <p className="muted">
                      {note.authorName} | {note.visibility}
                    </p>
                  </div>
                  <button className="secondary-btn" onClick={() => onFollow(note.authorId, note.authorName)} type="button">
                    Follow Author
                  </button>
                </div>

                <p>{note.body?.slice(0, 220)}...</p>

                <div className="tag-row">
                  {(note.tags || []).map((tag) => (
                    <span className="tag" key={`${note.id}_${tag}`}>
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="toolbar">
                  <button className="secondary-btn" onClick={() => onLike(note)} type="button">
                    Like ({note.metrics?.likes || 0})
                  </button>
                  <button className="secondary-btn" onClick={() => onSave(note)} type="button">
                    Save ({note.metrics?.saves || 0})
                  </button>
                  <button
                    className="secondary-btn"
                    onClick={() => {
                      onLoadComments(note.id);
                      setExpandedId((current) => (current === note.id ? null : note.id));
                    }}
                    type="button"
                  >
                    {expandedId === note.id ? "Hide comments" : "Open comments"}
                  </button>
                  <span className="muted">Views: {note.metrics?.views || 0}</span>
                </div>

                {expandedId === note.id ? (
                  <CommentsPanel
                    comments={selectedNoteId === note.id ? comments : []}
                    noteId={note.id}
                    onLoad={onLoadComments}
                    onSubmit={onAddComment}
                  />
                ) : null}
              </article>
            ))
          )}
        </div>
      </section>

      {showFilters ? (
        <div className="modal-backdrop" onClick={() => setShowFilters(false)} role="presentation">
          <section className="modal-card" onClick={(event) => event.stopPropagation()} role="dialog">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Search Filters</p>
                <h2>Find notes faster</h2>
              </div>
              <button className="secondary-btn" onClick={() => setShowFilters(false)} type="button">
                Close
              </button>
            </div>

            <div className="stack">
              {hasSavedPreferences && preferencesView === "saved" ? (
                <div className="card stack">
                  <div>
                    <p className="eyebrow">Saved Preference</p>
                    <h3>Your last saved preference is ready to use</h3>
                  </div>
                  <div className="tag-row">
                    <span className="soft-pill">Sort: {savedPreferences.sortBy}</span>
                    <span className="soft-pill">Visibility: {savedPreferences.visibility}</span>
                    <span className="soft-pill">Tag: {savedPreferences.tag}</span>
                  </div>
                  <div className="toolbar">
                    <button
                      className="primary-btn"
                      onClick={() => {
                        onApplySavedPreferences();
                        setShowFilters(false);
                      }}
                      type="button"
                    >
                      Search as per Preference
                    </button>
                    <button
                      className="secondary-btn"
                      onClick={() => setPreferencesView("edit")}
                      type="button"
                    >
                      Modify Preferences
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid-2">
                    <label className="field">
                      <span>Sort by</span>
                      <select
                        value={filterPreferences.sortBy}
                        onChange={(event) => onFilterChange({ sortBy: event.target.value })}
                      >
                        <option value="relevance">Relevance</option>
                        <option value="latest">Latest</option>
                        <option value="mostViewed">Most Viewed</option>
                        <option value="mostLiked">Most Liked</option>
                      </select>
                    </label>
                    <label className="field">
                      <span>Visibility</span>
                      <select
                        value={filterPreferences.visibility}
                        onChange={(event) => onFilterChange({ visibility: event.target.value })}
                      >
                        <option value="all">All visible notes</option>
                        <option value="public">Public only</option>
                        <option value="followers">Followers only</option>
                        <option value="private">Private only</option>
                      </select>
                    </label>
                  </div>

                  <label className="field">
                    <span>Tag filter</span>
                    <select
                      value={filterPreferences.tag}
                      onChange={(event) => onFilterChange({ tag: event.target.value })}
                    >
                      <option value="all">All tags</option>
                      {availableTags.map((tag) => (
                        <option key={tag} value={tag}>
                          {tag}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="tag-row">
                    {availableTags.map((tag) => (
                      <button
                        className={filterPreferences.tag === tag ? "secondary-btn active-chip" : "secondary-btn"}
                        key={tag}
                        onClick={() => onFilterChange({ tag })}
                        type="button"
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>

                  <div className="toolbar">
                    <button
                      className="primary-btn"
                      onClick={async () => {
                        await onSavePreferences();
                        setPreferencesView("saved");
                      }}
                      type="button"
                    >
                      Save Preferences
                    </button>
                    <button
                      className="secondary-btn"
                      onClick={() => onFilterChange({ sortBy: "relevance", visibility: "all", tag: "all" })}
                      type="button"
                    >
                      Reset Filters
                    </button>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      ) : null}

      {showRequestsModal ? (
        <div className="modal-backdrop" onClick={() => setShowRequestsModal(false)} role="presentation">
          <section
            className="modal-card modal-card-centered"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className="section-heading">
              <div>
                <p className="eyebrow">Pending Requests</p>
                <h2>Follower requests</h2>
              </div>
              <button className="secondary-btn" onClick={() => setShowRequestsModal(false)} type="button">
                Close
              </button>
            </div>

            {pendingRequests.length === 0 ? (
              <p className="muted">No friend request yet.</p>
            ) : (
              <div className="stack">
                {pendingRequests.map((request) => (
                  <article className="feed-card hover-lift" key={request.id}>
                    <div>
                      <h3>{request.senderName}</h3>
                      <p className="muted">wants to follow your notes.</p>
                    </div>
                    <div className="toolbar">
                      <button className="primary-btn" onClick={() => onRespond(request, true)} type="button">
                        Accept
                      </button>
                      <button
                        className="secondary-btn"
                        onClick={() => onRespond(request, true, true)}
                        type="button"
                      >
                        Accept & Follow Back
                      </button>
                      <button className="secondary-btn" onClick={() => onRespond(request, false)} type="button">
                        Reject
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : null}
    </section>
  );
}
