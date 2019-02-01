import { parseJournal, TransactionState } from "../src/js/"

describe("Parsing the Journal file", () => {
  it("parses the transaction payee", () => {
    const journalStr = `
2010/12/01 * Checking balance
  Assets:Checking                   $1,000.00
  Equity:Opening Balances
`;

    const {transactions: [{payee}]} = parseJournal(journalStr);

    expect(payee).toEqual("Checking balance");
  });

  it("parses the code to null when there is none", () => {
    const journalStr = `
2010/12/01 * Checking balance
  Assets:Checking                   $1,000.00
  Equity:Opening Balances
`;

    const {transactions: [{code}]} = parseJournal(journalStr);

    expect(code).toBeNull();
  });

  it("parses the code when present", () => {
    const journalStr = `
2010/12/01 * (101) Checking balance
  Assets:Checking                   $1,000.00
  Equity:Opening Balances
`;

    const {transactions: [{code}]} = parseJournal(journalStr);

    expect(code).toEqual("101");
  });

  it("parses the date", () => {
    const journalStr = `
2010/12/01 * Checking balance
  Assets:Checking                   $1,000.00
  Equity:Opening Balances
`;

    const {transactions: [{date}]} = parseJournal(journalStr);

    expect(date).toEqual("2010/12/01");
  });

  it("parses the auxiliary date", () => {
    const journalStr = `
2010/12/01=2010/12/02 * Checking balance
  Assets:Checking                   $1,000.00
  Equity:Opening Balances
`;

    const {transactions: [{date, auxDate}]} = parseJournal(journalStr);

    expect(date).toEqual("2010/12/01");
    expect(auxDate).toEqual("2010/12/02");
  });

  it("parses the auxiliary date to null when it does not exist", () => {
    const journalStr = `
2010/12/01 * Checking balance
  Assets:Checking                   $1,000.00
  Equity:Opening Balances
`;

    const {transactions: [{date, auxDate}]} = parseJournal(journalStr);

    expect(date).toEqual("2010/12/01");
    expect(auxDate).toBeNull();
  });

  it("parses the uncleared transaction state", () => {
    const journalStr = `
2010/12/01 Checking balance
  Assets:Checking                   $1,000.00
  Equity:Opening Balances
`;

    const {transactions: [{state}]} = parseJournal(journalStr);

    expect(state).toEqual(TransactionState.UNCLEARED);
  });

  it("parses the pending transaction state", () => {
    const journalStr = `
2010/12/01 ! Checking balance
  Assets:Checking                   $1,000.00
  Equity:Opening Balances
`;

    const {transactions: [{state}]} = parseJournal(journalStr);

    expect(state).toEqual(TransactionState.PENDING);
  });

  it("parses the cleared transaction state", () => {
    const journalStr = `
2010/12/01 * Checking balance
  Assets:Checking                   $1,000.00
  Equity:Opening Balances
`;

    const {transactions: [{state}]} = parseJournal(journalStr);

    expect(state).toEqual(TransactionState.CLEARED);
  });

  it("parses the transaction note on the payee line", () => {
    const journalStr = `
2012-03-10 * KFC                ; yum, chicken...
  Expenses:Food                $20.00
  Assets:Cash
`;

    const {transactions: [{note}]} = parseJournal(journalStr);

    expect(note).toEqual(" yum, chicken...");
  });

  it("parses the transaction note on the next line", () => {
    const journalStr = `
2012-03-10 * KFC
  ; and more notes...
  Expenses:Food                $20.00
  Assets:Cash
`;

    const {transactions: [{note}]} = parseJournal(journalStr);

    expect(note).toEqual(" and more notes...");
  });

  it("parses the transaction note on both lines", () => {
    const journalStr = `
2012-03-10 * KFC                ; yum, chicken...
  ; and more notes...
  ; and even more notes...
  Expenses:Food                $20.00
  Assets:Cash
`;

    const {transactions: [{note}]} = parseJournal(journalStr);

    expect(note).toEqual(" yum, chicken...\n and more notes...\n and even more notes...");
  });

  it("parses transaction tags", () => {
    const journalStr = `
2010/12/01 * Checking balance
  ; :TAG1:TAG2:TAG3:tag4:
  Assets:Checking                   $1,000.00
  Equity:Opening Balances
`;

    const {transactions: [{tags, metadata}]} = parseJournal(journalStr);

    expect(tags).toEqual(["TAG1", "TAG2", "TAG3", "tag4"]);
  });

  it("parses transaction metadata", () => {
    const journalStr = `
2010/12/01 * Checking balance  ; tag1: tag1 value
  ; MyTag: This is just a bogus value for MyTag
  ; tag2: tag2 value
  Assets:Checking                   $1,000.00
  Equity:Opening Balances
`;

    const {transactions: [{metadata}]} = parseJournal(journalStr);

    expect(metadata).toEqual({
      "MyTag": "This is just a bogus value for MyTag",
      "tag1": "tag1 value",
      "tag2": "tag2 value",
    });
  })

  it("parses the posting account name", () => {
    const journalStr = `
2010/12/01 * Checking balance
  Assets:Checking                   $1,000.00
  Equity:Opening Balances
`;

    const {transactions: [{postings}]} = parseJournal(journalStr);

    expect(postings).toHaveLength(2);
    const [
      {account: account1},
      {account: account2},
    ] = postings;
    expect(account1).toEqual("Assets:Checking");
    expect(account2).toEqual("Equity:Opening Balances");
  });
});
