// This test script ... (does what?)
// If reading data from Excel, ensure you have the required Excel file in the correct directory: excel-data-files/GL-create-manual-journal.xlsx
// Run using: npx playwright test tests/misc/GL-create-manual-journal.spec.ts
import { test, expect } from '@playwright/test';
import { ExcelService } from '../../src/services/excel.service';
import dotenv from 'dotenv';
import path from 'path';
import { addJournalLines } from '../util/journal';

dotenv.config({ path: path.resolve(__dirname, '../.env') });
let testLoopStartTime: Date = new Date(), testLoopEndTime: Date = new Date();
const authFile = path.join(__dirname, '../../.auth/auth-state.json');

const getDataFromExcelFile = false;         // Set to true to read data from Excel file
const generateResultsExcelFile = false;     // Set to true to write results to results excel file (filename *-results-YYYYMMDD-hhmmss.xlsx)
let setupData: any[] = ['https://eiiv-dev6.fa.us6.oraclecloud.com/fscmUI/faces/FuseWelcome', '14010.000000.1012000000.000000.00000.000000.00000.0000.00000.00000'];                  // Data items from the Setup Excel sheet
let loopData: any[][] = [['Entered Debit', 'Description Mandatory'],
 ['11.11', 'abc'], 
 ['22.22', 'def'], 
 ['33.33', 'ghi'], 
 ['44.44', 'jkl']];                // Data items from the Loop Excel sheet
const skipRatherThanSubmit = true;          // Set to true to skip submission and just take screenshots

test.use({ storageState: authFile });
test.describe.configure({ mode: 'serial' });  // Required to ensure tests run in expected order and that beforeAll & afterAll only run once

test.beforeAll(async ({ playwright }) => {
  // Load data from Excel file & prepare results file if required
  if (getDataFromExcelFile) ({ setupData, loopData } = ExcelService.readExcelData(__filename));
  if (generateResultsExcelFile) ExcelService.writeResultsHeaderRow(['ACCOUNTING PERIOD', 'BALANCING SEGMENT', 'REQUESTID', 'STARTTIME', 'ENDTIME', 'RESULT']);
});

test.afterAll(async ({ }) => {
  if (generateResultsExcelFile) ExcelService.save();
});

test.describe('Post Manual Journal', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to where the process begins
    await page.goto(setupData[0]);

    await page.getByRole('link', { name: 'General Accounting', exact: true }).click();
    await page.getByTitle('Journals').click();

    await page.getByRole('link', { name: 'Tasks' }).click();
    await page.getByRole('link', { name: 'Create Journal', exact: true }).click();
  });

  test(`Add Journal Lines`, async ({ page }, testInfo) => {
    const journalLinesTableRows = await page.locator('[summary="Journal Lines"]').getByRole('row');

    await expect(journalLinesTableRows).toHaveCount(2);

    await addJournalLines(journalLinesTableRows, setupData[1], page.getByRole('button', { name: 'Add Row', exact: true }), loopData);

    await testInfo.attach('Fill a JL Account', { body: await page.screenshot(), contentType: 'image/png' });
    await expect(journalLinesTableRows).toHaveCount(loopData.length - 1);
  });
});