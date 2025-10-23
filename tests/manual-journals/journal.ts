import { faker } from '@faker-js/faker';
import { test, expect, Page, TestInfo } from "@playwright/test";
import * as forms from '../util/form'
import * as xlsx from 'xlsx';


export function loadBatchesFromExcelFile(excelFilePath: string) {
  // check if file exists
  const fs = require('fs');
  if (!fs.existsSync(excelFilePath)) {
    console.error(`Error: The Excel file ${excelFilePath} does not exist.`);
    process.exit(1);
  }
  
  const fullWorkbook = xlsx.readFile(excelFilePath);
  const fullSheet = fullWorkbook.Sheets[fullWorkbook.SheetNames[0]];

  if (fullSheet['!ref'] == undefined) { throw Error("Cannot get dimensions of spreadsheet")}

  // Load all rows as JSON but ignore title cell A1
  let sheetRange = xlsx.utils.decode_range(fullSheet['!ref']);
  sheetRange['s']['r']++;
  sheetRange['e']['r']--;

  const fullJSON: Record<string, string>[] = xlsx.utils.sheet_to_json(fullSheet, { range: sheetRange });

  let allBatches: Record <string, any>[] = [];

  let batchIds: Record<string, string> = {};

  fullJSON.forEach((row) => {
    batchIds[row['JOURNAL_BATCH_ID']] = "";
  });

  Object.keys(batchIds).forEach((batchId) => {
    try {
      let testBatchRows: Record<string, string>[] = [];

      fullJSON.forEach((row) => {
        if (row['JOURNAL_BATCH_ID'] == batchId) {
          testBatchRows.push(row);
        }
      });

      let batchData: Record<string, any> = { 'Journal Batch': batchId + " - TESTING" };

      const accountingPeriod = testBatchRows[0]['PERIOD_NAME'];
      let testJournalRows: Record<string, any[]> = {};   

      testBatchRows.forEach((row) => {
        if (accountingPeriod != row['PERIOD_NAME']) { throw Error(`Accounting period for batch ${batchId} is not consistent on all rows`)}
        if (testJournalRows[row['_02_SOURCE_JOURNAL_ID']] == undefined) {
          testJournalRows[row['_02_SOURCE_JOURNAL_ID']] = [row];
        } else {
          testJournalRows[row['_02_SOURCE_JOURNAL_ID']].push(row);
        }
      });

      batchData['Accounting Period'] = accountingPeriod;
      batchData['Description'] = "TESTING - Playwright generated batch"
      batchData['Journals'] = [];

      Object.keys(testJournalRows).forEach((key) => {
        let currentJournal: Record<string, any> = { 'Journal': key + " - TESTING" };
        currentJournal['Description'] = "TESTING - Playwright generated journal"
        currentJournal['Ledger'] = testJournalRows[key][0]['LEDGER_NAME'];
        currentJournal['Accounting Date'] = currentJournal['Conversion Date'] = testJournalRows[key][0]['ACCOUNTING_DATE'];
        currentJournal['Category'] = 'Manual';
        currentJournal['Conversion Rate Type'] = 'CP_AVG';
        currentJournal['Currency'] = testJournalRows[key][0]['ENTERED_CURRENCY'];

        currentJournal['Journal Lines'] = Array(testJournalRows[key].length);
        
        testJournalRows[key].forEach((row) => {
          if (currentJournal['Ledger'] != row['LEDGER_NAME']) { throw Error(`Ledger name is not consistent on all rows`)}
          if (currentJournal['Accounting Date'] != row['ACCOUNTING_DATE']) { throw Error(`Accounting date is not consistent on all rows`)}
          if (currentJournal['Currency'] != row['ENTERED_CURRENCY']) { throw Error(`Currency for batch is not consistent on all rows`)}

          let currentLine: Record<string, string> = {};
          currentLine['ENTITY'] = row['ENTITY'];

          // REMOVE WHEN PROBLEM FIXED
          if (currentLine['ENTITY'] == undefined) {
            console.log(currentLine);
          }
          // REMOVE WHEN PROBLEM FIXED

          currentLine['PROFIT UNIT'] = row['PROFIT_UNIT'];
          currentLine['ACCOUNT'] = row['ACCOUNT'];
          currentLine['DEPARTMENT'] = row['DEPARTMENT'];
          currentLine['LOCATION'] = row['LOCATION'];
          currentLine['BUSINESS TYPE'] = row['BUSINESS_TYPE'];
          currentLine['INTERCOMPANY'] = row['INTERCOMPANY'];
          currentLine['FUTURE1'] = '000000';
          currentLine['FUTURE2'] = '000000';

          if (row['ENTERED_DR']) { currentLine['Entered Debit'] = String(row['ENTERED_DR']); }
          if (row['ENTERED_CR']) { currentLine['Entered Credit'] = String(row['ENTERED_CR']); }
          if (row['ACCOUNTED_DR']) { currentLine['Accounted Debit'] = String(row['ACCOUNTED_DR']); }
          if (row['ACCOUNTED_CR']) { currentLine['Accounted Credit'] = String(row['ACCOUNTED_CR']); }
          currentLine['Description'] = row['DESCRIPTION'];

          const lineNumber = Number(row['_17_SOURCE_JOURNAL_LINE_NUMBER'])

          currentJournal['Journal Lines'][lineNumber-1] = currentLine;
        });

        batchData['Journals'].push(currentJournal);
      });

      allBatches.push(batchData);
    } catch (e) {
      console.log(`Skipping batch ${batchId} (${e})`)
    }
  });
    
  return allBatches;
}


// Generates fake data for a number of Journal Batches on the Create Journal page
export function generateFakeJournalBatch(nJournals: number, nLines: number) {  
  // Generates an array of Journal Batches using nBatches argument
  let newBatch: Record<string, any> = {};

  // Random text for batch name and description
  newBatch['Journal Batch'] = faker.word.noun();
  newBatch['Description'] = faker.lorem.sentence({min: 4, max: 12});

  // Accounting Period is a random month from the last 2 years
  const accountingDate = faker.date.between({ from: "2026-08-01", to: "2027-03-01" });

  // Pass to accounting period in the form Dec-23
  newBatch['Accounting Period'] = `${accountingDate.toLocaleString('default', { month: 'short' }).slice(0, 3)}-${accountingDate.getFullYear().toString().slice(-2)}`;

  // Same ledger for all journals
  const ledger = faker.helpers.arrayElement(['US ACTUALS USD Apr']);

  // Generate a number of journals according to nJournals argument
  newBatch['Journals'] = [];
  for (let j = 0; j < nJournals; j++) {
    newBatch['Journals'].push(generateFakeJournal(nLines, accountingDate.getFullYear(), accountingDate.getMonth() + 1, ledger));
  }

  return newBatch;
}

// Generates fake data that can be entered into the Journal and Journal Lines section of the Create Journal page
// month argument should be 1 indexed, so 2 represents February
function generateFakeJournal(nLines: number, year: number, month: number, ledger: string) {
  let newJournal: Record<string, string|Record<string, string>[]> = {};
  
  // Random text for journal name and description
  newJournal['Journal'] = faker.word.noun();
  newJournal['Description'] = faker.lorem.sentence({min: 4, max: 12});

  // Set ledger from journal batch
  newJournal['Ledger'] = ledger;

  // A random day of the month, for the given accounting period (form requires it be the same month as the Batch data)
  // Creating a new Date assumes zero indexing, so using 1-12 system will give the next month, 
  // and the 0th day will be the last day of the month before. So yields the last day of 'month'
  const dayString = faker.number.int({min: 1, max: new Date(year, month, 0).getDate()}).toString();
  const monthString = month.toString();
  const yearString = year.toString().slice(-2);
  newJournal['Accounting Date'] = [monthString, dayString, yearString].join('/');

  // Select from valid options for category and currency
  newJournal['Category'] = faker.helpers.arrayElement(['Accrual']);
  newJournal['Currency'] = faker.helpers.arrayElement(['US Dollar']);
  
  // Generate nLines worth of Journal Lines to add
  newJournal['Journal Lines'] = generateFakeJournalLines(nLines);

  return newJournal;
}

// Generates fake data that can be entered into a Journal Line in the Create Journal page
function generateFakeJournalLines(nLines: number) {
  let nPairs = Math.round(nLines / 2);
  
  let allLines = [];
  for (let i = 0; i < nPairs; i++) {
    let newDebitLine: Record<string, string> = {};
    let newCreditLine: Record<string, string> = {};

    // Account 100000.00000000.10001000.000000.000000.000000.000000.000000.000000

    newCreditLine['ENTITY'] = newDebitLine['ENTITY'] = '100000';
    newCreditLine['PROFIT UNIT'] = newDebitLine['PROFIT UNIT'] = '00000000';
    newCreditLine['ACCOUNT'] = newDebitLine['ACCOUNT'] = '10001000';
    newCreditLine['DEPARTMENT'] = newDebitLine['DEPARTMENT'] = '000000';
    newCreditLine['LOCATION'] = newDebitLine['LOCATION'] = '000000';
    newCreditLine['BUSINESS TYPE'] = newDebitLine['BUSINESS TYPE'] = '000000';
    newCreditLine['INTERCOMPANY'] = newDebitLine['INTERCOMPANY'] = '000000';
    newCreditLine['FUTURE1'] = newDebitLine['FUTURE1'] = '000000';
    newCreditLine['FUTURE2'] = newDebitLine['FUTURE2'] = '000000';
    
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
  await test.step("Enter Journal Batch Details", async () => {
    const journalBatchSection = await forms.getSectionFromCollapse(page, "Collapse Journal Batch");

    await forms.clickTextboxByName(page, "Accounting Period", data["Accounting Period"], { pageSection: journalBatchSection });
    await forms.fillTextboxByName(page, "Journal Batch", data["Journal Batch"], { pageSection: journalBatchSection });
    await forms.fillTextboxByName(page, "Description", data["Description"], { pageSection: journalBatchSection });
    await checkPageForErrors(page, testInfo);

    if (testInfo) {
      await testInfo.attach("Journal Batch details filled", { body: await journalBatchSection.screenshot(), contentType: 'image/png' });
    }
  });
}

export async function fillJournalDetails(page: Page, data: Record<string, any>, testInfo?: TestInfo) {
  await test.step(`Add Journal Details`, async () => {
    const journalSection = await forms.getSectionFromCollapse(page, "Collapse Journal");

    await forms.fillTextboxByName(page, "Journal", data["Journal"], { pageSection: journalSection });
    await forms.fillTextboxByName(page, "Description", data["Description"], { pageSection: journalSection, errorIfNoField: false });
    
    await forms.clickTextboxByName(page, "Ledger", data["Ledger"], { pageSection: journalSection, errorIfNoField: false });

    await forms.fillTextboxByName(page, "Accounting Date", data["Accounting Date"], { pageSection: journalSection });
    await forms.waitForStablePage(page);
    await forms.clickTextboxByName(page, "Category", data["Category"], { pageSection: journalSection });
    await forms.waitForStablePage(page);

    // await forms.clickTextboxByName(page, "Currency", data["Currency"], { pageSection: journalSection });
    await forms.fieldByName(page, "Currency", data["Currency"], "click", { fieldType: "textbox", valueCheck: "value-wild", pageSection: journalSection })

    await forms.fillTextboxByName(page, "Conversion Date", data["Conversion Date"], { pageSection: journalSection, errorIfNoField: false });
    await forms.clickTextboxByName(page, "Conversion Rate Type", data["Conversion Rate Type"], { pageSection: journalSection, errorIfNoField: false });
    await forms.fillTextboxByName(page, "Conversion Rate", data["Conversion Rate"], { pageSection: journalSection, errorIfNoField: false });
    await checkPageForErrors(page, testInfo);

    if (testInfo) {
      await testInfo.attach("Journal details filled", { body: await journalSection.screenshot(), contentType: 'image/png' });
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

      const accountNumber = [data[i]['ENTITY'],
                             data[i]['PROFIT UNIT'],
                             data[i]['ACCOUNT'],
                             data[i]['DEPARTMENT'],
                             data[i]['LOCATION'],
                             data[i]['BUSINESS TYPE'],
                             data[i]['INTERCOMPANY'],
                             data[i]['FUTURE1'],
                             data[i]['FUTURE2']].join(".");

      let waitStable = forms.waitForStablePage(page);
      await forms.fillTextboxByName(page, "Account", accountNumber, { pageSection: currentRow });
      await forms.fillTextboxByName(page, "Entered Debit", data[i]["Entered Debit"], { pageSection: currentRow, errorIfNoField: false });
      await forms.fillTextboxByName(page, "Entered Credit", data[i]["Entered Credit"], { pageSection: currentRow, errorIfNoField: false });
      await forms.fillTextboxByName(page, "Accounted Debit", data[i]["Accounted Debit"], { pageSection: currentRow, errorIfNoField: false });
      await forms.fillTextboxByName(page, "Accounted Credit", data[i]["Accounted Credit"], { pageSection: currentRow, errorIfNoField: false });
      await forms.fillTextboxByName(page, "Description", data[i]["Description"], { pageSection: currentRow, errorIfNoField: false });
      await waitStable;
    }

    expect(await tableRows.getAttribute("_rowcount")).toEqual(data.length.toString());

    await checkPageForErrors(page, testInfo);

    if (testInfo) {
      await testInfo.attach("Journal line details filled", { body: await page.screenshot(), contentType: 'image/png' });
    }
  });
}

export async function addNewJournal(page: Page, testInfo?: TestInfo) {
  await test.step(`Adding new journal`, async () => {
    let waitStable = forms.waitForStablePage(page);
    await page.getByRole('link', { name: 'Journal Actions' }).click();
    await page.getByText('Add', { exact: true }).click();
    await waitStable;

    await checkPageForErrors(page, testInfo);
    while (true) {
      try {
        await expect(page.getByRole("textbox", { name: "Journal", exact: true }).getAttribute("value")).resolves.toBeNull();
        break;
      } catch (e) {await page.waitForTimeout(200);}
    }

    if (testInfo) {
      await testInfo.attach(`Journal added`, { body: await page.screenshot(), contentType: 'image/png' });
    }
  });
}

export async function saveJournalBatch(page: Page, testInfo?: TestInfo) {
  await test.step("Save journal batch", async () => {
    while (true) {
      try {
        let waitStable = forms.waitForStablePage(page);
        await page.getByRole('button', { name: "Save", exact: true }).click();
        await waitStable;

        await checkPageForErrors(page, testInfo);
        await checkPageForUnbalancedPopup(page, testInfo);

        await expect(page.getByText("Last Saved", { exact: true })).toBeVisible();
        break;
      } catch (e) {
      }
    }

    await forms.waitForStablePage(page);
    await checkPageForErrors(page, testInfo);
    await checkPageForUnbalancedPopup(page, testInfo);

    if (testInfo) {
      await testInfo.attach(`Journal batch saved`, { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
    }
  });
}

export async function postJournalBatch(page: Page, testInfo: TestInfo) {
    await test.step("Post journal batch", async () => {
      while (true) {
        try {
          let waitStable = forms.waitForStablePage(page);
          await page.getByRole('button', { name: "Post", exact: true }).click();
          await waitStable;

          await checkPageForErrors(page, testInfo);
          await checkPageForUnbalancedPopup(page, testInfo);

          const popupText = page.getByText("The journal requires approval before it can be posted, and has been forwarded to the approver.");

          await expect(popupText).toBeVisible();

          if (testInfo) {
            await testInfo.attach(`Journal batch posted`, { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
          }

          await page.getByRole("button", { name: "OK", exact: true }).click();
          break;
        } catch (e) {
        }
      }
    });
}

export async function cancelJournalBatch(page: Page, testInfo?: TestInfo) {
  await forms.waitForStablePage(page);
  await checkPageForUnbalancedPopup(page, testInfo);
  
  await test.step("Cancel journal batch", async () => {
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(page.locator("h2", { hasText: "Journals" })).toBeVisible();
  });
}

async function checkPageForErrors(page: Page, testInfo?: TestInfo) {
  const errorFlag = page.locator('td.x1mk', { hasText: 'Error'});

  if (await errorFlag.isVisible()) {
    const errorBox = errorFlag.locator('xpath=ancestor::div[1]');
    const errorText = await errorBox.allTextContents();

    if (testInfo) {
      await testInfo.attach(`Failed to create journal (${errorText.join("/n")})`, { body: await errorBox.screenshot(), contentType: 'image/png' });
    }
    throw Error(`Failed to create journal (${errorText.join("/n")})`)
  } 
}

async function checkPageForUnbalancedPopup(page: Page, testInfo: TestInfo | undefined) {
  const popupText = page.getByText("The total accounted debit and credit for this journal batch aren't equal. Do you want to continue?");

  if (await popupText.isVisible()) {
    const popupBox = popupText.locator('xpath=ancestor::div[1]');

    if (testInfo) {
      await testInfo.attach(`Failed to create journal as credit and debit don't balance`, { body: await popupBox.screenshot(), contentType: 'image/png' });
    }
    throw Error(`Failed to create journal as credit and debit don't balance`)
  }
}

export async function checkJournalsForSavedBatch(page: Page, data: Record<string, any>, testInfo?: TestInfo) {
  await test.step("Checking that journal batch saved", async () => {
    let incompleteLink = page.getByRole('link', { name: 'Incomplete', exact: true });
    await incompleteLink.click();
    const regex = new RegExp(`.*p_AFSelected.*`);
    await expect(incompleteLink).toHaveAttribute("class", regex);
    const batchLink = page.getByRole('link', { name: data['Journal Batch'], exact: true });

    while (true) {
      try {
        let waitStable = forms.waitForStablePage(page);
        await page.getByRole('img', { name: 'Refresh', exact: true }).click();
        await waitStable;

        expect(batchLink).toBeVisible();
        break;
      } catch (e) {
      }
    }

    if (testInfo) {
      await testInfo.attach(`Incomplete journal listed`, { body: await page.screenshot(), contentType: 'image/png' });
    }

    await page.getByRole('link', { name: data['Journal Batch'], exact: true }).click();
    
    await expect(await forms.getSectionFromCollapse(page, `Collapse Journal Batch: ${data['Journal Batch']}`)).toBeVisible();
    
    const journalDropdown = page.getByRole('combobox', { name: 'Select Journal' });
    const journalList = await journalDropdown.locator('option').allTextContents();

    if (journalList.length != data['Journals'].length) {
      throw Error("Not all journals were saved correctly")
    }

    if (testInfo) {
      await testInfo.attach(`Saved journal batch recalled`, { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
    }
  });
}

export async function deleteCurrentJournalBatch(page: Page, testInfo?: TestInfo) {
  await test.step("Deleting journal batch", async () => {
    let waitStable = forms.waitForStablePage(page);
    await page.getByRole('link', { name: 'Batch Actions' }).click();
    await waitStable;
    await page.locator('[id$="deleteBatch"]').click();
    await forms.waitForStablePage(page);

    const popupText = page.getByText("The journal batch will be deleted. Do you want to continue?");
    expect(popupText).toBeVisible();

    await page.getByRole("button", { name: "Yes", exact: true }).click();
    await expect(page.locator("h2", { hasText: "Journals" })).toBeVisible();
    await page.getByRole('img', { name: 'Refresh', exact: true }).click();
    await forms.waitForStablePage(page);

    if (testInfo) {
      await testInfo.attach(`Journal batch successfully deleted`, { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
    }
  });
}
