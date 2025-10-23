import { test } from '@playwright/test';
import * as navigation from '../util/navigation';
import * as journals from './journal';


test.describe.configure({ mode: 'serial' });  // Required to ensure tests run in expected order and that beforeAll & afterAll only run once

test.describe('Save Manual Journals with Fake Data', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await navigation.navigateToHomePage(page, testInfo);
    await navigation.navigateToTile(page, 'General Accounting', testInfo);
    await navigation.navigateToTileLink(page, 'Journals', testInfo);
    await navigation.setDataAccessSet(page, 'Global May Apr Ledger Set', testInfo)
    await navigation.navigateToTileSideLink(page, 'Create Journal', testInfo);
  });

  const nRepeats = 1;
  const nJournals = 1;

  for (let batchNo = 0; batchNo < nRepeats; batchNo++) {
    let testName = "Save journal batch with 10 lines";
    let repeat = "";
    if (nRepeats > 1) { repeat = ` (Repeat ${batchNo+1}/${nRepeats})`; }

    test(testName + repeat, async ({ page }, testInfo) => {
      const batchData = journals.generateFakeJournalBatch(nJournals, 10);
      test.setTimeout(1200000);
      
      await journals.fillJournalBatchDetails(page, batchData, testInfo);

      const journalData = batchData['Journals'];

      for (let journalNo = 0; journalNo < journalData.length; journalNo++) {
        await journals.fillJournalDetails(page, journalData[journalNo], testInfo);

        await journals.addJournalLineDetails(page, journalData[journalNo]['Journal Lines'], testInfo);

        if (journalNo != journalData.length-1) {
          await journals.addNewJournal(page, testInfo);
        }
      };

      await journals.saveJournalBatch(page, testInfo);
      await journals.cancelJournalBatch(page, testInfo);

      await journals.checkJournalsForSavedBatch(page, batchData, testInfo);

      await journals.deleteCurrentJournalBatch(page, testInfo);
    });
  };

  for (let batchNo = 0; batchNo < nRepeats; batchNo++) {
    let testName = "Save journal batch with 100 lines";
    let repeat = "";
    if (nRepeats > 1) { repeat = ` (Repeat ${batchNo+1}/${nRepeats})`; }

    test(testName + repeat, async ({ page }, testInfo) => {
      const batchData = journals.generateFakeJournalBatch(nJournals, 100);
      test.setTimeout(9000000);
            
      await journals.fillJournalBatchDetails(page, batchData, testInfo);

      const journalData = batchData['Journals'];

      for (let journalNo = 0; journalNo < journalData.length; journalNo++) {
        await journals.fillJournalDetails(page, journalData[journalNo], testInfo);

        await journals.addJournalLineDetails(page, journalData[journalNo]['Journal Lines'], testInfo);

        if (journalNo != journalData.length-1) {
          await journals.addNewJournal(page, testInfo);
        }
      };

      await journals.saveJournalBatch(page, testInfo);
      await journals.cancelJournalBatch(page, testInfo);

      await journals.checkJournalsForSavedBatch(page, batchData, testInfo);

      await journals.deleteCurrentJournalBatch(page, testInfo);
    });
  };

  test("Save journal with invalid accounting date", async ({ page }, testInfo) => {
      const batchData = journals.generateFakeJournalBatch(1, 10);
      batchData['Journals'][0]['Accounting Date'] = "3/10/35"
      test.setTimeout(1200000);
            
      await journals.fillJournalBatchDetails(page, batchData, testInfo);

      const journalData = batchData['Journals'];

      for (let journalNo = 0; journalNo < journalData.length; journalNo++) {
        await journals.fillJournalDetails(page, journalData[journalNo], testInfo);

        await journals.addJournalLineDetails(page, journalData[journalNo]['Journal Lines'], testInfo);

        if (journalNo != journalData.length-1) {
          await journals.addNewJournal(page, testInfo);
        }
      };

      await journals.saveJournalBatch(page, testInfo);
      await journals.cancelJournalBatch(page, testInfo);

      await journals.checkJournalsForSavedBatch(page, batchData, testInfo);

      await journals.deleteCurrentJournalBatch(page, testInfo);
    });

  test("Save journal with unbalanced credit", async ({ page }, testInfo) => {
      const batchData = journals.generateFakeJournalBatch(1, 10);
      batchData['Journals'][0]['Journal Lines'].pop();
      test.setTimeout(1200000);
            
      await journals.fillJournalBatchDetails(page, batchData, testInfo);

      const journalData = batchData['Journals'];

      for (let journalNo = 0; journalNo < journalData.length; journalNo++) {
        await journals.fillJournalDetails(page, journalData[journalNo], testInfo);

        await journals.addJournalLineDetails(page, journalData[journalNo]['Journal Lines'], testInfo);

        if (journalNo != journalData.length-1) {
          await journals.addNewJournal(page, testInfo);
        }
      };

      await journals.saveJournalBatch(page, testInfo);
      await journals.cancelJournalBatch(page, testInfo);

      await journals.checkJournalsForSavedBatch(page, batchData, testInfo);

      await journals.deleteCurrentJournalBatch(page, testInfo);
    });

  for (let batchNo = 0; batchNo < nRepeats; batchNo++) {
    let testName = "Save statistical journal";
    let repeat = "";
    if (nRepeats > 1) { repeat = ` (Repeat ${batchNo+1}/${nRepeats})`; }

    test(testName + repeat, async ({ page }, testInfo) => {
      const batchData = journals.generateFakeJournalBatch(nJournals, 10);

      test.setTimeout(1200000);
      
      await journals.fillJournalBatchDetails(page, batchData, testInfo);

      const journalData = batchData['Journals'];

      for (let journalNo = 0; journalNo < journalData.length; journalNo++) {
        // Change currency and add conversion rate
        journalData[journalNo]['Currency'] = 'Statistical';

        await journals.fillJournalDetails(page, journalData[journalNo], testInfo);

        await journals.addJournalLineDetails(page, journalData[journalNo]['Journal Lines'], testInfo);

        if (journalNo != journalData.length-1) {
          await journals.addNewJournal(page, testInfo);
        }
      };

      await journals.saveJournalBatch(page, testInfo);
      await journals.cancelJournalBatch(page, testInfo);

      await journals.checkJournalsForSavedBatch(page, batchData, testInfo);

      await journals.deleteCurrentJournalBatch(page, testInfo);
    });
  };

  for (let batchNo = 0; batchNo < nRepeats; batchNo++) {
    let testName = "Save journal batch in different currency";
    let repeat = "";
    if (nRepeats > 1) { repeat = ` (Repeat ${batchNo+1}/${nRepeats})`; }

    test(testName + repeat, async ({ page }, testInfo) => {
      const batchData = journals.generateFakeJournalBatch(nJournals, 10);

      test.setTimeout(1200000);
      
      await journals.fillJournalBatchDetails(page, batchData, testInfo);

      const journalData = batchData['Journals'];

      for (let journalNo = 0; journalNo < journalData.length; journalNo++) {
        // Change currency and add conversion rate
        journalData[journalNo]['Currency'] = 'Euro';
        journalData[journalNo]['Conversion Rate Type'] = 'User';
        journalData[journalNo]['Conversion Rate'] = '1.23';

        await journals.fillJournalDetails(page, journalData[journalNo], testInfo);

        await journals.addJournalLineDetails(page, journalData[journalNo]['Journal Lines'], testInfo);

        if (journalNo != journalData.length-1) {
          await journals.addNewJournal(page, testInfo);
        }
      };

      await journals.saveJournalBatch(page, testInfo);
      await journals.cancelJournalBatch(page, testInfo);

      await journals.checkJournalsForSavedBatch(page, batchData, testInfo);

      await journals.deleteCurrentJournalBatch(page, testInfo);
    });
  };
});