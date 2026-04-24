import { useEffect, useMemo, useState } from "react";
import AuthPanel from "./components/AuthPanel.jsx";
import BottomNav from "./components/BottomNav.jsx";
import Dashboard from "./components/Dashboard.jsx";
import HomeSection from "./components/HomeSection.jsx";
import NoteEditor from "./components/NoteEditor.jsx";
import ProfileSection from "./components/ProfileSection.jsx";
import PublishedNotes from "./components/PublishedNotes.jsx";
import UserListModal from "./components/UserListModal.jsx";
import {
  getProfile,
  getUsersByIds,
  login,
  logout,
  saveUserPreferences,
  signup,
  updateProfile,
  watchAuth
} from "./services/authService.js";
import {
  addComment,
  analyzeQuestionPaper,
  createNote,
  deleteNote,
  getAllComments,
  getCommentsForNote,
  getFollowRequests,
  getNotesForUser,
  getTrendingNotes,
  getVisibleNotes,
  respondToFollowRequest,
  sendFollowRequest,
  summarizeText,
  toggleLike,
  toggleSave,
  updateNote
} from "./services/noteService.js";
import { isFirebaseConfigured } from "./services/firebase.js";

const defaultFilterPreferences = {
  sortBy: "relevance",
  visibility: "all",
  tag: "all"
};

const getCommentCountMap = (comments = []) =>
  comments.reduce((accumulator, comment) => {
    accumulator[comment.noteId] = (accumulator[comment.noteId] || 0) + 1;
    return accumulator;
  }, {});

const getSearchScore = (note, queryText) => {
  if (!queryText) return 0;
  const searchText = queryText.toLowerCase();
  const searchable = [note.title, note.body, note.authorName, ...(note.tags || [])]
    .join(" ")
    .toLowerCase();
  return searchable.split(searchText).length - 1;
};

const applyFeedFilters = (feed, queryText, filterPreferences) => {
  const search = queryText.toLowerCase().trim();
  const filtered = feed.filter((note) => {
    const searchable = [note.title, note.body, note.authorName, ...(note.tags || [])]
      .join(" ")
      .toLowerCase();
    const matchesSearch = !search || searchable.includes(search);
    const matchesTag =
      filterPreferences.tag === "all" || (note.tags || []).includes(filterPreferences.tag);
    const matchesVisibility =
      filterPreferences.visibility === "all" ||
      note.visibility === filterPreferences.visibility;
    return matchesSearch && matchesTag && matchesVisibility;
  });

  return [...filtered].sort((left, right) => {
    if (filterPreferences.sortBy === "latest") {
      return (right.createdAt?.seconds || 0) - (left.createdAt?.seconds || 0);
    }
    if (filterPreferences.sortBy === "mostViewed") {
      return (right.metrics?.views || 0) - (left.metrics?.views || 0);
    }
    if (filterPreferences.sortBy === "mostLiked") {
      return (right.metrics?.likes || 0) - (left.metrics?.likes || 0);
    }
    return getSearchScore(right, search) - getSearchScore(left, search);
  });
};

const getPreferenceMatchScore = (note, preferences) => {
  if (!preferences) return 0;

  let score = 0;

  if (preferences.tag !== "all" && (note.tags || []).includes(preferences.tag)) {
    score += 8;
  }

  if (preferences.visibility !== "all" && note.visibility === preferences.visibility) {
    score += 4;
  }

  return score;
};

const getTrendingPicks = (feed, comments, preferences) => {
  const commentCountMap = getCommentCountMap(comments);

  return [...feed]
    .sort((left, right) => {
      const leftScore =
        (left.metrics?.likes || 0) * 5 +
        (commentCountMap[left.id] || 0) * 6 +
        (left.metrics?.saves || 0) * 3 +
        (left.metrics?.views || 0) +
        getPreferenceMatchScore(left, preferences);
      const rightScore =
        (right.metrics?.likes || 0) * 5 +
        (commentCountMap[right.id] || 0) * 6 +
        (right.metrics?.saves || 0) * 3 +
        (right.metrics?.views || 0) +
        getPreferenceMatchScore(right, preferences);
      return rightScore - leftScore;
    })
    .slice(0, 5);
};

export default function App() {
  const [firebaseReady] = useState(isFirebaseConfigured);
  const [authUser, setAuthUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [notes, setNotes] = useState([]);
  const [myNotes, setMyNotes] = useState([]);
  const [savedNotes, setSavedNotes] = useState([]);
  const [trending, setTrending] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("home");
  const [editingNote, setEditingNote] = useState(null);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [comments, setComments] = useState([]);
  const [modalConfig, setModalConfig] = useState(null);
  const [allVisibleNotes, setAllVisibleNotes] = useState([]);
  const [allComments, setAllComments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPreferences, setFilterPreferences] = useState(defaultFilterPreferences);

  const refreshData = async (currentUser) => {
    if (!currentUser) return;
    const currentProfile = await getProfile(currentUser.uid);
    const following = currentProfile?.following || [];

    const [feedResult, mineResult, topNotesResult, pendingRequestsResult, allCommentsResult] =
      await Promise.allSettled([
        getVisibleNotes({ currentUserId: currentUser.uid, following }),
        getNotesForUser(currentUser.uid),
        getTrendingNotes({ currentUserId: currentUser.uid, following }),
        getFollowRequests(currentUser.uid),
        getAllComments()
      ]);

    const feed = feedResult.status === "fulfilled" ? feedResult.value : [];
    const mine = mineResult.status === "fulfilled" ? mineResult.value : [];
    const topNotes =
      topNotesResult.status === "fulfilled" ? topNotesResult.value : [];
    const pendingRequests =
      pendingRequestsResult.status === "fulfilled"
        ? pendingRequestsResult.value
        : [];
    const commentEntries =
      allCommentsResult.status === "fulfilled"
        ? allCommentsResult.value
        : [];

    setProfile(currentProfile);
    setAllVisibleNotes(feed);
    setAllComments(commentEntries);
    setNotes(applyFeedFilters(feed, searchQuery, filterPreferences));
    setMyNotes(mine);
    setSavedNotes(feed.filter((note) => note.savedBy?.includes(currentUser.uid)));
    setTrending(topNotes);
    setRequests(pendingRequests);
  };

  useEffect(() => {
    if (!authUser) return;
    if (profile?.searchPreferences) {
      setFilterPreferences({
        ...defaultFilterPreferences,
        ...profile.searchPreferences
      });
      return;
    }

    const storedPreferences = window.localStorage.getItem(`smart-notes-filters-${authUser.uid}`);
    if (!storedPreferences) {
      setFilterPreferences(defaultFilterPreferences);
      return;
    }

    try {
      setFilterPreferences(JSON.parse(storedPreferences));
    } catch (error) {
      console.error(error);
    }
  }, [authUser, profile?.searchPreferences]);

  useEffect(() => {
    setNotes(applyFeedFilters(allVisibleNotes, searchQuery, filterPreferences));
  }, [allVisibleNotes, filterPreferences, searchQuery]);

  useEffect(() => {
    const unsubscribe = watchAuth(async (currentUser) => {
      try {
        setAuthUser(currentUser);
        if (!currentUser) {
          return;
        }

        await refreshData(currentUser);
      } catch (error) {
        showError(error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const showError = (error) => {
    console.error(error);
    setMessage(error.message || "Something went wrong.");
  };

  const runAuthAction = async (action) => {
    try {
      setMessage("");
      await action();
    } catch (error) {
      showError(error);
    }
  };

  const handleSaveNote = async (payload) => {
    try {
      setSaving(true);
      if (payload.id) {
        await updateNote(payload.id, payload);
        setMessage("Note updated successfully.");
      } else {
        await createNote(payload);
        setMessage("Note published successfully.");
      }
      setEditingNote(null);
      await refreshData(authUser);
      setActiveTab("published");
    } catch (error) {
      showError(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await deleteNote(noteId);
      await refreshData(authUser);
      setMessage("Note deleted successfully.");
    } catch (error) {
      showError(error);
    }
  };

  const handleSearch = async (value) => {
    setSearchQuery(value);
  };

  const safeSummarize = async (text) => {
    try {
      return await summarizeText(text);
    } catch (error) {
      showError(error);
      return "Add your Firebase Functions + Hugging Face key, then this summary will appear here.";
    }
  };

  const safeAnalyze = async (text) => {
    try {
      return await analyzeQuestionPaper(text);
    } catch (error) {
      showError(error);
      return "Configure the backend analysis function to generate repeated-topic insights here.";
    }
  };

  const loadComments = async (noteId) => {
    try {
      const noteComments = await getCommentsForNote(noteId);
      setSelectedNoteId(noteId);
      setComments(noteComments);
    } catch (error) {
      showError(error);
    }
  };

  const handleAddComment = async (noteId, text) => {
    try {
      await addComment({
        noteId,
        userId: authUser.uid,
        userName: profile?.name || authUser.email,
        text
      });
      await loadComments(noteId);
      setMessage("Comment added.");
    } catch (error) {
      showError(error);
    }
  };

  const openUserList = async (type) => {
    try {
      const ids = type === "followers" ? profile?.followers || [] : profile?.following || [];
      const users = await getUsersByIds(ids);
      setModalConfig({
        title: type === "followers" ? "Followers" : "Following",
        users
      });
    } catch (error) {
      showError(error);
    }
  };

  const currentSection = useMemo(() => {
    if (activeTab === "create") {
      return (
        <NoteEditor
          activeUser={{ uid: authUser.uid, name: profile?.name || authUser.email }}
          editingNote={editingNote}
          onAnalyzeQuestions={safeAnalyze}
          onCancelEdit={() => setEditingNote(null)}
          onLoadDraft={() =>
            setMessage("Draft loaded from your device. Review it and publish when ready.")
          }
          onSave={handleSaveNote}
          onSummarize={safeSummarize}
          saving={saving}
        />
      );
    }

    if (activeTab === "published") {
      return (
        <PublishedNotes
          comments={comments}
          notes={myNotes}
          onAddComment={handleAddComment}
          onDelete={handleDeleteNote}
          onEdit={(note) => {
            setEditingNote(note);
            setActiveTab("create");
          }}
          onLoadComments={loadComments}
          onSelect={(note) => setSelectedNoteId(note.id)}
          selectedNoteId={selectedNoteId}
        />
      );
    }

    if (activeTab === "dashboard") {
      return (
        <Dashboard
          notes={myNotes}
          onOpenFeed={() => setActiveTab("home")}
          onOpenFollowers={() => openUserList("followers")}
          onOpenFollowing={() => openUserList("following")}
          onOpenPublished={() => setActiveTab("published")}
          onOpenRequests={() => setActiveTab("home")}
          profile={profile}
          requests={requests}
          savedNotes={savedNotes}
        />
      );
    }

    if (activeTab === "profile") {
      return (
        <ProfileSection
          onSave={async (form) => {
            try {
              await updateProfile(authUser.uid, form);
              await refreshData(authUser);
              setMessage("Profile updated successfully.");
            } catch (error) {
              showError(error);
            }
          }}
          onShowFollowers={() => openUserList("followers")}
          onShowFollowing={() => openUserList("following")}
          profile={profile}
        />
      );
    }

    return (
      <HomeSection
        comments={comments}
        filterPreferences={filterPreferences}
        notes={notes}
        savedPreferences={profile?.searchPreferences || null}
        onAddComment={handleAddComment}
        onApplySavedPreferences={() => {
          if (!profile?.searchPreferences) return;
          setFilterPreferences({
            ...defaultFilterPreferences,
            ...profile.searchPreferences
          });
          setMessage("Showing posts based on your saved preference.");
        }}
        onFilterChange={(partial) =>
          setFilterPreferences((current) => ({ ...current, ...partial }))
        }
        onFollow={async (authorId, authorName) => {
          if (authorId === authUser.uid) {
            setMessage("You cannot follow yourself.");
            return;
          }
          await sendFollowRequest({
            senderId: authUser.uid,
            receiverId: authorId,
            senderName: profile?.name || authUser.email
          });
          setMessage(`Follow request sent to ${authorName}.`);
        }}
        onLike={async (note) => {
          await toggleLike(note, authUser.uid);
          await refreshData(authUser);
        }}
        onLoadComments={loadComments}
        onOpenProfile={() => setActiveTab("profile")}
        onRespond={async (request, accept, followBack = false) => {
          await respondToFollowRequest({
            requestId: request.id,
            senderId: request.senderId,
            receiverId: request.receiverId,
            accept
          });
          if (accept && followBack) {
            await sendFollowRequest({
              senderId: authUser.uid,
              receiverId: request.senderId,
              senderName: profile?.name || authUser.email
            });
          }
          await refreshData(authUser);
          setMessage(
            accept
              ? followBack
                ? `Request accepted and follow back sent to ${request.senderName}.`
                : `Request accepted for ${request.senderName}.`
              : `Request rejected for ${request.senderName}.`
          );
        }}
        onSavePreferences={async () => {
          await saveUserPreferences(authUser.uid, filterPreferences);
          window.localStorage.setItem(
            `smart-notes-filters-${authUser.uid}`,
            JSON.stringify(filterPreferences)
          );
          setProfile((current) => ({
            ...current,
            searchPreferences: filterPreferences
          }));
          setMessage("Preference saved successfully.");
        }}
        onSave={async (note) => {
          await toggleSave(note, authUser.uid);
          await refreshData(authUser);
        }}
        onSearch={handleSearch}
        pendingRequests={requests}
        selectedNoteId={selectedNoteId}
        socialStats={{
          totalReach:
            myNotes.reduce(
              (sum, note) =>
                sum +
                (note.metrics?.views || 0) +
                (note.metrics?.likes || 0) +
                (note.metrics?.saves || 0),
              0
            ) + allComments.filter((comment) => myNotes.some((note) => note.id === comment.noteId)).length,
          totalViews: myNotes.reduce((sum, note) => sum + (note.metrics?.views || 0), 0)
        }}
        trending={getTrendingPicks(notes, allComments, profile?.searchPreferences)}
      />
    );
  }, [
    activeTab,
    authUser,
    comments,
    editingNote,
    myNotes,
    notes,
    profile,
    requests,
    saving,
    savedNotes,
    selectedNoteId,
    trending,
    allComments,
    filterPreferences
  ]);

  if (!firebaseReady) {
    return (
      <main className="app-shell centered">
        <section className="card auth-card">
          <p className="eyebrow">Configuration Required</p>
          <h1>Paste your Firebase keys first</h1>
          <p className="muted">
            Open <code>src/firebaseConfig.js</code> and replace every placeholder value.
            After that, run the app again.
          </p>
        </section>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="app-shell centered">
        <section className="card">
          <p>Loading project...</p>
        </section>
      </main>
    );
  }

  if (!authUser) {
    return (
      <main className="app-shell centered">
        {message && <div className="toast">{message}</div>}
        <AuthPanel
          disabled={loading}
          onLogin={(payload) => runAuthAction(() => login(payload))}
          onSignup={(payload) => runAuthAction(() => signup(payload))}
        />
      </main>
    );
  }

  return (
    <main className="app-shell app-shell-pro">
      <header className="topbar">
        <div>
          <p className="eyebrow">AI-Powered Student Workspace</p>
          <h1>Smart Student Notes</h1>
        </div>

        <div className="toolbar">
          <button className="profile-trigger" onClick={() => setActiveTab("profile")} type="button">
            {profile?.avatarUrl ? (
              <img alt="Profile" className="avatar-image" src={profile.avatarUrl} />
            ) : (
              <span className="avatar-circle">
                {(profile?.name || authUser.email).slice(0, 1).toUpperCase()}
              </span>
            )}
            <span>{profile?.name || authUser.email}</span>
          </button>
          <button
            className="secondary-btn"
            type="button"
            onClick={async () => {
              await logout();
              setAuthUser(null);
              setProfile(null);
              setNotes([]);
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {message ? <div className="toast">{message}</div> : null}

      {currentSection}

      <BottomNav activeTab={activeTab} onChange={setActiveTab} />

      {modalConfig ? (
        <UserListModal
          onClose={() => setModalConfig(null)}
          title={modalConfig.title}
          users={modalConfig.users}
        />
      ) : null}
    </main>
  );
}
