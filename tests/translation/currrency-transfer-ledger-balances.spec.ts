// Ensure you have the required Excel file in the correct directory: excel-data-files/batch-run-automate.xlsx
// Run using: npx playwright test tests/translation/currrency-transfer-ledger-balances.spec.ts --ui
import { test, expect, type Page, APIRequestContext } from '@playwright/test';
import { ExcelService } from '../../src/services/excel.service';
import dotenv from 'dotenv';
import path from 'path';
import * as form from '../util/form';
import * as cp from './currency'

dotenv.config({ path: path.resolve(__dirname, '../.env'), quiet: true });
// *** Note *** Login handled in auth.setup.ts and requires playwright.config.ts -> 
test.describe.configure({ mode: 'serial' });  // Required to ensure tests run in expected order and that beforeAll & afterAll only run once

let testLoopStartTime: Date = new Date(), testLoopEndTime: Date = new Date();
let apiContext: APIRequestContext;
const getDataFromExcelFile = true;      // Set to true to read data from Excel file
const generateResultsExcelFile = true;  // Set to true to write results to results excel file (filename *-results-YYYYMMDD-hhmmss.xlsx)
let setupData: any[] = [];              // Data items from the Setup Excel sheet
let loopData: any[][] = [];             // Data items from the Loop Excel sheet
const skipRatherThanSubmit = false;     // Set to true to skip submission and just take screenshots
if (getDataFromExcelFile) ({ setupData, loopData } = ExcelService.readExcelData(__filename));
if (generateResultsExcelFile) ExcelService.writeResultsHeaderRow(['Source Ledger', 'Target Ledger',	'Source Ledger Period', 'Target Ledger Period', 'REQUESTID', 'STARTTIME', 'ENDTIME', 'RESULT']);
let page: Page;

test.beforeAll(async ({ browser, playwright }) => {
  page = await browser.newPage();

  // Setup Oracle API. See: https://docs.oracle.com/en/cloud/saas/financials/25c/farfa/Quick_Start.html
  apiContext = await playwright.request.newContext({
    baseURL: process.env.APIBASEURL,
    extraHTTPHeaders: {
        'Authorization': `Basic ${process.env.URLCREDENTIALS}`,
        'Content-Type': 'application/vnd.oracle.adf.resourcecollection+json',
    },
  });
});

test.afterAll(async () => {
  await apiContext.dispose();
  await page.close();
  if (generateResultsExcelFile) ExcelService.save();
});

test.describe('Transfer Ledger Balances', () => {
  test.beforeEach(async ({ }, testInfo) => {
    cp.navigate(page, testInfo, setupData);
  });

  let index = 0;
  loopData.forEach((currentRow, i) => {
    test(`${i+2} - Source Ledger Period: ${currentRow[0]} - ${currentRow[1]}: ${currentRow[2].trim()}-${currentRow[3]}`, async ({ }, testInfo) => {
      // test.setTimeout(1500000);
      await cp.transferLedgerBalances(page, testInfo, setupData, currentRow, index);

      if (skipRatherThanSubmit) {
        await testInfo.attach(`${currentRow[0]} Final Screen (cancelled)...`, { body: await page.screenshot(), contentType: 'image/png' });
        await form.buttonClick(page, 'Cancel');
      } else {
        testLoopStartTime = new Date();
        await form.buttonClick(page, 'Submit');
        let processResults = await cp.confirmProcessCompletion(page, testInfo, apiContext, setupData, currentRow, testLoopStartTime, testLoopEndTime);
        if (generateResultsExcelFile) ExcelService.writeResultsResultRow([processResults?.rowData[0], processResults?.rowData[1], processResults?.rowData[2], processResults?.rowData[3], processResults?.processNumber, processResults?.testLoopStartTime, processResults?.testLoopEndTime, processResults?.requestStatus]);
        await expect(processResults?.requestStatus).toMatch(/SUCCEEDED|WARNING/);
      }
    });
  });
});