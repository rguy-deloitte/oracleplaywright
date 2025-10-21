import { faker } from '@faker-js/faker';
import { test, expect, Page, TestInfo } from "@playwright/test";
import * as forms from '../util/form'


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

    await forms.fillTextboxByName(page, "Journal Batch", data["Journal Batch"], { pageSection: journalBatchSection });
    await forms.fillTextboxByName(page, "Description", data["Description"], { pageSection: journalBatchSection });
    await forms.clickTextboxByName(page, "Accounting Period", data["Accounting Period"], { pageSection: journalBatchSection });

    await checkPageForErrors(page, testInfo);

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
    
    const ledgerBox = journalBatchSection.getByRole('textbox', { name: "Ledger" });
    if (await ledgerBox.isVisible()) {
      await forms.clickTextboxByName(page, "Ledger", data["Ledger"], { pageSection: journalBatchSection });
    }

    await forms.fillTextboxByName(page, "Accounting Date", data["Accounting Date"], { pageSection: journalBatchSection });
    await forms.waitForStablePage(page);
    await forms.clickTextboxByName(page, "Category", data["Category"], { pageSection: journalBatchSection });
    await forms.clickTextboxByName(page, "Currency", data["Currency"], { pageSection: journalBatchSection });
    await forms.clickTextboxByName(page, "Conversion Date", data["Conversion Date"], { pageSection: journalBatchSection });
    await forms.clickTextboxByName(page, "Conversion Rate Type", data["Conversion Rate Type"], { pageSection: journalBatchSection });
    await forms.fillTextboxByName(page, "Conversion Rate", data["Conversion Rate"], { pageSection: journalBatchSection });

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
      await forms.fillTextboxByName(page, "Description", data[i]["Description"], { pageSection: currentRow });
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
  let waitStable = forms.waitForStablePage(page);
  await page.getByRole('link', { name: 'Journal Actions' }).click();
  await page.getByText('Add', { exact: true }).click();
  await waitStable;

  await checkPageForErrors(page, testInfo);

  if (testInfo) {
    await testInfo.attach(`Journal added`, { body: await page.screenshot(), contentType: 'image/png' });
  }
}

export async function saveJournalBatch(page: Page, testInfo?: TestInfo) {
  await test.step("Save journal batch", async () => {
    while (true) {
      try {
        let waitStable = forms.waitForStablePage(page);
        await page.getByRole('button', { name: "Save", exact: true }).click();
        await waitStable;

        await checkPageForErrors(page, testInfo);
        await checkPageForPopup(page, testInfo);

        await expect(page.getByText("Last Saved", { exact: true })).toBeVisible();
        break;
      } catch (e) {
      }
    }

    await forms.waitForStablePage(page);
    await checkPageForErrors(page, testInfo);
    await checkPageForPopup(page, testInfo);

    if (testInfo) {
      await testInfo.attach(`Journal batch saved`, { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
    }
  });
}

export async function cancelJournalBatch(page: Page, testInfo?: TestInfo) {
  await forms.waitForStablePage(page);
  await checkPageForPopup(page, testInfo);
  
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

async function checkPageForPopup(page: Page, testInfo: TestInfo | undefined) {
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
    await page.getByRole('link', { name: 'Incomplete', exact: true }).click();
    await forms.waitForStablePage(page);
    await page.getByRole('img', { name: 'Refresh', exact: true }).click();
    await forms.waitForStablePage(page);

    const batchLink = page.getByRole('link', { name: data['Journal Batch'], exact: true });

    expect(batchLink).toBeVisible();

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

    for (let i = 0; i < data['Journals'].length; i++) {
      if (!journalList.includes(data['Journals'][i]['Journal'])) {
        throw Error(`Journal ${data['Journals'][i]['Journal']} was not saved correctly`)
      }
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