// Ensure you have the required Excel file in the correct directory: excel-data-files/batch-run-automate.xlsx
// Run using: npx playwright test tests/translation/currrency-translate-gl-account-balances-ggp.spec.ts --ui
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
const appendResultsToExcelSheet = true; // Set to true to write results to results excel file (filename *-results-YYYYMMDD-hhmmss.xlsx)
const skipRatherThanSubmit = true;      // Set to true to skip submission and just take screenshots

let setupData: Record<string, any> = {};   // Data items from the Setup Excel sheet as a Record
let loopData: Record<string, any>[] = [];  // Data items from the Loop Excel sheet as a Record
if (getDataFromExcelFile) ({ setupData, loopData } = ExcelService.readExcelToRecords(__filename));

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
});

test.describe('Translate GL Account Balances (GPP)', () => {
  test.beforeEach(async ({ }, testInfo) => {
    cp.navigate(page, testInfo, setupData);
  });

  let index = 0;
  let runNeedsCounting = true;
  loopData.forEach((currentRow, i) => {
    if (currentRow['RESULT'] == undefined || currentRow['RESULT'] == "") {
      test(`${currentRow['ID']}: ${currentRow['DATA_ACCESS_SET']}, ${currentRow['LEDGER_NAME']}, ${currentRow['TARGET_CURRENCY']}, ${currentRow['PERIOD']}, ${currentRow['BALANCING_SEGMENT']}`, async ({ }, testInfo) => {
        test.setTimeout(1000000);

        if (appendResultsToExcelSheet) {
          ExcelService.updateLoopRow(i, { 'RESULT': { value: 'STARTED', format: 's' } });
          if (runNeedsCounting) {
            const previousCount = (setupData['Test Attempt Count']) ? Number(setupData['Test Attempt Count']) : 0;
            setupData['Test Attempt Count'] = previousCount+1;
            ExcelService.updateSetupSheet(setupData);
            runNeedsCounting = false;
          }
        }

        await cp.translateGLAccountBalancesGGP(page, testInfo, setupData, currentRow, index);

        if (skipRatherThanSubmit) {
          await testInfo.attach(`${currentRow['DATA ACCESS SET']} Final Screen (cancelled)...`, { body: await page.screenshot(), contentType: 'image/png' });
          await form.buttonClick(page, 'Cancel');
        } else {
          testLoopStartTime = new Date();
          await form.buttonClick(page, 'Submit');
          let processResults = await cp.confirmProcessCompletion(page, testInfo, apiContext, setupData, currentRow, testLoopStartTime, testLoopEndTime);
          if (appendResultsToExcelSheet) ExcelService.updateLoopRow(i, { 'REQUESTID': { value: processResults.processNumber, format: 'n' },
                                                                         'STARTTIME': { value: processResults.testLoopStartTime, format: 'd' },
                                                                         'ENDTIME': { value: processResults.testLoopEndTime, format: 'd' },
                                                                         'RESULT': { value: processResults.requestStatus, format: 's' } });
        }
      });
    };
  });
});