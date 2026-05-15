import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  addDoc,
  onSnapshot,
  FirestoreError,
  runTransaction
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { OperationType, FirestoreErrorInfo } from '../types';

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const dbService = {
  // Users
  async getUser(uid: string) {
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      return snap.exists() ? snap.data() : null;
    } catch (e) { handleFirestoreError(e, OperationType.GET, `users/${uid}`); }
  },

  async createUser(uid: string, data: any) {
    try {
      await setDoc(doc(db, 'users', uid), { ...data, createdAt: new Date().toISOString() });
    } catch (e) { handleFirestoreError(e, OperationType.CREATE, `users/${uid}`); }
  },

  // Prayer Cells
  async getPrayerCells() {
    try {
      const snap = await getDocs(collection(db, 'prayerCells'));
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) { handleFirestoreError(e, OperationType.LIST, 'prayerCells'); }
  },

  async getPrayerCell(cellId: string) {
    try {
      const snap = await getDoc(doc(db, 'prayerCells', cellId));
      return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    } catch (e) { handleFirestoreError(e, OperationType.GET, `prayerCells/${cellId}`); }
  },

  async createPrayerCell(data: any) {
    try {
      const docRef = await addDoc(collection(db, 'prayerCells'), { ...data, createdAt: new Date().toISOString() });
      return docRef.id;
    } catch (e) { handleFirestoreError(e, OperationType.CREATE, 'prayerCells'); }
  },

  // Meetings
  async getCellMeetings(cellId: string) {
    try {
      const q = query(collection(db, `prayerCells/${cellId}/meetings`), orderBy('date', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) { handleFirestoreError(e, OperationType.LIST, `prayerCells/${cellId}/meetings`); }
  },

  async markAttendance(cellId: string, meetingId: string, userId: string) {
    try {
      const ref = doc(db, `prayerCells/${cellId}/meetings`, meetingId);
      await updateDoc(ref, {
        [`attendance.${userId}`]: true
      });
    } catch (e) { handleFirestoreError(e, OperationType.UPDATE, `prayerCells/${cellId}/meetings/${meetingId}`); }
  },

  // Finance
  async getFinanceRecords() {
    try {
      const q = query(collection(db, 'committee/finances/records'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) { handleFirestoreError(e, OperationType.LIST, 'committee/finances/records'); }
  },

  // Invites
  async createInvite(invite: any) {
    try {
      const docRef = await addDoc(collection(db, 'invites'), { ...invite, createdAt: new Date().toISOString() });
      return docRef.id;
    } catch (e) { handleFirestoreError(e, OperationType.CREATE, 'invites'); }
  },

  async getInvite(token: string) {
    try {
      const q = query(collection(db, 'invites'), where('token', '==', token), where('status', '==', 'pending'));
      const snap = await getDocs(q);
      return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
    } catch (e) { handleFirestoreError(e, OperationType.GET, 'invites'); }
  }
};
