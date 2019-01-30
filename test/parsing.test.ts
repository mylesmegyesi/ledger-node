import {parseJournal} from "../src/js/"

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
});
