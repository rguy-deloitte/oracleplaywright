// This test script ... (does what?)
// If reading data from Excel, ensure you have the required Excel file in the correct directory: excel-data-files/GL-create-manual-journal.xlsx
// Run using: npx playwright test tests/misc/GL-create-manual-journal.spec.ts
import { test, expect, Page, Request } from '@playwright/test';
import path from 'path';
import { addNumberedTableRows } from '../util/table';
import * as navUtil from '../util/navigation';
import * as form from '../util/form';
import { faker } from '@faker-js/faker';

// Generates fake data for a number of Journal Batches on the Create Journal page
function generateFakeJournalBatches(nBatches: number, nJournals: number, maxLines: number) {
  let allBatches: Record<string, any>[] = [];
  
  // Generates an array of Journal Batches using nBatches argument
  for (let b = 0; b < nBatches; b++) {
    let newBatch: Record<string, any> = {};

    // Random text for batch name and description
    newBatch['Journal Batch'] = faker.word.noun();
    newBatch['Description'] = faker.lorem.sentence({min: 4, max: 12});

    // Accounting Period is a random month from the last 2 years
    const accountingDate = faker.date.between({ from: "2019-01-01", to: "2024-02-01" });

    // Pass to accounting period in the form Dec-23
    newBatch['Accounting Period'] = `${accountingDate.toLocaleString('default', { month: 'short' }).slice(0, 3)}-${accountingDate.getFullYear().toString().slice(-2)}`;

    // Generate a number of journals according to nJournals argument
    newBatch['Journals'] = [];
    for (let j = 0; j < nJournals; j++) {
      newBatch['Journals'].push(generateFakeJournal(faker.number.int({ min: 2, max: maxLines }), accountingDate.getFullYear(), accountingDate.getMonth() + 1));
    }

    // Ledger is added to only the first Journal, and defaults to this set value from the second onwards
    newBatch['Journals'][0]['Ledger'] = faker.helpers.arrayElement(['DSI UK IFRS PL']);

    allBatches.push(newBatch);
  }

  return allBatches;
}

// Generates fake data that can be entered into the Journal and Journal Lines section of the Create Journal page
// month argument should be 1 indexed, so 2 represents February
function generateFakeJournal(nPairedLines: number, year: number, month: number) {
  let newJournal: Record<string, string|Record<string, string>[]> = {};
  
  // Random text for journal name and description
  newJournal['Journal'] = faker.word.noun();
  newJournal['Description'] = faker.lorem.sentence({min: 4, max: 12});

  // A random day of the month, for the given accounting period (form requires it be the same month as the Batch data)
  // Creating a new Date assumes zero indexing, so using 1-12 system will give the next month, 
  // and the 0th day will be the last day of the month before. So yields the last day of 'month'
  const dayString = faker.number.int({min: 1, max: new Date(year, month, 0).getDate()}).toString().padStart(2, "0")
  const monthString = month.toString().padStart(2, "0");
  const yearString = year.toString().slice(-2);
  newJournal['Accounting Date'] = [dayString, monthString, yearString].join('/');

  // Select from valid options for category and currency
  newJournal['Category'] = faker.helpers.arrayElement(['Manual']);
  newJournal['Currency'] = faker.helpers.arrayElement(['GBP Pound Sterling']);
  
  // Generate nLines worth of Journal Lines to add
  newJournal['Journal Lines'] = generateFakeJournalLines(nPairedLines);

  return newJournal;
}

// Generates fake data that can be entered into a Journal Line in the Create Journal page
function generateFakeJournalLines(nPairs: number) {
  let allLines = [];
  for (let i = 0; i < nPairs; i++) {
    let newDebitLine: Record<string, string> = {};
    let newCreditLine: Record<string, string> = {};

    newDebitLine['Account'] = newCreditLine['Account'] = '14010.000000.1012000000.000000.00000.000000.00000.0000.00000.00000';

    // A random currency value as a string with 2 decimal places then randomise to credit or debit
    const debitValue: string = (Math.random() * 10000).toFixed(2);
    newCreditLine['Entered Credit'] = debitValue;
    newDebitLine['Entered Debit'] = debitValue;

    // Random word for mandatory description
    newDebitLine['Description Mandatory'] = faker.lorem.word(8);
    newCreditLine['Description Mandatory'] = faker.lorem.word(8);

    allLines.push(newDebitLine, newCreditLine);
  }

  return allLines;
}

// Takes the name of a collapsible section of the form and returns the Locator object for
// that section. This is useful if two fields have the same name but are on separate sections.
async function getSectionFromCollapse(page: Page, buttonTitle: string){
  let collapseButtonLocator = await page.getByTitle(buttonTitle, { exact: true })
  let collapseButtonId = await collapseButtonLocator.getAttribute("aria-controls");

  if (collapseButtonId == null) {
      throw Error(`Button '${buttonTitle}' has no 'aria-controls' attribute`);
  }

  collapseButtonId = collapseButtonId.replace("::content", "");

  return page.locator(`id=${collapseButtonId}`);
}

// Fills the fields in the Journal Batch section of the form
// It calls the fillJournal function to complete each Journal within the batch
async function fillJournalBatch(page: Page, batchData: Record<string, any>) {
  await test.step('Enter Batch Details', async () => {
    const journalBatchSection = await getSectionFromCollapse(page, "Collapse Journal Batch");
    const allJournalData: Record<string, any>[] = batchData['Journals'];
    delete batchData['Journals'];

    // Fill in all fields in the section, type out the accounting period so that validation is processed
    await form.fillAllFieldsByName(page, journalBatchSection, batchData, {'Accounting Period': 'click'});
    
    // Reaccess the accounting period and make sure a menu item is selected to trigger validation
    await page.waitForTimeout(500);
    const accountingPeriodLocator = page.getByRole('textbox', { name: "Accounting Period" });
    await accountingPeriodLocator.press('Enter');
    await accountingPeriodLocator.blur();

    // Fill in the details for each journal
    for (const currentJournal of allJournalData) {
      await fillJournal(page, currentJournal);
    }
  });
}

// Fills the fields in the Journal section of the form and each line in Journal Lines
// Reloads the page after submitting the journal form, to clear the fields for the next journal
async function fillJournal(page: Page, journalData: Record<string, any>) {
  await test.step(`Enter Journal Details: ${journalData['Journal']}`, async () => {
    const journalSection = await getSectionFromCollapse(page, "Collapse Journal");
    const journalLineData: Record<string, any>[] = journalData['Journal Lines'];
    delete journalData['Journal Lines'];

    await form.fillAllFieldsByName(page, journalSection, journalData);

    await test.step('Add Journal Lines', async () => {
      const journalLinesAddRowButton = page.getByRole('button', { name: 'Add Row', exact: true });
      const journalLinesTableRows = await page.locator('[summary="Journal Lines"]').getByRole('row');
      await expect(journalLinesTableRows).toHaveCount(2);

      await addNumberedTableRows(page, journalLineData, journalLinesTableRows, journalLinesAddRowButton);
      await expect(journalLinesTableRows).toHaveCount(journalLineData.length);

      // Click on 'Add' Button to add a new journal and reload the page to change to edit batch page
      await page.getByRole('link', { name: 'Journal Actions' }).click();
      await page.getByText('Add', { exact: true }).click();
      await page.waitForTimeout(3000);
      await page.reload();
    });
  });
}

// Each time the page sends a HTTP request, this function is run and awaits a response before continuing
// This is essential for allowing data validation requests to run at various stages of the process
async function awaitResponse(request: Request) {
    const response = await request.response()
}

// TESTING STARTS HERE
const authFile = path.join(__dirname, '../.auth/auth-state.json');
test.use({ storageState: authFile });
test.describe.configure({ mode: 'serial' });  // Required to ensure tests run in expected order and that beforeAll & afterAll only run once
test.setTimeout(120000); // This test is particularly long as there are many rows to be added, so needs a longer timeout

// Generates a nested Record with multiple journal lines to each journal, and multiple journals to each batch
const testData = generateFakeJournalBatches(1, 3, 3); 

test.describe('Post Manual Journal', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    // Navigate to where the process begins
    await navUtil.navigateToHomePage(page);
    await navUtil.navigateToTile(page, 'General Accounting', testInfo);
    await navUtil.navigateToTileLink(page, 'Journals', testInfo);
    await navUtil.navigateToTileSideLink(page, 'Create Journal', testInfo);
  });

  for (let batchNo = 0; batchNo < testData.length; batchNo++) {
    test(`Enter Journal Batch: ${batchNo}`, async ({ page }, testInfo) => {
      // Create a new listener for any HTTP requests, awaits responses
      page.on("request", awaitResponse);

      // For each Journal Batch in the test data, fill in all fields
      await fillJournalBatch(page, testData[batchNo]);
    });
  }
});
