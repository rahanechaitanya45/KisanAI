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
import { db, auth } from '../lib/firebase';
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

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): FirestoreErrorInfo {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.warn('Firestore Operation Error:', JSON.stringify(errInfo));
  return errInfo;
}

export class FirestoreService {
  // 1. User Profile Sync
  public async saveUserAccount(user: AuthUser): Promise<void> {
    const path = `users/${user.id}`;
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
      handleFirestoreError(error, OperationType.WRITE, path);
      throw error;
    }
  }

  public async getUserAccount(userId: string): Promise<AuthUser | null> {
    const path = `users/${userId}`;
    try {
      const userRef = doc(db, 'users', userId);
      const snapshot = await getDoc(userRef);
      if (snapshot.exists()) {
        return snapshot.data() as AuthUser;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return null;
    }
  }

  // 2. Farmer Agricultural Profile (Farms, Plots, Crops, Soil)
  public async saveFarmerProfile(userId: string, profile: FarmerProfile): Promise<void> {
    const path = `farmers/${userId}`;
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
      handleFirestoreError(error, OperationType.WRITE, path);
      throw error;
    }
  }

  public async getFarmerProfile(userId: string): Promise<FarmerProfile | null> {
    const path = `farmers/${userId}`;
    try {
      const farmerRef = doc(db, 'farmers', userId);
      const snapshot = await getDoc(farmerRef);
      if (snapshot.exists()) {
        const data = snapshot.data() as FarmerProfile;
        return data;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return null;
    }
  }

  public subscribeFarmerProfile(
    userId: string,
    callback: (profile: FarmerProfile | null) => void
  ): Unsubscribe {
    if (!userId || !auth.currentUser) {
      return () => {};
    }
    const path = `farmers/${userId}`;
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
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  }

  // 3. Farm Tasks
  public async saveTasks(userId: string, tasks: FarmTask[]): Promise<void> {
    try {
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
      handleFirestoreError(error, OperationType.WRITE, 'tasks');
    }
  }

  public async upsertTask(userId: string, task: FarmTask): Promise<void> {
    const path = `tasks/${task.id}`;
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
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  public async getTasks(userId: string): Promise<FarmTask[]> {
    const path = 'tasks';
    try {
      const q = query(collection(db, 'tasks'), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      const tasks: FarmTask[] = [];
      snapshot.forEach((doc) => {
        tasks.push(doc.data() as FarmTask);
      });
      return tasks;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  }

  public subscribeTasks(
    userId: string,
    callback: (tasks: FarmTask[]) => void
  ): Unsubscribe {
    if (!userId || !auth.currentUser) {
      return () => {};
    }
    const path = 'tasks';
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
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  }

  // 4. Farm Diary Entries
  public async saveDiaryEntry(userId: string, entry: FarmDiaryEntry): Promise<void> {
    const path = `diaryEntries/${entry.id}`;
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
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  public async deleteDiaryEntry(entryId: string): Promise<void> {
    const path = `diaryEntries/${entryId}`;
    try {
      const entryRef = doc(db, 'diaryEntries', entryId);
      await deleteDoc(entryRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }

  public subscribeDiaryEntries(
    userId: string,
    callback: (entries: FarmDiaryEntry[]) => void
  ): Unsubscribe {
    if (!userId || !auth.currentUser) {
      return () => {};
    }
    const path = 'diaryEntries';
    const q = query(collection(db, 'diaryEntries'), where('userId', '==', userId));
    return onSnapshot(
      q,
      (snapshot) => {
        const entries: FarmDiaryEntry[] = [];
        snapshot.forEach((doc) => {
          entries.push(doc.data() as FarmDiaryEntry);
        });
        entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        callback(entries);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  }

  // 5. Expert Tickets
  public async saveExpertTicket(userId: string, ticket: ExpertTicket): Promise<void> {
    const path = `expertTickets/${ticket.id}`;
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
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  public subscribeExpertTickets(
    userId: string,
    isOfficer: boolean,
    callback: (tickets: ExpertTicket[]) => void
  ): Unsubscribe {
    if (!userId || !auth.currentUser) {
      return () => {};
    }
    const path = 'expertTickets';
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
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  }

  // 6. Chat Sessions & Messages Persistence
  public async saveChatSession(userId: string, session: ChatSession): Promise<void> {
    if (!userId || !auth.currentUser) return;
    const path = `chatSessions/${session.id}`;
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
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  public async saveChatMessage(
    userId: string,
    sessionId: string,
    message: ChatMessage
  ): Promise<void> {
    if (!userId || !auth.currentUser) return;
    const path = `chatSessions/${sessionId}/messages/${message.id}`;
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
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  public subscribeChatSessions(
    userId: string,
    callback: (sessions: ChatSession[]) => void
  ): Unsubscribe {
    if (!userId || !auth.currentUser) {
      return () => {};
    }
    const path = 'chatSessions';
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
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  }

  public subscribeChatMessages(
    sessionId: string,
    callback: (messages: ChatMessage[]) => void
  ): Unsubscribe {
    if (!sessionId || !auth.currentUser) {
      return () => {};
    }
    const path = `chatSessions/${sessionId}/messages`;
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
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  }
}

export const firestoreService = new FirestoreService();

