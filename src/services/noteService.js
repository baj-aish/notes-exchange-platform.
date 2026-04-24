import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "./firebase.js";

const notesRef = collection(db, "notes");
const usersRef = collection(db, "users");
const followRequestsRef = collection(db, "followRequests");
const commentsRef = collection(db, "comments");

const normalizeTags = (tags) =>
  tags
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);

export const createNote = async (payload) => {
  const cleanTags = normalizeTags(payload.tags);
  const note = {
    ...payload,
    tags: cleanTags,
    metrics: {
      views: 0,
      likes: 0,
      saves: 0
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  const snapshot = await addDoc(notesRef, note);
  return snapshot.id;
};

export const updateNote = async (noteId, payload) => {
  await updateDoc(doc(db, "notes", noteId), {
    ...payload,
    tags: normalizeTags(payload.tags),
    updatedAt: serverTimestamp()
  });
};

export const deleteNote = async (noteId) => deleteDoc(doc(db, "notes", noteId));

export const getNotesForUser = async (uid) => {
  const snapshot = await getDocs(query(notesRef, orderBy("createdAt", "desc")));
  return snapshot.docs
    .map((entry) => ({ id: entry.id, ...entry.data() }))
    .filter((note) => note.authorId === uid);
};

export const getVisibleNotes = async ({ currentUserId, following = [] }) => {
  const snapshot = await getDocs(query(notesRef, orderBy("createdAt", "desc")));

  return snapshot.docs
    .map((entry) => ({ id: entry.id, ...entry.data() }))
    .filter((note) => {
      if (note.visibility === "public") return true;
      if (note.authorId === currentUserId) return true;
      if (note.visibility === "followers") return following.includes(note.authorId);
      return false;
    });
};

export const searchNotes = async ({ queryText, currentUserId, following = [] }) => {
  const allNotes = await getVisibleNotes({ currentUserId, following });
  const search = queryText.toLowerCase().trim();

  if (!search) return allNotes;

  return allNotes.filter((note) => {
    const haystack = [
      note.title,
      note.body,
      note.authorName,
      ...(note.tags || [])
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(search);
  });
};

export const toggleLike = async (note, userId) => {
  const noteDoc = doc(db, "notes", note.id);
  const likeDoc = doc(db, "likes", `${note.id}_${userId}`);
  const alreadyLiked = note.likedBy?.includes(userId);

  if (alreadyLiked) {
    await deleteDoc(likeDoc);
    await updateDoc(noteDoc, {
      likedBy: arrayRemove(userId),
      "metrics.likes": Math.max((note.metrics?.likes || 1) - 1, 0)
    });
    return;
  }

  await setDoc(likeDoc, {
    noteId: note.id,
    userId,
    createdAt: serverTimestamp()
  });
  await updateDoc(noteDoc, {
    likedBy: arrayUnion(userId),
    "metrics.likes": (note.metrics?.likes || 0) + 1
  });
};

export const toggleSave = async (note, userId) => {
  const noteDoc = doc(db, "notes", note.id);
  const savedDoc = doc(db, "savedNotes", `${note.id}_${userId}`);
  const alreadySaved = note.savedBy?.includes(userId);

  if (alreadySaved) {
    await deleteDoc(savedDoc);
    await updateDoc(noteDoc, {
      savedBy: arrayRemove(userId),
      "metrics.saves": Math.max((note.metrics?.saves || 1) - 1, 0)
    });
    return;
  }

  await setDoc(savedDoc, {
    noteId: note.id,
    userId,
    createdAt: serverTimestamp()
  });
  await updateDoc(noteDoc, {
    savedBy: arrayUnion(userId),
    "metrics.saves": (note.metrics?.saves || 0) + 1
  });
};

export const recordView = async (note) => {
  if (!note?.id) return;
  await updateDoc(doc(db, "notes", note.id), {
    "metrics.views": (note.metrics?.views || 0) + 1
  });
};

export const sendFollowRequest = async ({ senderId, receiverId, senderName }) => {
  const requestId = `${senderId}_${receiverId}`;
  await setDoc(doc(followRequestsRef, requestId), {
    senderId,
    receiverId,
    senderName,
    status: "pending",
    createdAt: serverTimestamp()
  });
};

export const getFollowRequests = async (uid) => {
  const snapshot = await getDocs(followRequestsRef);
  return snapshot.docs
    .map((entry) => ({ id: entry.id, ...entry.data() }))
    .filter((request) => request.receiverId === uid && request.status === "pending");
};

export const respondToFollowRequest = async ({ requestId, senderId, receiverId, accept }) => {
  const requestDoc = doc(db, "followRequests", requestId);
  await updateDoc(requestDoc, {
    status: accept ? "accepted" : "rejected",
    respondedAt: serverTimestamp()
  });

  if (!accept) return;

  await updateDoc(doc(usersRef, senderId), {
    following: arrayUnion(receiverId)
  });
  await updateDoc(doc(usersRef, receiverId), {
    followers: arrayUnion(senderId)
  });
};

export const getTrendingNotes = async ({ currentUserId, following = [] }) => {
  const notes = await getVisibleNotes({ currentUserId, following });
  return [...notes]
    .sort((left, right) => {
      const leftScore =
        (left.metrics?.likes || 0) * 3 +
        (left.metrics?.saves || 0) * 4 +
        (left.metrics?.views || 0);
      const rightScore =
        (right.metrics?.likes || 0) * 3 +
        (right.metrics?.saves || 0) * 4 +
        (right.metrics?.views || 0);
      return rightScore - leftScore;
    })
    .slice(0, 5);
};

export const summarizeText = async (text) => {
  const summarize = httpsCallable(functions, "summarizeStudyText");
  const response = await summarize({ text });
  return response.data.summary;
};

export const analyzeQuestionPaper = async (text) => {
  const analyze = httpsCallable(functions, "analyzeQuestionPaper");
  const response = await analyze({ text });
  return response.data.analysis;
};

export const getUserById = async (uid) => {
  const snapshot = await getDoc(doc(db, "users", uid));
  return snapshot.exists() ? snapshot.data() : null;
};

export const addComment = async ({ noteId, userId, userName, text }) => {
  await addDoc(commentsRef, {
    noteId,
    userId,
    userName,
    text,
    createdAt: serverTimestamp()
  });
};

export const getCommentsForNote = async (noteId) => {
  const snapshot = await getDocs(query(commentsRef, orderBy("createdAt", "asc")));
  return snapshot.docs
    .map((entry) => ({ id: entry.id, ...entry.data() }))
    .filter((comment) => comment.noteId === noteId);
};

export const getAllComments = async () => {
  const snapshot = await getDocs(query(commentsRef, orderBy("createdAt", "asc")));
  return snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }));
};
