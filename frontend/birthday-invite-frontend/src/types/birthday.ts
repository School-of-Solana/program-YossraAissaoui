export interface BirthdayEvent {
  id: string;
  name: string;
  date: number;
  coming: number;
  busy: number;
  totalComments: number;
  address: string;
  creator: string;
}

export interface Comment {
  id: number;
  author: string;
  text: string;
  timestamp: number;
}

export interface RSVPStatus {
  status: 'none' | 'coming' | 'busy';
  timestamp?: number;
}

export interface ProgramContextType {
  program: any;
  wallet: any;
  connection: any;
  loading: boolean;
  error: string | null;
}