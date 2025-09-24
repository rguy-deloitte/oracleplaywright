// Ensure you have the required Excel file in the correct directory: excel-data-files/batch-run-automate.xlsx
// Run using: npx playwright test tests/currency-translation/currrency-transfer-ledger-balances.spec.ts --ui
import { test, expect, type Page } from '@playwright/test';
import { ExcelService } from '../../src/services/excel.service';
import dotenv from 'dotenv';
import path from 'path';

import * as cp from './currency'

dotenv.config({ path: path.resolve(__dirname, '../.env'), quiet: true });
// *** Note *** Login handled in auth.setup.ts and requires playwright.config.ts -> 
test.describe.configure({ mode: 'serial' });  // Required to ensure tests run in expected order and that beforeAll & afterAll only run once

let testLoopStartTime: Date = new Date(), testLoopEndTime: Date = new Date();
let apiContext: any;
const getDataFromExcelFile = true;      // Set to true to read data from Excel file
const generateResultsExcelFile = true;  // Set to true to write results to results excel file (filename *-results-YYYYMMDD-hhmmss.xlsx)
let setupData: any[] = [];              // Data items from the Setup Excel sheet
let loopData: any[][] = [];             // Data items from the Loop Excel sheet
const skipRatherThanSubmit = false;     // Set to true to skip submission and just take screenshots
if (getDataFromExcelFile) ({ setupData, loopData } = ExcelService.readExcelData(__filename));
if (generateResultsExcelFile) ExcelService.writeResultsHeaderRow(['ACCOUNTING PERIOD', 'BALANCING SEGMENT', 'REQUESTID', 'STARTTIME', 'ENDTIME', 'RESULT']);
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
//   test.beforeEach(async ({ page }) => {
//     // Navigate to where the process begins
//     await page.goto(setupData[0]);
//     await page.getByRole('link', { name: 'Tools' }).click();
//     await page.getByTitle('Scheduled Processes').click();
//     await page.getByRole('button', { name: 'Schedule New Process' }).click();
//     await page.getByRole('combobox', { name: 'Name' }).click();
//     await page.getByRole('combobox', { name: 'Name' }).fill(setupData[1]);
//     await page.getByRole('combobox', { name: 'Name' }).press('Enter');
//   });

  let index = 0;
  loopData.forEach((currentRow, i) => {
    test(`Source Ledger Period: ${currentRow[0]} - ${currentRow[1]}: ${currentRow[2]}`, async ({ }, testInfo) => {
      test.slow();

      await cp.transferLedgerBalances(page, testInfo, setupData, currentRow, index);

        if (skipRatherThanSubmit) {
            await testInfo.attach(`${currentRow[0]} Final Screen (cancelled)...`, { body: await page.screenshot(), contentType: 'image/png' });
            await page.getByRole('button', { name: 'Cancel', exact: true }).click();
        } else {
            await page.getByRole('button', { name: 'Submit', exact: true }).click();

            const processSubmittedMessage = await page.getByText(/Process \d+ was submitted\./).textContent();
            const processNumber = processSubmittedMessage?.match(/^Process (\d+) was submitted\.$/)?.[1];
            await testInfo.attach(`${currentRow[0]} Final Screen (submitted)...`, { body: await page.screenshot(), contentType: 'image/png' });
            await page.getByRole('button', { name: 'OK' }).click();

            if (processNumber) {
            let jobStatus, jobStatusJson, jobRequestStatus = '';
            do {
                await page.waitForTimeout(1000);
                jobStatus = await apiContext.get('./erpintegrations', { params: `?finder=ESSJobStatusRF;requestId=${processNumber}` })
                .catch((e) => console.log('Error with api call:', e));
                jobStatusJson = await jobStatus.json();
                jobRequestStatus = jobStatusJson.items[0].RequestStatus;
            } while (!['SUCCEEDED', 'CANCELED', 'ERROR', 'ERROR MANUAL RECOVERY', 'EXPIRED', 'FINISHED', 'HOLD', 'VALIDATION FAILED', 'WARNING'].includes(jobRequestStatus));  // See: https://docs.oracle.com/en/cloud/saas/applications-common/25c/oacpr/statuses-of-scheduled-processes.html

            testLoopEndTime = new Date();
            ExcelService.writeResultsResultRow([currentRow[0], currentRow[1], processNumber, testLoopStartTime, testLoopEndTime, jobRequestStatus]);
            await expect(jobRequestStatus).toBe('SUCCEEDED');

            } else {
                console.log('Process number not found in the submission confirmation message:', processSubmittedMessage);
                // throw new Error('Process number not found in the submission confirmation message.');
            }
        }

        // await page.getByRole('button', { name: 'Schedule New Process' }).click();        
    });
  });
});