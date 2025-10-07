import { faker } from '@faker-js/faker';
import { test, expect, Page, TestInfo } from "@playwright/test";
import { navigateToTileSideLink } from '../util/navigation';
import * as forms from '../util/form'


// Generates fake data for a number of Journal Batches on the Create Journal page
export function generateFakeJournalBatch(nJournals: number, nLines: number) {  
  // Generates an array of Journal Batches using nBatches argument
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
    newBatch['Journals'].push(generateFakeJournal(nLines, accountingDate.getFullYear(), accountingDate.getMonth() + 1));
  }

  // Ledger is added to only the first Journal, and defaults to this set value from the second onwards
  newBatch['Journals'][0]['Ledger'] = faker.helpers.arrayElement(['MT ACTUALS EUR Apr']);

  return newBatch;
}

// Generates fake data that can be entered into the Journal and Journal Lines section of the Create Journal page
// month argument should be 1 indexed, so 2 represents February
function generateFakeJournal(nLines: number, year: number, month: number) {
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
  newJournal['Currency'] = faker.helpers.arrayElement(['Euro']);
  
  // Generate nLines worth of Journal Lines to add
  newJournal['Journal Lines'] = generateFakeJournalLines(nLines);

  return newJournal;
}

// Generates fake data that can be entered into a Journal Line in the Create Journal page
function generateFakeJournalLines(nLines: number) {
  let nPairs = Math.round(nLines / 2);
  
  let allLines = [];
  for (let i = 0; i < nPairs; i++) {
    console.log(i);
    let newDebitLine: Record<string, string> = {};
    let newCreditLine: Record<string, string> = {};

    newDebitLine['Account'] = newCreditLine['Account'] = '231930.00000000.10001000.000000.000000.000000.000000.000000.000000';

    // A random currency value as a string with 2 decimal places then added to both credit and debit
    const debitValue: string = (Math.random() * 10000).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    newCreditLine['Entered Credit'] = debitValue;
    newDebitLine['Entered Debit'] = debitValue;

    // Random word for mandatory description
    newDebitLine['Description'] = faker.lorem.sentence({min: 4, max: 12});
    newCreditLine['Description'] = faker.lorem.sentence({min: 4, max: 12});

    allLines.push(newDebitLine);
    allLines.push(newCreditLine);
  }

  return allLines;
}

export async function fillJournalBatchDetails(page: Page, data: Record<string, any>, testInfo?: TestInfo) {
  await navigateToTileSideLink(page, 'Create Journal', testInfo);
  
  await test.step("Enter Journal Batch Details", async () => {
    const journalBatchSection = await forms.getSectionFromCollapse(page, "Collapse Journal Batch");

    await forms.fillTextboxByName(page, "Journal Batch", data["Journal Batch"], { pageSection: journalBatchSection });
    await forms.fillTextboxByName(page, "Description", data["Description"], { pageSection: journalBatchSection });
    await forms.clickTextboxByName(page, "Accounting Period", data["Accounting Period"], { pageSection: journalBatchSection });

    if (testInfo) {
      await testInfo.attach("Journal Batch details filled", { body: await journalBatchSection.screenshot(), contentType: 'image/png' });
    }
  });
}

export async function fillJournalDetails(page: Page, data: Record<string, any>, testInfo?: TestInfo) {
  await test.step(`Add Journal Details`, async () => {
    const journalBatchSection = await forms.getSectionFromCollapse(page, "Collapse Journal");

    await forms.fillTextboxByName(page, "Journal", data["Journal"], { pageSection: journalBatchSection });
    await forms.fillTextboxByName(page, "Description", data["Description"], { pageSection: journalBatchSection });
    await forms.clickTextboxByName(page, "Ledger", data["Ledger"], { pageSection: journalBatchSection });
    await forms.fillTextboxByName(page, "Accounting Date", data["Accounting Date"], { pageSection: journalBatchSection });
    await forms.fillTextboxByName(page, "Category", data["Category"], { pageSection: journalBatchSection });
    await forms.clickTextboxByName(page, "Currency", data["Currency"], { pageSection: journalBatchSection });

    if (testInfo) {
      await testInfo.attach("Journal details filled", { body: await journalBatchSection.screenshot(), contentType: 'image/png' });
    }
  });
}

export async function addJournalLineDetails(page: Page, data: Record<string, any>[], testInfo?: TestInfo) {
  await test.step(`Adding ${data.length} Journal Lines`, async () => {
    const addRowButton = page.getByRole('button', { name: 'Add Row', exact: true });
    const tableRows = page.locator('[summary="Journal Lines"]');

    const initRows = await tableRows.getByRole('row').count();

    // If the same table is reloaded and filled again, the '_afrrk' attribute does not start from 0
    // The table initial '_selstate' will give the starting value and is offset from there
    const selState = await tableRows.getAttribute('_selstate');
    const countOffset = Number(selState?.split("'")[1]);

    for (let i = 0; i < data.length; i++) {
      // Locator for cell containing row number (which are not zero indexed)
      let numberCell = page.getByRole('cell', { name: (i+1).toString(), exact: true })

      // If there is not a new row ready to fill, click the Add Row button
      if (i >= initRows) {
        await addRowButton.click();
        await expect(async () => {
          await expect(numberCell).toBeVisible();
        }).toPass();
      }

      const currentRow = page.locator(`[_afrrk="${i+countOffset}"]`);

      await numberCell.click();
      await expect(async () => {
        await expect(currentRow.getByRole('textbox').first()).toBeVisible();
      }).toPass();

      await forms.fillTextboxByName(page, "Account", data[i]["Account"], { pageSection: currentRow });
      await forms.fillTextboxByName(page, "Entered Debit", data[i]["Entered Debit"], { pageSection: currentRow });
      await forms.fillTextboxByName(page, "Entered Credit", data[i]["Entered Credit"], { pageSection: currentRow });
      await forms.fillTextboxByName(page, "Description", data[i]["Description"], { pageSection: currentRow });
    }

    expect(await tableRows.getAttribute("_rowcount")).toEqual(data.length.toString());

    if (testInfo) {
      await testInfo.attach("Journal details filled", { body: await page.screenshot(), contentType: 'image/png' });
    }
  });
}
