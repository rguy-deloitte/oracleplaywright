// Ensure you have the required Excel file in the correct directory: excel-data-files/batch-run-automate.xlsx
// Run using: npx playwright test tests/example-oracle-with-excel-data.spec.ts --ui --debug
import { test, type Page } from '@playwright/test';
import { ExcelService } from '../src/services/excel.service';

const getDataFromExcelFile = true;  // Set to true to read data from Excel file
let setupData: any[] = [];          // Data items from the Setup Excel sheet
let loopData: any[][] = [];         // Data items from the Loop Excel sheet
const skipRatherThanSubmit = true;  // Set to true to skip submission and just take screenshots

// Annotate entire file as serial.
test.describe.configure({ mode: 'serial' });

test('Schedule New Process Bermuda', async ({ page, request }, testInfo) => {
    test.slow();

    // Load data from Excel file if required
    if (getDataFromExcelFile) {
        ({ setupData, loopData } = ExcelService.readExcelData(__filename));
    }

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
                await testInfo.attach(`${loopData[i][0]} Final Screen (submitted)...`, { body: await page.screenshot(), contentType: 'image/png' });
                await page.getByRole('button', { name: 'OK' }).click();
                await page.waitForTimeout(60000);
            }
            await page.getByRole('button', { name: 'Schedule New Process' }).click();
        });
    }
});

