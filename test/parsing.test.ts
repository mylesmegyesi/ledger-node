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
});
