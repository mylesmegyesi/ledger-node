import { TransactionState } from "./TransactionState";

export type Journal = {
  transactions: Transaction[];
}

export type Transaction = {
  payee: string,
  code: number | null,
  date: string,
  auxDate: string | null,
  state: TransactionState,
  note: string | null,
  tags: string[],
  metadata: {[key: string]: string}
}

export function parseJournal(journal: string): Journal;

export * from "./TransactionState";
