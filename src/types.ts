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
  photoURL?: string;
  roles: UserRole[];
  prayerCellIds: string[];
  status?: 'student' | 'graduate';
  usage?: 'personal' | 'community' | 'committee';
  phone?: string;
  degree?: string;
  branch?: string;
  college?: string;
  profession?: string;
  workplace?: string;
  district?: string;
  createdAt: string;
}

export interface PrayerCell {
  id: string;
  name: string;
  region?: string;
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

export interface MemberContribution {
  name: string;
  amount: number;
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
  receiptNumber?: string;
  receiptDate?: string;
  receiptUrl?: string; // We'll store Base64 here
  memberContributions?: MemberContribution[];
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

export interface Prayer {
  id: string;
  userId: string;
  userName?: string;
  date: string;
  type: 'ACTS' | 'Freeform';
  content?: string;
  acts?: {
    adoration?: string;
    confession?: string;
    thanksgiving?: string;
    supplication?: string;
  };
  status: 'waiting' | 'answered' | 'confession' | 'conviction' | 'thanksgiving' | 'supplication' | 'general';
  isShared: boolean;
  createdAt: string;
}

export interface QuietTime {
  id: string;
  userId: string;
  date: string;
  passage?: string;
  type: 'ASPECT' | 'Freeform';
  content?: string;
  aspect?: {
    aboutGod?: string;
    sinsToAvoid?: string;
    promisesToClaim?: string;
    examplesToFollow?: string;
    commandsToObey?: string;
    theme?: string;
  };
  imageUrl?: string;
  isShared: boolean;
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  date: string;
  time?: string;
  day?: string;
  title: string;
  content: string;
  tags: string[];
  mood?: string;
  prayerId?: string;
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
