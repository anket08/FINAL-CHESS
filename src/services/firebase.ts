import { initializeApp } from 'firebase/app';
import { 
  getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser 
} from 'firebase/auth';
import { 
  getFirestore, doc, setDoc, getDoc, collection, addDoc, updateDoc, onSnapshot, query, where, orderBy, serverTimestamp, getDocs 
} from 'firebase/firestore';
import { User, GameState } from '../types/chess';

// ------------------------------
// Firebase Configuration
// ------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyCxB55AgzirsJ4Y1OtWYVFvf7JGdzvGSIc",
  authDomain: "cloud-7f6f6.firebaseapp.com",
  projectId: "cloud-7f6f6",
  storageBucket: "cloud-7f6f6.appspot.com",
  messagingSenderId: "516056743193",
  appId: "1:516056743193:web:a9ad880f722965b7f55988",
};

// Initialize Firebase
let app, auth, db;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.warn('Firebase initialization failed, using mock mode:', error);
  auth = null;
  db = null;
}

export { auth, db };

// ------------------------------
// Authentication Helpers
// ------------------------------
const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async (): Promise<User | null> => {
  if (!auth) return null;
  
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;

    if (!firebaseUser) return null;

    // Check if user exists in Firestore
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    if (userDoc.exists()) return userDoc.data() as User;

    // Otherwise, create new user
    const user: User = {
      uid: firebaseUser.uid,
      displayName: firebaseUser.displayName || 'Anonymous',
      email: firebaseUser.email || '',
      photoURL: firebaseUser.photoURL || undefined,
      theme: 'dark',
      stats: { wins: 0, losses: 0, draws: 0, totalGames: 0 },
    };
    await setDoc(doc(db, 'users', user.uid), user);
    return user;

  } catch (error) {
    console.error('Google sign-in failed:', error);
    return null;
  }
};

export const signOutUser = async (): Promise<void> => {
  if (!auth) return;
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
  }
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  if (!auth) return () => {};
  return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
    if (!firebaseUser) {
      callback(null);
      return;
    }
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    if (userDoc.exists()) {
      callback(userDoc.data() as User);
    } else {
      const user: User = {
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName || 'Anonymous',
        email: firebaseUser.email || '',
        photoURL: firebaseUser.photoURL || undefined,
        theme: 'dark',
        stats: { wins: 0, losses: 0, draws: 0, totalGames: 0 },
      };
      await setDoc(doc(db, 'users', user.uid), user);
      callback(user);
    }
  });
};

// ------------------------------
// Firestore Helpers
// ------------------------------
export const updateUserTheme = async (uid: string, theme: 'light' | 'dark'): Promise<void> => {
  if (!db) return;
  try {
    await updateDoc(doc(db, 'users', uid), { theme });
  } catch (error) {
    console.error('Error updating user theme:', error);
  }
};

export const createGame = async (gameData: Partial<GameState>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'games'), {
      ...gameData,
      createdAt: serverTimestamp(),
      status: 'active',
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating game:', error);
    throw error;
  }
};

export const updateGame = async (gameId: string, updates: Partial<GameState>): Promise<void> => {
  try {
    await updateDoc(doc(db, 'games', gameId), updates);
  } catch (error) {
    console.error('Error updating game:', error);
    throw error;
  }
};

export const subscribeToGame = (gameId: string, callback: (game: GameState | null) => void) => {
  return onSnapshot(doc(db, 'games', gameId), (doc) => {
    if (doc.exists()) callback({ id: doc.id, ...doc.data() } as GameState);
    else callback(null);
  });
};

export const getUserGames = (uid: string, callback: (games: GameState[]) => void) => {
  const q = query(
    collection(db, 'games'),
    where('playersUids', 'array-contains', uid),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const games = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GameState));
    callback(games);
  });
};

// ------------------------------
// Game Rooms
// ------------------------------
export const createGameRoom = async (hostUid: string): Promise<string> => {
  try {
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    await addDoc(collection(db, 'rooms'), {
      code: roomCode,
      hostUid,
      status: 'waiting',
      createdAt: serverTimestamp(),
    });
    return roomCode;
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
};

export const joinGameRoom = async (roomCode: string, guestUid: string): Promise<string | null> => {
  try {
    const q = query(collection(db, 'rooms'), where('code', '==', roomCode));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const roomDoc = snapshot.docs[0];
      await updateDoc(roomDoc.ref, { guestUid, status: 'active' });
      return roomDoc.id;
    }
    return null;
  } catch (error) {
    console.error('Error joining room:', error);
    return null;
  }
};
