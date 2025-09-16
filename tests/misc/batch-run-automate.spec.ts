// Ensure you have the required Excel file in the correct directory: excel-data-files/batch-run-automate.xlsx
// Run using: npx playwright test tests/batch-run-automate.spec.ts --ui --debug
import { test, type Page } from '@playwright/test';
import { ExcelService } from '../../src/services/excel.service';

const getDataFromExcelFile = true, generateResultsExcelFile = true;  // Set to true to read data from Excel file
let setupData: any[] = [];          // Data items from the Setup Excel sheet
let loopData: any[][] = [];         // Data items from the Loop Excel sheet
const skipRatherThanSubmit = true;  // Set to true to skip submission and just take screenshots
let testLoopStartTime: Date = new Date(), testLoopEndTime: Date = new Date();
const apiBaseUrl = 'tbc';
const urlCredentials = 'tbc: base 64 encoded username and pwd';     // See: https://docs.oracle.com/en/cloud/saas/financials/25c/farfa/Quick_Start.html
let apiContext;

// Annotate entire file as serial.
test.describe.configure({ mode: 'serial' });

test.beforeAll(async ({ playwright }) => {
  apiContext = await playwright.request.newContext({
    // All requests we send go to this API endpoint.
    baseURL: apiBaseUrl,
    extraHTTPHeaders: {
        'Authorization': `Basic ${urlCredentials}`,
        'Content-Type': 'application/vnd.oracle.adf.resourcecollection+json',
    }
  });

  // Load data from Excel file & prepare results file if required
  if (getDataFromExcelFile) ({ setupData, loopData } = ExcelService.readExcelData(__filename));
  if (generateResultsExcelFile) ExcelService.writeResultsHeaderRow(['ACCOUNTING PERIOD', 'BALANCING SEGMENT', 'CURRENCY', 'REQUESTID', 'STARTTIME', 'ENDTIME', 'RESULT']);
});

test.afterAll(async ({ }) => {
  // Dispose all responses.
  await apiContext.dispose();
  if (generateResultsExcelFile) ExcelService.save();
});


test('Schedule New Process Bermuda', async ({ page, request }, testInfo) => {
    test.slow();

    // Login to Oracle Fusion
     await test.step('Login into Oracle Fusion', async () => {
        await page.goto(setupData[0]);
        await page.pause();
        await page.getByRole('link', { name: 'Tools' }).click();
        await page.getByTitle('Scheduled Processes').click();
        await page.getByRole('button', { name: 'Schedule New Process' }).click();
        await page.getByRole('combobox', { name: 'Name' }).click();
        await page.getByRole('combobox', { name: 'Name' }).fill(setupData[1]);
        await page.getByRole('combobox', { name: 'Name' }).press('Enter');
    });
    
    // Schedule New Process
    for (let i = 1; i < loopData.length; i++) {
        await test.step(`Process: ${loopData[i][0]}`, async () => {
            testLoopStartTime = new Date();
            await page.getByRole('button', { name: 'OK' }).click();
            await page.getByLabel('Data Access Set').click();
            await page.getByLabel('Data Access Set').selectOption(setupData[2]);
            await page.getByLabel('Ledger or Ledger Set').selectOption(setupData[3]);
            await page.getByLabel('Target Currency').selectOption(setupData[4]);
            await page.getByLabel('Accounting Period').selectOption(loopData[i][0]);
            await page.getByRole('combobox', { name: 'Balancing Segment' }).click();
            await page.getByRole('combobox', { name: 'Balancing Segment' }).fill(loopData[i][1]);
            await page.getByRole('combobox', { name: 'Balancing Segment' }).press('Enter');
            await page.waitForTimeout(1000);

            if (skipRatherThanSubmit) {
                await testInfo.attach(`${loopData[i][0]} Final Screen (cancelled)...`, { body: await page.screenshot(), contentType: 'image/png' });
                await page.getByRole('button', { name: 'Cancel', exact: true }).click();
            } else {
                await page.getByRole('button', { name: 'Submit', exact: true }).click();
                const processSubmittedMessage = await page.getByText(/Process \d+ was submitted\./).textContent();
                const processNumber = processSubmittedMessage?.match(/^Process (\d+) was submitted\.$/)?.[1];
                await testInfo.attach(`${loopData[i][0]} Final Screen (submitted)...`, { body: await page.screenshot(), contentType: 'image/png' });
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
                    ExcelService.writeResultsResultRow([loopData[i][0], loopData[i][1], 'CURRENCY', processNumber, testLoopStartTime, testLoopEndTime, jobRequestStatus]);
                } else {
                    console.log('Process number not found in the submission confirmation message:', processSubmittedMessage);
                    // throw new Error('Process number not found in the submission confirmation message.');
                }
            }
            await page.getByRole('button', { name: 'Schedule New Process' }).click();
        });
    }
});
