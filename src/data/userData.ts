import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  runTransaction,
  serverTimestamp,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { requireDb } from '../firebase';
import type { DailyLog, UserProfile } from '../types';

export interface UserData {
  profile: UserProfile;
  logs: DailyLog[];
}

export async function loadOrCreateUserData(
  uid: string,
  fallbackProfile: UserProfile,
  fallbackLogs: DailyLog[],
): Promise<UserData> {
  const firestore = requireDb();
  const userRef = doc(firestore, 'users', uid);
  const logsRef = collection(firestore, 'users', uid, 'dailyLogs');
  const profile = await runTransaction(firestore, async (transaction) => {
    const userSnapshot = await transaction.get(userRef);
    if (userSnapshot.exists()) return userSnapshot.data().profile as UserProfile;

    transaction.set(userRef, {
      profile: fallbackProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return fallbackProfile;
  });

  const logsSnapshot = await getDocs(logsRef);

  let logs = logsSnapshot.docs.map((snapshot) => {
    const { updatedAt: _updatedAt, ...dailyLog } = snapshot.data();
    return dailyLog as unknown as DailyLog;
  });

  if (!logs.length && fallbackLogs.length) {
    const batch = writeBatch(firestore);
    fallbackLogs.forEach((dailyLog) => {
      batch.set(doc(logsRef, dailyLog.dateString), {
        ...dailyLog,
        updatedAt: serverTimestamp(),
      });
    });
    await batch.commit();
    logs = fallbackLogs;
  }

  return { profile, logs };
}

export async function saveUserProfile(uid: string, profile: UserProfile) {
  await setDoc(doc(requireDb(), 'users', uid), {
    profile,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function saveDailyLog(uid: string, dailyLog: DailyLog) {
  await setDoc(doc(requireDb(), 'users', uid, 'dailyLogs', dailyLog.dateString), {
    ...dailyLog,
    updatedAt: serverTimestamp(),
  });
}

export async function replaceUserData(uid: string, profile: UserProfile, logs: DailyLog[]) {
  const firestore = requireDb();
  const logsRef = collection(firestore, 'users', uid, 'dailyLogs');
  const existingLogs = await getDocs(logsRef);

  await Promise.all(existingLogs.docs.map((snapshot) => deleteDoc(snapshot.ref)));
  await saveUserProfile(uid, profile);

  if (logs.length) {
    const batch = writeBatch(firestore);
    logs.forEach((dailyLog) => {
      batch.set(doc(logsRef, dailyLog.dateString), {
        ...dailyLog,
        updatedAt: serverTimestamp(),
      });
    });
    await batch.commit();
  }
}
