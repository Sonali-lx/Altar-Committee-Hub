export enum UserRole {
  ADMIN = 'ADMIN',
  SENIOR_ADVISOR = 'SENIOR_ADVISOR',
  PRESIDENT = 'PRESIDENT',
  SECRETARY = 'SECRETARY',
  TREASURER = 'TREASURER',
  PRAYER_SECRETARY = 'PRAYER_SECRETARY',
  PRAYER_CELL_SECRETARY = 'PRAYER_CELL_SECRETARY',
  CELL_PARENT = 'CELL_PARENT',
  CELL_LEADER = 'CELL_LEADER',
  CELL_MEMBER = 'CELL_MEMBER',
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  roles: UserRole[];
  prayerCellIds: string[];
  createdAt: string;
}

export interface PrayerCell {
  id: string;
  name: string;
  type: 'Believers' | 'Evangelical' | 'Mixed';
  genderType: 'Boys' | 'Girls' | 'Mixed';
  category: 'Online' | 'Offline';
  place?: string;
  parentIds: string[];
  leaderIds: string[];
  memberIds: string[];
  prayerCellSecretaryId: string;
  createdAt: string;
}

export interface CellMeeting {
  id: string;
  cellId: string;
  topic: string;
  bibleStudyType: 'EBS' | 'BBS';
  date: string;
  time: string;
  venue: string;
  meetLink?: string;
  isOnline: boolean;
  attendance: Record<string, boolean>;
  createdBy: string;
  createdAt: string;
}

export enum FinancialRecordType {
  CONTRIBUTION = 'contribution',
  EXPENSE = 'expense',
}

export interface FinancialRecord {
  id: string;
  type: FinancialRecordType;
  userId?: string;
  userName?: string;
  amount: number;
  month?: string;
  year?: number;
  description?: string;
  eventId?: string;
  createdAt: string;
}

export interface CommitteeEvent {
  id: string;
  name: string;
  speaker: string;
  theme: string;
  dateTime: string;
  venue: string;
  planDetails: string;
  attendeeCount?: number;
  financeSummary?: string;
  createdAt: string;
}

export interface QuietTime {
  id: string;
  userId: string;
  date: string;
  content: string;
  imageUrl?: string;
  isShared: boolean;
  createdAt: string;
}

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
  }
}
