import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  FarmerProfile,
  FarmTask,
  FarmDiaryEntry,
  ExpertTicket,
  SoilProfile,
  ChatSession,
  ChatMessage,
} from '../types/farming';
import { AuthUser } from '../types/auth';

export class FirestoreService {
  // 1. User Profile Sync
  public async saveUserAccount(user: AuthUser): Promise<void> {
    try {
      const userRef = doc(db, 'users', user.id);
      await setDoc(
        userRef,
        {
          ...user,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error('Error saving user account to Firestore:', error);
      throw error;
    }
  }

  public async getUserAccount(userId: string): Promise<AuthUser | null> {
    try {
      const userRef = doc(db, 'users', userId);
      const snapshot = await getDoc(userRef);
      if (snapshot.exists()) {
        return snapshot.data() as AuthUser;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user account from Firestore:', error);
      return null;
    }
  }

  // 2. Farmer Agricultural Profile (Farms, Plots, Crops, Soil)
  public async saveFarmerProfile(userId: string, profile: FarmerProfile): Promise<void> {
    try {
      const farmerRef = doc(db, 'farmers', userId);
      const dataToSave = {
        ...profile,
        id: userId,
        userId: userId,
        updatedAt: new Date().toISOString(),
      };
      await setDoc(farmerRef, dataToSave, { merge: true });
    } catch (error) {
      console.error('Error saving farmer profile to Firestore:', error);
      throw error;
    }
  }

  public async getFarmerProfile(userId: string): Promise<FarmerProfile | null> {
    try {
      const farmerRef = doc(db, 'farmers', userId);
      const snapshot = await getDoc(farmerRef);
      if (snapshot.exists()) {
        const data = snapshot.data() as FarmerProfile;
        return data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching farmer profile from Firestore:', error);
      return null;
    }
  }

  public subscribeFarmerProfile(
    userId: string,
    callback: (profile: FarmerProfile | null) => void
  ): Unsubscribe {
    const farmerRef = doc(db, 'farmers', userId);
    return onSnapshot(
      farmerRef,
      (snapshot) => {
        if (snapshot.exists()) {
          callback(snapshot.data() as FarmerProfile);
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error('Error in farmer profile snapshot:', error);
      }
    );
  }

  // 3. Farm Tasks
  public async saveTasks(userId: string, tasks: FarmTask[]): Promise<void> {
    try {
      // Save all tasks in batch or individually
      for (const task of tasks) {
        const taskRef = doc(db, 'tasks', task.id);
        await setDoc(
          taskRef,
          {
            ...task,
            userId,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }
    } catch (error) {
      console.error('Error saving tasks to Firestore:', error);
    }
  }

  public async upsertTask(userId: string, task: FarmTask): Promise<void> {
    try {
      const taskRef = doc(db, 'tasks', task.id);
      await setDoc(
        taskRef,
        {
          ...task,
          userId,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error('Error upserting task to Firestore:', error);
    }
  }

  public async getTasks(userId: string): Promise<FarmTask[]> {
    try {
      const q = query(collection(db, 'tasks'), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      const tasks: FarmTask[] = [];
      snapshot.forEach((doc) => {
        tasks.push(doc.data() as FarmTask);
      });
      return tasks;
    } catch (error) {
      console.error('Error getting tasks from Firestore:', error);
      return [];
    }
  }

  public subscribeTasks(
    userId: string,
    callback: (tasks: FarmTask[]) => void
  ): Unsubscribe {
    const q = query(collection(db, 'tasks'), where('userId', '==', userId));
    return onSnapshot(
      q,
      (snapshot) => {
        const tasks: FarmTask[] = [];
        snapshot.forEach((doc) => {
          tasks.push(doc.data() as FarmTask);
        });
        callback(tasks);
      },
      (error) => {
        console.error('Error in tasks snapshot:', error);
      }
    );
  }

  // 4. Farm Diary Entries
  public async saveDiaryEntry(userId: string, entry: FarmDiaryEntry): Promise<void> {
    try {
      const entryRef = doc(db, 'diaryEntries', entry.id);
      await setDoc(
        entryRef,
        {
          ...entry,
          userId,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error('Error saving diary entry to Firestore:', error);
    }
  }

  public async deleteDiaryEntry(entryId: string): Promise<void> {
    try {
      const entryRef = doc(db, 'diaryEntries', entryId);
      await deleteDoc(entryRef);
    } catch (error) {
      console.error('Error deleting diary entry from Firestore:', error);
    }
  }

  public subscribeDiaryEntries(
    userId: string,
    callback: (entries: FarmDiaryEntry[]) => void
  ): Unsubscribe {
    const q = query(collection(db, 'diaryEntries'), where('userId', '==', userId));
    return onSnapshot(
      q,
      (snapshot) => {
        const entries: FarmDiaryEntry[] = [];
        snapshot.forEach((doc) => {
          entries.push(doc.data() as FarmDiaryEntry);
        });
        // sort by date descending
        entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        callback(entries);
      },
      (error) => {
        console.error('Error in diary entries snapshot:', error);
      }
    );
  }

  // 5. Expert Tickets
  public async saveExpertTicket(userId: string, ticket: ExpertTicket): Promise<void> {
    try {
      const ticketRef = doc(db, 'expertTickets', ticket.id);
      await setDoc(
        ticketRef,
        {
          ...ticket,
          userId,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error('Error saving expert ticket to Firestore:', error);
    }
  }

  public subscribeExpertTickets(
    userId: string,
    isOfficer: boolean,
    callback: (tickets: ExpertTicket[]) => void
  ): Unsubscribe {
    const q = isOfficer
      ? query(collection(db, 'expertTickets'))
      : query(collection(db, 'expertTickets'), where('userId', '==', userId));

    return onSnapshot(
      q,
      (snapshot) => {
        const tickets: ExpertTicket[] = [];
        snapshot.forEach((doc) => {
          tickets.push(doc.data() as ExpertTicket);
        });
        tickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        callback(tickets);
      },
      (error) => {
        console.error('Error in expert tickets snapshot:', error);
      }
    );
  }

  // 6. Chat Sessions & Messages Persistence
  public async saveChatSession(userId: string, session: ChatSession): Promise<void> {
    try {
      const sessionRef = doc(db, 'chatSessions', session.id);
      await setDoc(
        sessionRef,
        {
          ...session,
          userId,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error('Error saving chat session to Firestore:', error);
    }
  }

  public async saveChatMessage(
    userId: string,
    sessionId: string,
    message: ChatMessage
  ): Promise<void> {
    try {
      const msgRef = doc(db, 'chatSessions', sessionId, 'messages', message.id);
      await setDoc(
        msgRef,
        {
          ...message,
          sessionId,
          userId,
          createdAt: new Date().toISOString(),
        },
        { merge: true }
      );

      // Also update lastMessage & updatedAt on session
      const sessionRef = doc(db, 'chatSessions', sessionId);
      await setDoc(
        sessionRef,
        {
          id: sessionId,
          userId,
          lastMessage: message.text.slice(0, 100),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error('Error saving chat message to Firestore:', error);
    }
  }

  public subscribeChatSessions(
    userId: string,
    callback: (sessions: ChatSession[]) => void
  ): Unsubscribe {
    const q = query(collection(db, 'chatSessions'), where('userId', '==', userId));
    return onSnapshot(
      q,
      (snapshot) => {
        const sessions: ChatSession[] = [];
        snapshot.forEach((doc) => {
          sessions.push(doc.data() as ChatSession);
        });
        sessions.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
        callback(sessions);
      },
      (error) => {
        console.error('Error in chat sessions snapshot:', error);
      }
    );
  }

  public subscribeChatMessages(
    sessionId: string,
    callback: (messages: ChatMessage[]) => void
  ): Unsubscribe {
    const q = collection(db, 'chatSessions', sessionId, 'messages');
    return onSnapshot(
      q,
      (snapshot) => {
        const messages: ChatMessage[] = [];
        snapshot.forEach((doc) => {
          messages.push(doc.data() as ChatMessage);
        });
        messages.sort((a, b) => new Date(a.timestamp || (a as any).createdAt || 0).getTime() - new Date(b.timestamp || (b as any).createdAt || 0).getTime());
        callback(messages);
      },
      (error) => {
        console.error('Error in chat messages snapshot:', error);
      }
    );
  }
}

export const firestoreService = new FirestoreService();
