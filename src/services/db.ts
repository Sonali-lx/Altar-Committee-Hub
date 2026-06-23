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
  runTransaction,
  deleteDoc,
  arrayUnion,
  arrayRemove
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, auth, storage } from "../lib/firebase";
import { OperationType, FirestoreErrorInfo } from "../types";

function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const dbService = {
  // Users
  async getUser(uid: string) {
    try {
      const snap = await getDoc(doc(db, "users", uid));
      return snap.exists() ? { uid: snap.id, ...snap.data() } : null;
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, `users/${uid}`);
    }
  },

  async createUser(uid: string, data: any) {
    try {
      await setDoc(doc(db, "users", uid), {
        ...data,
        createdAt: new Date().toISOString(),
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `users/${uid}`);
    }
  },

  async updateUser(uid: string, data: any) {
    try {
      const ref = doc(db, "users", uid);
      await updateDoc(ref, data);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${uid}`);
    }
  },

  async getUsers(uids: string[]) {
    try {
      if (!uids || uids.length === 0) return [];
      const users: any[] = [];
      for (const uid of uids) {
        const snap = await getDoc(doc(db, "users", uid));
        if (snap.exists()) {
          users.push({ id: snap.id, ...snap.data() });
        }
      }
      return users;
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, "users");
      return [];
    }
  },

  // Prayer Cells
  subscribePrayerCells(callback: (cells: any[]) => void) {
    const q = query(
      collection(db, "prayerCells"),
      orderBy("createdAt", "desc"),
    );
    return onSnapshot(
      q,
      (snap) => {
        callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (e) => handleFirestoreError(e, OperationType.LIST, "prayerCells"),
    );
  },

  async updatePrayerCell(id: string, data: any) {
    try {
      const ref = doc(db, "prayerCells", id);
      await updateDoc(ref, data);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `prayerCells/${id}`);
    }
  },

  async getPrayerCells() {
    try {
      const snap = await getDocs(collection(db, "prayerCells"));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, "prayerCells");
    }
  },

  async joinPrayerCellByInvite(inviteCode: string, userId: string) {
    try {
      const q = query(
        collection(db, "prayerCells"),
        where("inviteCode", "==", inviteCode),
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const cellDoc = snap.docs[0];
        const cellData = cellDoc.data();
        if (!cellData.memberIds.includes(userId)) {
          const newMemberIds = [...(cellData.memberIds || []), userId];
          await updateDoc(doc(db, "prayerCells", cellDoc.id), {
            memberIds: newMemberIds,
          });
        }
        return cellDoc.id;
      }
      return null;
    } catch (e) {
      console.error("Failed to join by invite", e);
      return null;
    }
  },

  async getPrayerCell(cellId: string) {
    try {
      const snap = await getDoc(doc(db, "prayerCells", cellId));
      return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, `prayerCells/${cellId}`);
    }
  },

  async createPrayerCell(data: any) {
    try {
      const docRef = await addDoc(collection(db, "prayerCells"), {
        ...data,
        createdAt: new Date().toISOString(),
      });
      return docRef.id;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, "prayerCells");
    }
  },

  // Meetings
  async getCellMeetings(cellId: string) {
    try {
      const q = query(
        collection(db, `prayerCells/${cellId}/meetings`),
        orderBy("date", "desc"),
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (e) {
      handleFirestoreError(
        e,
        OperationType.LIST,
        `prayerCells/${cellId}/meetings`,
      );
    }
  },

  async getMyUpcomingMeetings(userId: string, isSuperUser: boolean = false) {
    try {
      const snap = await getDocs(collection(db, "prayerCells"));
      const cells = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];
      const myCells = isSuperUser
        ? cells
        : cells.filter(
            (c) =>
              c.memberIds?.includes(userId) ||
              c.leaderIds?.includes(userId) ||
              c.parentIds?.includes(userId),
          );

      let allMeetings: any[] = [];
      for (const cell of myCells) {
        const meetingsSnap = await getDocs(
          collection(db, `prayerCells/${cell.id}/meetings`),
        );
        const meetings = meetingsSnap.docs.map((d) => ({
          id: d.id,
          cellName: cell.name, // Augment with cell name
          cellId: cell.id,     // Augment with cell ID for attendance mutation
          ...d.data(),
        }));
        allMeetings = [...allMeetings, ...meetings];
      }
      return allMeetings.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, "myMeetings");
    }
  },

  async createCellMeeting(cellId: string, data: any) {
    try {
      const docRef = await addDoc(
        collection(db, `prayerCells/${cellId}/meetings`),
        { ...data, cellId, createdAt: new Date().toISOString() },
      );
      return docRef.id;
    } catch (e) {
      handleFirestoreError(
        e,
        OperationType.CREATE,
        `prayerCells/${cellId}/meetings`,
      );
    }
  },

  async updateCellMeeting(cellId: string, meetingId: string, data: any) {
    try {
       await updateDoc(doc(db, `prayerCells/${cellId}/meetings`, meetingId), data);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `prayerCells/${cellId}/meetings/${meetingId}`);
    }
  },

  // Messages
  listenToCellMessages(cellId: string, callback: (messages: any[]) => void) {
    const q = query(
      collection(db, `prayerCells/${cellId}/messages`),
      orderBy("timestamp", "asc"),
    );
    return onSnapshot(
      q,
      (snapshot) => {
        const messages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        callback(messages);
      },
      (error) => {
        console.error("Error listening to messages:", error);
      },
    );
  },

  async sendCellMessage(cellId: string, data: any) {
    try {
      const docRef = await addDoc(
        collection(db, `prayerCells/${cellId}/messages`),
        {
          ...data,
          timestamp: new Date().getTime(),
        },
      );
      return docRef.id;
    } catch (e) {
      handleFirestoreError(
        e,
        OperationType.CREATE,
        `prayerCells/${cellId}/messages`,
      );
    }
  },

  async updateCellMessage(cellId: string, messageId: string, data: any) {
    try {
      await updateDoc(doc(db, `prayerCells/${cellId}/messages`, messageId), data);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `prayerCells/${cellId}/messages/${messageId}`);
    }
  },

  async deleteCellMessage(cellId: string, messageId: string) {
    try {
      await deleteDoc(doc(db, `prayerCells/${cellId}/messages`, messageId));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `prayerCells/${cellId}/messages/${messageId}`);
    }
  },

  async addReactionToMessage(cellId: string, messageId: string, reaction: any) {
    // reaction: { emoji: str, userId: str }
    try {
      // Add or toggle a reaction. We can use arrayUnion
      await updateDoc(doc(db, `prayerCells/${cellId}/messages`, messageId), {
        reactions: arrayUnion(reaction) // We store emoji, userId
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `prayerCells/${cellId}/messages/${messageId}`);
    }
  },

  async uploadMessageFile(file: File, path: string): Promise<string> {
    const fileRef = ref(storage, path);
    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
  },

  async addCellMember(cellId: string, memberId: string) {
    try {
      const ref = doc(db, "prayerCells", cellId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        const currentMembers = data.memberIds || [];
        if (!currentMembers.includes(memberId)) {
          await updateDoc(ref, { memberIds: [...currentMembers, memberId] });
        }
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `prayerCells/${cellId}`);
    }
  },

  async removeCellMember(cellId: string, memberId: string) {
    try {
      const ref = doc(db, "prayerCells", cellId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        const currentMembers = data.memberIds || [];
        if (currentMembers.includes(memberId)) {
          await updateDoc(ref, {
            memberIds: currentMembers.filter((id: string) => id !== memberId),
          });
        }
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `prayerCells/${cellId}`);
    }
  },

  async deleteCellMeeting(cellId: string, meetingId: string) {
    try {
      await deleteDoc(doc(db, `prayerCells/${cellId}/meetings`, meetingId));
    } catch (e) {
      handleFirestoreError(
        e,
        OperationType.DELETE,
        `prayerCells/${cellId}/meetings/${meetingId}`,
      );
    }
  },

  async markAttendance(cellId: string, meetingId: string, userId: string) {
    try {
      const ref = doc(db, `prayerCells/${cellId}/meetings`, meetingId);
      await updateDoc(ref, {
        [`attendance.${userId}`]: true,
      });
    } catch (e) {
      handleFirestoreError(
        e,
        OperationType.UPDATE,
        `prayerCells/${cellId}/meetings/${meetingId}`,
      );
    }
  },

  // Events
  async getEvents() {
    try {
      const q = query(
        collection(db, "events"),
        orderBy("date", "desc")
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, "events");
    }
  },

  async createEvent(data: any) {
    try {
      const docRef = await addDoc(collection(db, "events"), {
        ...data,
        createdAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, "events");
    }
  },

  async updateEvent(eventId: string, data: any) {
    try {
      await updateDoc(doc(db, "events", eventId), data);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `events/${eventId}`);
    }
  },

  async deleteEvent(eventId: string) {
    try {
      await deleteDoc(doc(db, "events", eventId));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `events/${eventId}`);
    }
  },

  async getEventCollections() {
    try {
      const q = query(collection(db, "eventCollections"));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, "eventCollections");
      return [];
    }
  },

  async createEventCollection(name: string) {
    try {
      const docRef = await addDoc(collection(db, "eventCollections"), { name });
      return docRef.id;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, "eventCollections");
    }
  },

  async updateEventCollection(collectionId: string, name: string) {
    try {
      await updateDoc(doc(db, "eventCollections", collectionId), { name });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `eventCollections/${collectionId}`);
    }
  },

  async deleteEventCollection(collectionId: string) {
    try {
      await deleteDoc(doc(db, "eventCollections", collectionId));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `eventCollections/${collectionId}`);
    }
  },

  // Colleges
  async getColleges() {
    try {
      const q = query(collection(db, "colleges"));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, "colleges");
      return [];
    }
  },

  async addCollege(data: any) {
    try {
      const docRef = await addDoc(collection(db, "colleges"), data);
      return docRef.id;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, "colleges");
    }
  },

  async updateCollege(id: string, data: any) {
    try {
      await updateDoc(doc(db, "colleges", id), data);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `colleges/${id}`);
    }
  },

  async deleteCollege(id: string) {
    try {
      await deleteDoc(doc(db, "colleges", id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `colleges/${id}`);
    }
  },

  // Membership Records
  async getMembershipRecords() {
    try {
      const q = query(collection(db, "membershipRecords"));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, "membershipRecords");
      return [];
    }
  },

  async addMembershipRecord(data: any) {
    try {
      const docRef = await addDoc(collection(db, "membershipRecords"), data);
      return docRef.id;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, "membershipRecords");
    }
  },

  async updateMembershipRecord(id: string, data: any) {
    try {
      await updateDoc(doc(db, "membershipRecords", id), data);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `membershipRecords/${id}`);
    }
  },

  async deleteMembershipRecord(id: string) {
    try {
      await deleteDoc(doc(db, "membershipRecords", id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `membershipRecords/${id}`);
    }
  },
  async getFinanceRecords() {
    try {
      const q = query(
        collection(db, "committee/finances/records"),
        orderBy("createdAt", "desc"),
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, "committee/finances/records");
    }
  },

  async getQuietTimes(userId?: string) {
    try {
      const q = query(collection(db, "quietTimes"));
      const snap = await getDocs(q);
      let docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      if (userId) {
        docs = docs.filter((d) => (d as any).userId === userId);
      }
      return docs.sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, "quietTimes");
    }
  },

  async addQuietTime(data: any) {
    try {
      const docRef = await addDoc(collection(db, "quietTimes"), {
        ...data,
        createdAt: new Date().toISOString(),
      });
      return docRef.id;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, "quietTimes");
    }
  },

  async getPrayers(userId?: string) {
    try {
      const q = query(collection(db, "prayers"));
      const snap = await getDocs(q);
      let docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      if (userId) {
        docs = docs.filter((d) => (d as any).userId === userId);
      }
      return docs.sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, "prayers");
    }
  },

  async addPrayer(data: any) {
    try {
      const docRef = await addDoc(collection(db, "prayers"), {
        ...data,
        createdAt: new Date().toISOString(),
      });
      return docRef.id;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, "prayers");
    }
  },

  async updatePrayerStatus(id: string, status: string) {
    try {
      await setDoc(doc(db, "prayers", id), { status }, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, "prayers");
    }
  },

  // Journals
  async getJournals(userId: string) {
    try {
      const q = query(collection(db, "journals")); // Workaround for index
      const snap = await getDocs(q);
      let docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      docs = docs.filter((d) => (d as any).userId === userId);
      return docs.sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, "journals");
    }
  },

  async addJournal(data: any) {
    try {
      const docRef = await addDoc(collection(db, "journals"), {
        ...data,
        createdAt: new Date().toISOString(),
      });
      return docRef.id;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, "journals");
    }
  },

  // Calendar Notes
  async getCalendarNotes(userId: string) {
    try {
      const q = query(
        collection(db, "calendarNotes"),
        where("userId", "==", userId)
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, "calendarNotes");
      return [];
    }
  },

  async saveCalendarNote(userId: string, date: string, note: string) {
    try {
      const q = query(
        collection(db, "calendarNotes"),
        where("userId", "==", userId),
        where("date", "==", date)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const docRef = doc(db, "calendarNotes", snap.docs[0].id);
        if (note.trim() === "") {
          await deleteDoc(docRef);
        } else {
          await updateDoc(docRef, { note, updatedAt: new Date().toISOString() });
        }
      } else {
        if (note.trim() !== "") {
          await addDoc(collection(db, "calendarNotes"), {
            userId,
            date,
            note,
            createdAt: new Date().toISOString()
          });
        }
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, "calendarNotes");
    }
  },

  // Invites
  subscribeInvites(callback: (invites: any[]) => void) {
    const q = query(collection(db, "invites"), orderBy("createdAt", "desc"));
    return onSnapshot(
      q,
      (snap) => {
        callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (e) => handleFirestoreError(e, OperationType.LIST, "invites"),
    );
  },

  async createInvite(invite: any) {
    try {
      const docRef = await addDoc(collection(db, "invites"), {
        ...invite,
        createdAt: new Date().toISOString(),
      });
      return docRef.id;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, "invites");
    }
  },

  async getInvite(token: string) {
    try {
      const q = query(
        collection(db, "invites"),
        where("token", "==", token),
        where("status", "==", "pending"),
      );
      const snap = await getDocs(q);
      return snap.empty
        ? null
        : { id: snap.docs[0].id, ...snap.docs[0].data() };
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, "invites");
    }
  },

  // Prayers
  async getDawnDuskPrayers() {
    try {
      const q = query(collection(db, "dawnDuskPrayers"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, "dawnDuskPrayers");
      return [];
    }
  },

  async createDawnDuskPrayer(authorId: string, authorName: string, text: string) {
    try {
      await addDoc(collection(db, "dawnDuskPrayers"), {
        authorId,
        authorName,
        text,
        createdAt: new Date().toISOString()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, "dawnDuskPrayers");
    }
  },

  async getPrayerLinks() {
    try {
      const docRef = doc(db, "settings", "prayerLinks");
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data();
      }
      return null;
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, "settings/prayerLinks");
      return null;
    }
  },

  async updatePrayerLinks(links: any) {
    try {
      await setDoc(doc(db, "settings", "prayerLinks"), links, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, "settings/prayerLinks");
    }
  },

  // Community Feed
  async getCommunityFeed() {
    try {
      const q = query(collection(db, "communityFeed"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, "communityFeed");
      return [];
    }
  },

  async createCommunityPost(authorId: string, authorName: string, text: string, imagesBase64: string[]) {
    try {
      await addDoc(collection(db, "communityFeed"), {
        authorId,
        authorName,
        text,
        imagesBase64,
        likes: [],
        createdAt: new Date().toISOString()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, "communityFeed");
    }
  },

  async toggleLikePost(postId: string, userId: string) {
    try {
      const docRef = doc(db, "communityFeed", postId);
      const snap = await getDoc(docRef);
      if (!snap.exists()) return;
      const data = snap.data();
      const likes = data.likes || [];
      if (likes.includes(userId)) {
        await updateDoc(docRef, { likes: likes.filter((l: string) => l !== userId) });
      } else {
        await updateDoc(docRef, { likes: [...likes, userId] });
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `communityFeed/${postId}`);
    }
  },

  subscribeCommunityChat(callback: (messages: any[]) => void) {
    const q = query(collection(db, "communityChat"), orderBy("createdAt", "asc"));
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "communityChat");
    });
  },

  async sendCommunityChatMessage(authorId: string, authorName: string, text: string) {
    try {
      await addDoc(collection(db, "communityChat"), {
        authorId,
        authorName,
        text,
        createdAt: new Date().toISOString()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, "communityChat");
    }
  },
};
