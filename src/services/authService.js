import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc
} from "firebase/firestore";
import { auth, db } from "./firebase.js";

const keywordSet = (text) => {
  const cleaned = text.toLowerCase().trim();
  if (!cleaned) return [];
  const words = cleaned.split(/\s+/);
  const prefixes = [];

  for (let index = 1; index <= cleaned.length; index += 1) {
    prefixes.push(cleaned.slice(0, index));
  }

  return [...new Set([...words, ...prefixes])];
};

export const watchAuth = (callback) => onAuthStateChanged(auth, callback);

export const signup = async ({ name, email, password }) => {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, "users", credential.user.uid), {
    uid: credential.user.uid,
    name,
    email,
    bio: "",
    course: "",
    year: "",
    avatarUrl: "",
    followers: [],
    following: [],
    searchKeywords: keywordSet(`${name} ${email}`),
    createdAt: serverTimestamp()
  });

  return credential.user;
};

export const login = ({ email, password }) =>
  signInWithEmailAndPassword(auth, email, password);

export const logout = () => signOut(auth);

export const getProfile = async (uid) => {
  const snapshot = await getDoc(doc(db, "users", uid));
  return snapshot.exists() ? snapshot.data() : null;
};

export const updateProfile = async (uid, payload) => {
  await updateDoc(doc(db, "users", uid), {
    ...payload,
    searchKeywords: keywordSet(`${payload.name || ""} ${payload.email || ""}`.trim()),
    updatedAt: serverTimestamp()
  });
};

export const saveUserPreferences = async (uid, preferences) => {
  await updateDoc(doc(db, "users", uid), {
    searchPreferences: preferences,
    preferencesSavedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

export const getAllUsers = async () => {
  const snapshot = await getDocs(query(collection(db, "users")));
  return snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }));
};

export const getUsersByIds = async (ids = []) => {
  const users = await Promise.all(ids.map((id) => getProfile(id)));
  return users
    .map((user, index) => (user ? { id: ids[index], ...user } : null))
    .filter(Boolean);
};
