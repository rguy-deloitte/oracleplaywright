import { test } from '@playwright/test';
import * as navigation from '../util/navigation';
import { fillJournalBatchDetails, generateFakeJournalBatch, fillJournalDetails, addJournalLineDetails } from './journal';


test.describe.configure({ mode: 'serial' });  // Required to ensure tests run in expected order and that beforeAll & afterAll only run once

test.describe('Save Manual Journal Entries', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    // Navigate to Journals page
    await navigation.navigateToHomePage(page, testInfo);
    await navigation.navigateToTile(page, 'General Accounting', testInfo);
    await navigation.navigateToTileLink(page, 'Journals', testInfo);
  });

  const nRepeats = 1;
  const nJournals = 1;

  for (let batchNo = 0; batchNo < nRepeats; batchNo++) {
    let testName = "Save fake journal batch with 10 lines";
    if (nRepeats > 1) { testName += ` (Repeat ${batchNo+1}/${nRepeats})`; }

    test(testName, async ({ page }, testInfo) => {
      const batchData = generateFakeJournalBatch(nJournals, 10);
      test.setTimeout(1200000);
      
      await fillJournalBatchDetails(page, batchData, testInfo);

      const journalData = batchData['Journals'];

      for (let journalNo = 0; journalNo < journalData.length; journalNo++) {
        await fillJournalDetails(page, journalData[journalNo], testInfo);

        await addJournalLineDetails(page, journalData[journalNo]['Journal Lines'], testInfo);

        // Press Add Journal button and wait for clearing
      };
    });
  };

  for (let batchNo = 0; batchNo < nRepeats; batchNo++) {
    let testName = "Save fake journal batch with 100 lines";
    if (nRepeats > 1) { testName += ` (Repeat ${batchNo+1}/${nRepeats})`; }

    test(testName, async ({ page }, testInfo) => {
      const batchData = generateFakeJournalBatch(nJournals, 100);
      test.setTimeout(9000000);
      
      await fillJournalBatchDetails(page, batchData, testInfo);

      const journalData = batchData['Journals'];

      for (let journalNo = 0; journalNo < journalData.length; journalNo++) {
        await fillJournalDetails(page, journalData[journalNo], testInfo);

        await addJournalLineDetails(page, journalData[journalNo]['Journal Lines'], testInfo);

        // Press Add Journal button and wait for clearing
      };
    });
  };
});