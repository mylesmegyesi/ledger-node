
export type Journal = {
  transactions: Transaction[];
}

export type Transaction = {
  payee: string;
  code: number | null;
}

export function parseJournal(journal: string): Journal;
