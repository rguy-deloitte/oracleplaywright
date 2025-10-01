import { test, expect } from '@playwright/test';
import path from 'path';
import { generateFakeJournalBatches, getRegexAnyDayDate } from './journal'
import * as navUtil from '../util/navigation';
import * as form from '../util/form';
import * as table from '../util/table';

// Configuration
const nBatches = 5; // Number of Journal Batches to submit in each test
const nJournals = 3;
const maxLines = 100;
const saveOrCancel = 'Save' // Set to 'Save', 'Complete' or 'Post' to perform that action once all fields are filled

const authFile = path.join(__dirname, '../.auth/auth-state.json');
test.use({ storageState: authFile });
test.describe.configure({ mode: 'serial' });  // Required to ensure tests run in expected order and that beforeAll & afterAll only run once
test.setTimeout(5000 * nJournals * maxLines); // This test is particularly long as there are many rows to be added, so needs a longer timeout depending on how many rows are added

test.describe('Fill Fields for Manual Journal Entries', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    // Navigate to where the process begins
    await navUtil.navigateToHomePage(page);
    await navUtil.navigateToTile(page, 'General Accounting', testInfo);
    await navUtil.navigateToTileLink(page, 'Journals', testInfo);
  });

  // Generates a nested Record with multiple journal lines to each journal, and multiple journals to each batch
  let testData = generateFakeJournalBatches(nBatches, nJournals, maxLines); 

  for (let batchNo = 0; batchNo < testData.length; batchNo++) {
    test(`Fill and ${saveOrCancel} Batch: ${batchNo}`, async ({ page }, testInfo) => {
      await navUtil.navigateToTileSideLink(page, 'Create Journal', testInfo);
      const journalBatchSection = await navUtil.getSectionFromCollapse(page, "Collapse Journal Batch");

      const batchData = testData[batchNo];
      const allJournalData: Record<string, any>[] = batchData['Journals'];
      delete batchData['Journals'];

      // Complete all fields for Journal Batch
      await form.fillAllFieldsByName(page, journalBatchSection, batchData, {'Accounting Period': 'click'});

      await testInfo.attach("Batch details filled", { body: await page.screenshot(), contentType: 'image/png' });

      // Get a regex statement which will match a string of any day of a given month
      const regex = getRegexAnyDayDate(allJournalData[0]['Accounting Date']);

      // Make sure that the Accounting Date field is updated to match the month of the Accounting Period
      await expect(async () => {
        await expect(page.getByRole("textbox", { name: "Accounting Date", exact: true })).toHaveValue(regex);
      }).toPass();

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
      await page.getByRole('button', { name: saveOrCancel }).click();
      await waitOnLoad;
      await page.waitForTimeout(1000);
      
    });
  }
});
