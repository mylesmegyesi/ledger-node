import { parseJournal, ItemState } from "../src/js/"

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

    expect(state).toEqual(ItemState.UNCLEARED);
  });

  it("parses the pending transaction state", () => {
    const journalStr = `
2010/12/01 ! Checking balance
  Assets:Checking                   $1,000.00
  Equity:Opening Balances
`;

    const {transactions: [{state}]} = parseJournal(journalStr);

    expect(state).toEqual(ItemState.PENDING);
  });

  it("parses the cleared transaction state", () => {
    const journalStr = `
2010/12/01 * Checking balance
  Assets:Checking                   $1,000.00
  Equity:Opening Balances
`;

    const {transactions: [{state}]} = parseJournal(journalStr);

    expect(state).toEqual(ItemState.CLEARED);
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

    const {transactions: [{tags}]} = parseJournal(journalStr);

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
  });

  describe("postings", () => {
    it("parses the account name", () => {
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

    it("parses the date", () => {
      const journalStr = `
2010/12/01 * Checking balance
  Assets:Checking                   $1,000.00
  Equity:Opening Balances
`;

      const {
        transactions: [
          {
            postings: [
              {date: date1},
              {date: date2}
            ]
          }
        ]
      } = parseJournal(journalStr);

      expect(date1).toEqual("2010/12/01");
      expect(date2).toEqual("2010/12/01");
    });

    it("parses the auxiliary date", () => {
      const journalStr = `
2010/12/01=2010/12/02 * Checking balance
  Assets:Checking                   $1,000.00
  Equity:Opening Balances
`;

      const {
        transactions: [
          {
            postings: [
              {date: date1, auxDate: auxDate1},
              {date: date2, auxDate: auxDate2}
            ]
          }
        ]
      } = parseJournal(journalStr);

      expect(date1).toEqual("2010/12/01");
      expect(date2).toEqual("2010/12/01");
      expect(auxDate1).toEqual("2010/12/02");
      expect(auxDate2).toEqual("2010/12/02");
    });

    it("parses the auxiliary date to null when it does not exist", () => {
      const journalStr = `
2010/12/01 * Checking balance
  Assets:Checking                   $1,000.00
  Equity:Opening Balances
`;

      const {
        transactions: [
          {
            postings: [
              {date: date1, auxDate: auxDate1},
              {date: date2, auxDate: auxDate2}
            ]
          }
        ]
      } = parseJournal(journalStr);

      expect(date1).toEqual("2010/12/01");
      expect(date2).toEqual("2010/12/01");
      expect(auxDate1).toBeNull();
      expect(auxDate2).toBeNull();
    });

    it("parses the payee", () => {
      const journalStr = `
2010/12/01 * Checking balance
  Assets:Checking                   $1,000.00
  Equity:Opening Balances
`;

      const {
        transactions: [
          {
            postings: [
              {payee: payee1},
              {payee: payee2}
            ]
          }
        ]
      } = parseJournal(journalStr);

      expect(payee1).toEqual("Checking balance");
      expect(payee2).toEqual("Checking balance");
    });

    it("parses the payee metadata", () => {
      const journalStr = `
2010/12/01 * Checking balance
  Assets:Checking                   $1,000.00
    ; Payee: Someone Else
  Equity:Opening Balances
`;

      const {
        transactions: [
          {
            postings: [
              {payee: payee1},
              {payee: payee2}
            ]
          }
        ]
      } = parseJournal(journalStr);

      expect(payee1).toEqual("Someone Else");
      expect(payee2).toEqual("Checking balance");
    });

    it("parses the uncleared state", () => {
      const journalStr = `
2010/12/01 Checking balance
  Assets:Checking                   $1,000.00
  Equity:Opening Balances
`;

      const {
        transactions: [
          {
            postings: [
              {state: state1},
              {state: state2}
            ]
          }
        ]
      } = parseJournal(journalStr);

      expect(state1).toEqual(ItemState.UNCLEARED);
      expect(state2).toEqual(ItemState.UNCLEARED);
    });

    it("parses the pending state", () => {
      const journalStr = `
2010/12/01 Checking balance
  ! Assets:Checking                   $1,000.00
  Equity:Opening Balances
`;

      const {
        transactions: [
          {
            postings: [
              {state: state1},
              {state: state2}
            ]
          }
        ]
      } = parseJournal(journalStr);

      expect(state1).toEqual(ItemState.PENDING);
      expect(state2).toEqual(ItemState.UNCLEARED);
    });

    it("parses the cleared state", () => {
      const journalStr = `
2010/12/01 Checking balance
  Assets:Checking                   $1,000.00
  * Equity:Opening Balances
`;

      const {
        transactions: [
          {
            postings: [
              {state: state1},
              {state: state2}
            ]
          }
        ]
      } = parseJournal(journalStr);

      expect(state1).toEqual(ItemState.UNCLEARED);
      expect(state2).toEqual(ItemState.CLEARED);
    });

    it("parses the note on the payee line", () => {
      const journalStr = `
2012-03-10 * KFC                
  Expenses:Food                $20.00 ; yum, chicken...
  Assets:Cash                         ; boo, payment
`;

      const {
        transactions: [
          {
            postings: [
              {note: note1},
              {note: note2}
            ]
          }
        ]
      } = parseJournal(journalStr);

      expect(note1).toEqual(" yum, chicken...");
      expect(note2).toEqual(" boo, payment");
    });

    it("parses the transaction note on the next line", () => {
      const journalStr = `
2012-03-10 * KFC                
  Expenses:Food                $20.00
    ; yum, chicken...
  Assets:Cash
    ; boo, payment
`;

      const {
        transactions: [
          {
            postings: [
              {note: note1},
              {note: note2}
            ]
          }
        ]
      } = parseJournal(journalStr);

      expect(note1).toEqual(" yum, chicken...");
      expect(note2).toEqual(" boo, payment");
    });

    it("parses the transaction note on both lines", () => {
      const journalStr = `
2012-03-10 * KFC
  Expenses:Food                $20.00 ; yum, chicken...
    ; and more notes...
    ; and even more notes...
  Assets:Cash                         ; boo, payment
    ; boo, payment note
    ; and even more boo...
`;

      const {
        transactions: [
          {
            postings: [
              {note: note1},
              {note: note2}
            ]
          }
        ]
      } = parseJournal(journalStr);

      expect(note1).toEqual(" yum, chicken...\n and more notes...\n and even more notes...");
      expect(note2).toEqual(" boo, payment\n boo, payment note\n and even more boo...");
    });

    it("parses tags", () => {
      const journalStr = `
2010/12/01 * Checking balance
  Assets:Checking                   $1,000.00
    ; :TAG1:TAG2:TAG3:tag4:
  Equity:Opening Balances
    ; :TAG5:TAG6:TAG7:tag8:
`;

      const {
        transactions: [
          {
            postings: [
              {tags: tags1},
              {tags: tags2}
            ]
          }
        ]
      } = parseJournal(journalStr);

      expect(tags1).toEqual(["TAG1", "TAG2", "TAG3", "tag4"]);
      expect(tags2).toEqual(["TAG5", "TAG6", "TAG7", "tag8"]);
    });

    it("parses transaction metadata", () => {
      const journalStr = `
2010/12/01 * Checking balance
  Assets:Checking                   $1,000.00 ; tag1: tag1 value
    ; MyTag: This is just a bogus value for MyTag
    ; tag2: tag2 value
  Equity:Opening Balances                     ; tag3: tag3 value
    ; MyTag: This is just another bogus value for MyTag
    ; tag4: tag4 value
`;

      const {
        transactions: [
          {
            postings: [
              {metadata: metadata1},
              {metadata: metadata2}
            ]
          }
        ]
      } = parseJournal(journalStr);

      expect(metadata1).toEqual({
        "MyTag": "This is just a bogus value for MyTag",
        "tag1": "tag1 value",
        "tag2": "tag2 value",
      });
      expect(metadata2).toEqual({
        "MyTag": "This is just another bogus value for MyTag",
        "tag3": "tag3 value",
        "tag4": "tag4 value",
      });
    });
  })
});
