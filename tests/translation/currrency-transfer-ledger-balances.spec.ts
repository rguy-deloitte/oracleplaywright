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
const appendResultsToExcelSheet = false; // Set to true to write results to results excel file (filename *-results-YYYYMMDD-hhmmss.xlsx)
const skipRatherThanSubmit = true;     // Set to true to skip submission and just take screenshots

let setupData: Record<string, any> = {};   // Data items from the Setup Excel sheet as a Record
let loopData: Record<string, any>[] = [];  // Data items from the Loop Excel sheet as a Record

if (getDataFromExcelFile) ({ setupData, loopData } = ExcelService.readExcelToRecords(__filename));
// For compatibility with currency functions which can be updated to use Records, use arrays for now
// UPDATE CURRENCY AND REPLACE THIS
let setupArray = [setupData['url'], setupData['newProcessName'], setupData['Source Ledger'], 
                  setupData['Target Ledger'], setupData['CoA Mapping'], setupData['Amount Type'], 
                  setupData['Run Journal Import'], setupData['Create Summary Journals'], setupData['Run Automatic Posting']];

// if (appendResultsToExcelSheet) ExcelService.writeResultsHeaderRow(['Source Ledger', 'Target Ledger',	'Source Ledger Period', 'Target Ledger Period', 'REQUESTID', 'STARTTIME', 'ENDTIME', 'RESULT']);
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
  //if (appendResultsToExcelSheet) ExcelService.save();
});

test.describe('Transfer Ledger Balances', () => {
  test.beforeEach(async ({ }, testInfo) => {
    await cp.navigate(page, testInfo, setupArray);
  });

  let index = 0;
  loopData.forEach((currentRow, i) => {
    if (currentRow['RESULT'] == undefined || currentRow['RESULT'] == "") {
      test(`${currentRow['ID']}: ${currentRow['Source Ledger']}, ${currentRow['Target ledger']}, ${currentRow['Source Ledger Period'].trim()}, ${currentRow['Target Ledger Period']}`, async ({ }, testInfo) => {
        // test.setTimeout(1500000);
        if (appendResultsToExcelSheet) ExcelService.updateValue('RESULT', i, 'STARTED');

        // For compatibility with currency functions which can be updated to use Records, use arrays for now
        // UPDATE CURRENCY AND REPLACE THIS
        let currentArray = [currentRow['Source Ledger'], currentRow['Target ledger'], currentRow['Source Ledger Period'], currentRow['Target Ledger Period']]

        await cp.transferLedgerBalances(page, testInfo, setupArray, currentArray, index);

        if (skipRatherThanSubmit) {
          await testInfo.attach(`${currentArray[0]} Final Screen (cancelled)...`, { body: await page.screenshot(), contentType: 'image/png' });
          await form.buttonClick(page, 'Cancel');
        } else {
          testLoopStartTime = new Date();
          await form.buttonClick(page, 'Submit');
          let processResults = await cp.confirmProcessCompletion(page, testInfo, apiContext, setupArray, currentArray, testLoopStartTime, testLoopEndTime);
          //if (appendResultsToExcelSheet) ExcelService.writeResultsResultRow([processResults?.rowData[0], processResults?.rowData[1], processResults?.rowData[2], processResults?.rowData[3], processResults?.processNumber, processResults?.testLoopStartTime, processResults?.testLoopEndTime, processResults?.requestStatus]);
          if (appendResultsToExcelSheet) {
            ExcelService.updateValue('REQUESTID', i, processResults.processNumber, 'n');
            ExcelService.updateValue('STARTTIME', i, processResults.testLoopStartTime, 'd');
            ExcelService.updateValue('ENDTIME', i, processResults.testLoopEndTime, 'd');
            ExcelService.updateValue('RESULT', i, processResults.requestStatus);
          }
        }
      });
    };
  });
});
