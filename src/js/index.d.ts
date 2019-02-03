import { ItemState } from "./ItemState";

export type Journal = {
  transactions: Transaction[];
}

export type BaseItem = {
  auxDate: string | null,
  date: string,
  metadata: { [key: string]: string },
  note: string | null,
  payee: string,
  state: ItemState,
  tags: string[],
}

export type Transaction = BaseItem & {
  code: number | null,
  postings: Posting[],
};

export type Posting = BaseItem & {
  account: string,
  amount: {
    type: "amount",
    value: Amount,
  } | {
    type: "balance",
    value: Amount[],
  }
};

export type Amount = {
  commodity: Commodity,
  quantity: string,
}

export type Commodity = {
  flags: string[],
  value: string;
}

export function parseJournal(journal: string): Journal;

export * from "./ItemState";
