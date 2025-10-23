import { test } from '@playwright/test';
import * as navigation from '../util/navigation';
import { navigateToTileSideLink } from '../util/navigation';
import * as journals from './journal';
import * as path from 'path';


// Configuration
const excelFilePath = path.join(__dirname, '..', '..', 'excel-data-files', 'save-excel-batch.xlsx');
test.describe.configure({ mode: 'serial' });  


test.describe('Save Manual Journals with Data Loaded from Excel File', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await navigation.navigateToHomePage(page, testInfo);
    await navigation.navigateToTile(page, 'General Accounting', testInfo);
    await navigation.navigateToTileLink(page, 'Journals', testInfo);
    await navigation.setDataAccessSet(page, 'Global May Apr Ledger Set', testInfo)
    await navigateToTileSideLink(page, 'Create Journal', testInfo);
  });

  const allBatches = journals.loadBatchesFromExcelFile(excelFilePath);

  allBatches.forEach((batchData) => {
    test(`Journal Batch ${batchData['Journal Batch']}`, async ({ page }, testInfo) => {
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
  });
  
});