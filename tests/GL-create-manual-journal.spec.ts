// This test script ... (does what?)
// If reading data from Excel, ensure you have the required Excel file in the correct directory: excel-data-files/GL-create-manual-journal.xlsx
// Run using: npx playwright test tests/GL-create-manual-journal.spec.ts
import { test } from '@playwright/test';
import { ExcelService } from '../src/services/excel.service';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });
let testLoopStartTime: Date = new Date(), testLoopEndTime: Date = new Date();
const authFile = path.join(__dirname, '../.auth/auth-state.json');

const getDataFromExcelFile = false;         // Set to true to read data from Excel file
const generateResultsExcelFile = false;     // Set to true to write results to results excel file (filename *-results-YYYYMMDD-hhmmss.xlsx)
let setupData: any[] = [];                  // Data items from the Setup Excel sheet
let loopData: any[][] = [];                 // Data items from the Loop Excel sheet
const skipRatherThanSubmit = true;          // Set to true to skip submission and just take screenshots

test.use({ storageState: authFile });

test.beforeAll(async ({ playwright }) => {
  // Load data from Excel file & prepare results file if required
  if (getDataFromExcelFile) ({ setupData, loopData } = ExcelService.readExcelData(__filename));
  if (generateResultsExcelFile) ExcelService.writeResultsHeaderRow(['ACCOUNTING PERIOD', 'BALANCING SEGMENT', 'REQUESTID', 'STARTTIME', 'ENDTIME', 'RESULT']);
});

test.afterAll(async ({ }) => {
  if (generateResultsExcelFile) ExcelService.save();
});

test('Post Manual Journal', async ({ page, request }, testInfo) => {
    test.slow();
    // *** Note *** Login handled in auth.setup.ts

    // Access the Oracle Fusion Home Page
    await test.step('Access Home Page', async () => {
        await page.goto('https://secure-web.cisco.com/13kyZjA_Y3iSzSkdRg0vwA-wjJVTWiIXSFZJKBMYrzf1ENqKvFU6Duyq_7DEm1XZy8fxU9XdeTYk5H0Y1HHnu2ttNTUDIq709NOzeRPIGGBi7aK-FOJqeRhinvRZ1-Qoi5hRJZx6UFeEpLpqwmtD8GXy0bV0LOQT6dbRztH8m4iuG8y5lngWxgNfrc7U-XVKxW5f9AFWSN8kacUEotYxKhNLvkmAdctAz2sPYxN6eqzaaKdZS6LjfqmnrSQcu8YQYhPFJGa7zLtoL8yBswd9FXzkhKlvxdlIyNgbf-UVC3axlO2NjOpmn240Nylju1otb0acLjTMhGzgWydj73xXcrA/https%3A%2F%2Fiahdme-test.fa.ocs.oraclecloud.com%2FfscmUI%2Ffaces%2FFuseOverview');
        await testInfo.attach('Access_Home_Page', { body: await page.screenshot(), contentType: 'image/png' });
    });
 
    //Navigate to Journals
    await test.step('Navigate to General Accounting', async () => {
        await page.getByRole('link', { name: 'General Accounting', exact: true }).click();
        await page.getByTitle('Journals').locator('path').nth(3).click();
        await testInfo.attach('Navigate to Journals Page', { body: await page.screenshot(), contentType: 'image/png' });
    });
 
        //create journal
    await test.step('Navigate to Create Journal', async () => {
        await page.getByRole('link', { name: 'Tasks' }).click();
        await page.getByRole('link', { name: 'Create Journal', exact: true }).click();
        await testInfo.attach('Select Tasks and Create Journal', { body: await page.screenshot(), contentType: 'image/png' });
    });
 
});