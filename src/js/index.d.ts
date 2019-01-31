
export type Journal = {
  transactions: Transaction[];
}

export type Transaction = {
  payee: string;
  code: number | null;
  date: string;
  auxDate: string | null;
}

export function parseJournal(journal: string): Journal;
