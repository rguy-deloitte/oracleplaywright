import { test, expect } from '@playwright/test';
import { generateFakeJournalBatches, getRegexAnyDayDate } from './journal'
import * as navUtil from '../util/navigation';
import * as form from '../util/form';
import * as table from '../util/table';


// Configuration
const nBatches = 3; // Number of Journal Batches to submit in each test
const nJournals = 2;
const nLines = 32;
test.describe.configure({ mode: 'serial' });  // Required to ensure tests run in expected order and that beforeAll & afterAll only run once
test.setTimeout(5000 * nJournals * nLines + 30000); // This test is particularly long as there are many rows to be added, so needs a longer timeout depending on how many rows are added


// Generate a nested Record with multiple journal lines to each journal, and multiple journals to each batch
// Test data is outside of each test so that a second test can check that it is saved/completed/posted
let validSaveData = generateFakeJournalBatches(nBatches, nJournals, nLines);
let validCompleteData = generateFakeJournalBatches(nBatches, nJournals, nLines);
let validPostData = generateFakeJournalBatches(nBatches, nJournals, nLines);


// Begin Testing
test.describe('Save Manual Journal Entries', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    // Navigate to where the process begins
    await navUtil.navigateToHomePage(page);
    await navUtil.navigateToTile(page, 'General Accounting', testInfo);
    await navUtil.navigateToTileLink(page, 'Journals', testInfo);
  });

  for (let batchNo = 0; batchNo < validSaveData.length; batchNo++) {
    test(`Fill and Save Valid Journal Batch Data ${batchNo+1}`, async ({ page }, testInfo) => {
      const batchData = validSaveData[batchNo];
      const allJournalData: Record<string, any>[] = batchData['Journals'];
      delete batchData['Journals'];

      await test.step("Enter Journal Batch Details", async () => {
        await navUtil.navigateToTileSideLink(page, 'Create Journal', testInfo);
        const journalBatchSection = await navUtil.getSectionFromCollapse(page, "Collapse Journal Batch");

        // Complete all fields for Journal Batch
        await form.fillAllFieldsByName(page, journalBatchSection, batchData, {'Accounting Period': 'click'});

        await testInfo.attach("Batch details filled", { body: await page.screenshot(), contentType: 'image/png' });

        // Get a regex statement which will match a string of any day of a given month
        const regex = getRegexAnyDayDate(allJournalData[0]['Accounting Date']);

        // Make sure that the Accounting Date field is updated to match the month of the Accounting Period
        await expect(async () => {
          await expect(page.getByRole("textbox", { name: "Accounting Date", exact: true })).toHaveValue(regex);
        }).toPass();
      });

      for (let journalNo = 0; journalNo < allJournalData.length; journalNo++) {
        await test.step(`Add Journal: ${journalNo+1}`, async () => {
          // Add a new journal (ignore if already empty on first journal)
          if (journalNo != 0) {
            let awaitResponse = page.waitForResponse(/.*_adf.ctrl-state.*/);
            await page.getByRole('link', { name: 'Journal Actions' }).click();
            await page.getByText('Add', { exact: true }).click();
            await awaitResponse;
            await expect(page.locator('[summary="Journal Lines"]').getByRole('row')).toHaveCount(2);
          }  
          
          let journalData = allJournalData[journalNo];
          const journalSection = await navUtil.getSectionFromCollapse(page, "Collapse Journal");
          const journalLineData: Record<string, any>[] = journalData['Journal Lines'];
          delete journalData['Journal Lines'];

          // Complete all fields for Journal
          await form.fillAllFieldsByName(page, journalSection, journalData, {'Category': 'click', 'Ledger': 'click'});

          await testInfo.attach(`Journal ${journalNo} details filled`, { body: await page.screenshot(), contentType: 'image/png' });

          // Complete all lines in Journal Lines
          await test.step(`Add Journal Lines`, async () => {
            const journalLinesAddRowButton = page.getByRole('button', { name: 'Add Row', exact: true });
            const journalLinesTableRows = page.locator('[summary="Journal Lines"]').getByRole('row');

            await table.addNumberedTableRows(page, 
                                            journalLineData, 
                                            page.locator('[summary="Journal Lines"]'), 
                                            journalLinesAddRowButton);

            await testInfo.attach('Journal Lines Added', { body: await page.screenshot(), contentType: 'image/png' });
          });
        });
      }

      const waitOnLoad = page.waitForLoadState();
      await page.getByRole('button', { name: 'Save' }).click();
      await waitOnLoad;
      await page.waitForTimeout(1000);
      
    });
  }

  test('Attempt Fill with a Required Journal Field Missing', async ({ page }, testInfo) => {
    const batchData = generateFakeJournalBatches(1, nJournals, nLines)[0];
    // Blank the Category Field
    for (let i = 0; i < nJournals; i++) { batchData['Journals'][i]['Accounting Date'] = ""; }
    const allJournalData: Record<string, any>[] = batchData['Journals'];
    delete batchData['Journals'];

    await navUtil.navigateToTileSideLink(page, 'Create Journal', testInfo);

    await test.step("Enter Journal Batch Details", async () => {
      const journalBatchSection = await navUtil.getSectionFromCollapse(page, "Collapse Journal Batch");

      // Complete all fields for Journal Batch
      await form.fillAllFieldsByName(page, journalBatchSection, batchData, {'Accounting Period': 'click'});

      await testInfo.attach("Batch details filled", { body: await page.screenshot(), contentType: 'image/png' });

      // Get a regex statement which will match a string of any day of a given month
      const regex = getRegexAnyDayDate(allJournalData[0]['Accounting Date']);

      // Make sure that the Accounting Date field is updated to match the month of the Accounting Period
      await expect(async () => {
        await expect(page.getByRole("textbox", { name: "Accounting Date", exact: true })).toHaveValue(regex);
      }).toPass();
    });

    for (let journalNo = 0; journalNo < allJournalData.length; journalNo++) {
      await test.step(`Add Journal: ${journalNo}`, async () => {
        // Add a new journal (ignore if already empty on first journal)
        if (journalNo != 0) {
          let awaitResponse = page.waitForResponse(/.*_adf.ctrl-state.*/);
          await page.getByRole('link', { name: 'Journal Actions' }).click();
          await page.getByText('Add', { exact: true }).click();
          await awaitResponse;
        }  
        
        let journalData = allJournalData[journalNo];
        const journalSection = await navUtil.getSectionFromCollapse(page, "Collapse Journal");
        const journalLineData: Record<string, any>[] = journalData['Journal Lines'];
        delete journalData['Journal Lines'];

        // Complete all fields for Journal
        await form.fillAllFieldsByName(page, journalSection, journalData, {'Category': 'click', 'Ledger': 'click'});

        await testInfo.attach(`Journal ${journalNo} details filled`, { body: await page.screenshot(), contentType: 'image/png' });

        // Complete all lines in Journal Lines
        await test.step(`Add Journal Lines`, async () => {
          const journalLinesAddRowButton = page.getByRole('button', { name: 'Add Row', exact: true });
          const journalLinesTableRows = page.locator('[summary="Journal Lines"]').getByRole('row');
          await expect(journalLinesTableRows).toHaveCount(2);

          await table.addNumberedTableRows(page, 
                                          journalLineData, 
                                          page.locator('[summary="Journal Lines"]'), 
                                          journalLinesAddRowButton);

          await testInfo.attach('Journal Lines Added', { body: await page.screenshot(), contentType: 'image/png' });
        });
      });
    }

    const waitOnLoad = page.waitForLoadState();
    await page.getByRole('button', { name: 'Save' }).click();
    await waitOnLoad;
    await page.waitForTimeout(1000);
    
  });
});
