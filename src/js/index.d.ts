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
  metadata: { [key: string]: string },
  postings: Posting[],
}

export type Posting = {
  account: string,
  amount: {
    type: "amount",
    value: Amount,
  } | {
    type: "balance",
    value: Amount[],
  }
}

export type Amount = {
  commodity: Commodity,
  quantity: string,
}

export type Commodity = {
  flags: string[],
  value: string;
}

export function parseJournal(journal: string): Journal;

export * from "./TransactionState";
