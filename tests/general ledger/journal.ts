import { faker } from '@faker-js/faker';

// Generates fake data for a number of Journal Batches on the Create Journal page
export function generateFakeJournalBatches(nBatches: number, nJournals: number, maxLines: number) {
  let allBatches: Record<string, any>[] = [];
  
  // Generates an array of Journal Batches using nBatches argument
  for (let b = 0; b < nBatches; b++) {
    let newBatch: Record<string, any> = {};

    // Random text for batch name and description
    newBatch['Journal Batch'] = faker.word.noun();
    newBatch['Description'] = faker.lorem.sentence({min: 4, max: 12});

    // Accounting Period is a random month from the last 2 years
    const accountingDate = faker.date.between({ from: "2025-05-01", to: "2026-07-01" });

    // Pass to accounting period in the form Dec-23
    newBatch['Accounting Period'] = `${accountingDate.toLocaleString('default', { month: 'short' }).slice(0, 3)}-${accountingDate.getFullYear().toString().slice(-2)}`;

    // Generate a number of journals according to nJournals argument
    newBatch['Journals'] = [];
    for (let j = 0; j < nJournals; j++) {
      newBatch['Journals'].push(generateFakeJournal(faker.number.int({ min: 2, max: maxLines }), accountingDate.getFullYear(), accountingDate.getMonth() + 1));
    }

    // Ledger is added to only the first Journal, and defaults to this set value from the second onwards
    newBatch['Journals'][0]['Ledger'] = faker.helpers.arrayElement(['UK ACTUALS GBP Apr']);

    allBatches.push(newBatch);
  }

  return allBatches;
}

// Generates fake data that can be entered into the Journal and Journal Lines section of the Create Journal page
// month argument should be 1 indexed, so 2 represents February
function generateFakeJournal(maxLines: number, year: number, month: number) {
  let newJournal: Record<string, string|Record<string, string>[]> = {};
  
  // Random text for journal name and description
  newJournal['Journal'] = faker.word.noun();
  newJournal['Description'] = faker.lorem.sentence({min: 4, max: 12});

  // A random day of the month, for the given accounting period (form requires it be the same month as the Batch data)
  // Creating a new Date assumes zero indexing, so using 1-12 system will give the next month, 
  // and the 0th day will be the last day of the month before. So yields the last day of 'month'
  const dayString = faker.number.int({min: 1, max: new Date(year, month, 0).getDate()}).toString();
  const monthString = month.toString();
  const yearString = year.toString().slice(-2);
  newJournal['Accounting Date'] = [monthString, dayString, yearString].join('/');

  // Select from valid options for category and currency
  newJournal['Category'] = faker.helpers.arrayElement(['Manual']);
  newJournal['Currency'] = faker.helpers.arrayElement(['GBP Pound Sterling']);
  
  // Generate nLines worth of Journal Lines to add
  newJournal['Journal Lines'] = generateFakeJournalLines(maxLines);

  return newJournal;
}

// Generates fake data that can be entered into a Journal Line in the Create Journal page
function generateFakeJournalLines(maxLines: number) {
  let nPairs = faker.number.int({ min: 1, max: Math.max(1, maxLines/2) });
  
  let allLines = [];
  for (let i = 0; i < nPairs; i++) {
    let newDebitLine: Record<string, string> = {};
    let newCreditLine: Record<string, string> = {};

    newDebitLine['Account'] = newCreditLine['Account'] = '217000.00000000.10001000.000000.000000.000000.000000.000000.000000';

    // A random currency value as a string with 2 decimal places then added to both credit and debit
    const debitValue: string = (Math.random() * 10000).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    newCreditLine['Entered Credit'] = debitValue;
    newDebitLine['Entered Debit'] = debitValue;

    // Random word for mandatory description
    newDebitLine['Description'] = faker.lorem.sentence({min: 4, max: 12});
    newCreditLine['Description'] = faker.lorem.sentence({min: 4, max: 12});

    allLines.push(newDebitLine, newCreditLine);
  }

  return allLines;
}

export function getRegexAnyDayDate(date: string) {
  if (date[0] == '0') {
    date = date.substring(1);
  }
  let splitDate = date.split('/');
  let regex: RegExp = new RegExp(`0?${splitDate[0]}/[0-9]*/${splitDate[2]}`);

  return regex;
}