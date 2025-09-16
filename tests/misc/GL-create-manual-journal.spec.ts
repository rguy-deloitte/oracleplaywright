// This test script ... (does what?)
// If reading data from Excel, ensure you have the required Excel file in the correct directory: excel-data-files/GL-create-manual-journal.xlsx
// Run using: npx playwright test tests/misc/GL-create-manual-journal.spec.ts
import { test, expect } from '@playwright/test';
import { ExcelService } from '../../src/services/excel.service';
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
    // test.slow();
    // *** Note *** Login handled in auth.setup.ts

    // Access the Oracle Fusion Home Page
    await test.step('Access Home Page', async () => {
        await page.goto('https://eiiv-dev6.fa.us6.oraclecloud.com/fscmUI/faces/FuseWelcome');
        await testInfo.attach('Access_Home_Page', { body: await page.screenshot(), contentType: 'image/png' });
    });
 
    //Navigate to Journals
    await test.step('Navigate to General Accounting', async () => {
        await page.getByRole('link', { name: 'General Accounting', exact: true }).click();
        // await page.getByTitle('Journals').locator('path').nth(3).click();
        await page.getByTitle('Journals').click();
        await testInfo.attach('Navigate to Journals Page', { body: await page.screenshot(), contentType: 'image/png' });
    });
 
        //create journal
    await test.step('Navigate to Create Journal', async () => {
        await page.getByRole('link', { name: 'Tasks' }).click();
        await page.getByRole('link', { name: 'Create Journal', exact: true }).click();
        await testInfo.attach('Select Tasks and Create Journal', { body: await page.screenshot(), contentType: 'image/png' });
    });

    await expect(page.locator('[summary="Journal Lines"]')).toBeVisible();
    await expect(page.locator('[summary="Journal Lines"]').getByRole('row')).toHaveCount(2);

    const journalLinesTableRows = await page.locator('[summary="Journal Lines"]').getByRole('row');


    const jlAccount = '14010.000000.1012000000.000000.00000.000000.00000.0000.00000.00000';

    await journalLinesTableRows.nth(0).getByRole('textbox', { name: 'Account' }).fill(jlAccount);
    await journalLinesTableRows.nth(0).getByRole('textbox', { name: 'Entered Debit' }).fill('11.11');
    await journalLinesTableRows.nth(0).getByRole('textbox', { name: 'Description Mandatory' }).fill('abc');
    await journalLinesTableRows.nth(0).getByRole('textbox', { name: 'Description Mandatory' }).press('Enter');

    await journalLinesTableRows.nth(1).getByRole('textbox', { name: 'Account' }).fill(jlAccount);
    await journalLinesTableRows.nth(1).getByRole('textbox', { name: 'Entered Debit' }).fill('22.22');
    await journalLinesTableRows.nth(1).getByRole('textbox', { name: 'Description Mandatory' }).fill('def');
    await journalLinesTableRows.nth(1).getByRole('textbox', { name: 'Description Mandatory' }).press('Enter');

    await page.getByRole('button', { name: 'Add Row', exact: true }).click();

    await journalLinesTableRows.nth(2).getByRole('textbox', { name: 'Account' }).fill(jlAccount);
    await journalLinesTableRows.nth(2).getByRole('textbox', { name: 'Entered Debit' }).fill('33.33');
    await journalLinesTableRows.nth(2).getByRole('textbox', { name: 'Description Mandatory' }).fill('ghi');
    await journalLinesTableRows.nth(2).getByRole('textbox', { name: 'Description Mandatory' }).press('Enter');

    await testInfo.attach('Fill a JL Account', { body: await page.screenshot(), contentType: 'image/png' });

    console.log('JLT RowCount x:', await journalLinesTableRows.count());
    await expect(page.locator('[summary="Journal Lines"]').getByRole('row')).toHaveCount(3);

    /*
     //populate journal  
    await test.step('Populate Journal', async () => {
        await page.getByRole('textbox', { name: 'Journal Batch' }).fill('Test Journal Batch');
        await page.getByRole('textbox', { name: 'Accounting Period' }).fill('Apr-26');
        await page.getByRole('textbox', { name: 'Journal', exact: true }).fill('Test Journal');
        await page.getByRole('textbox', { name: 'Category' }).fill('Work In Progress');
        await testInfo.attach('Populate Journal Information', { body: await page.screenshot(), contentType: 'image/png' });
        
        //select account for journal line 1

        await page.getByRole('textbox', { name: 'Journal', exact: true }).click();
        await page.getByRole('textbox', { name: 'Journal', exact: true }).fill('Test Journal');
        await testInfo.attach('Populate Journal Batch', { body: await page.screenshot(), contentType: 'image/png' });

        //await page.getByRole('combobox', { name: 'Accounting Period' }).locator('a').click();
        await page.getByRole('combobox', { name: 'Accounting Period' }).click();
        await page.getByRole('gridcell', { name: 'Feb-24' }).click();
        

        //await page.getByRole('combobox', { name: 'Accounting Period' }).click();
        //await page.getByRole('combobox', { name: 'Accounting Period' }).fill('Feb-24');
        //await page.getByRole('combobox', { name: 'Accounting Period' }).press('Enter');

        await testInfo.attach('Input accounting Period', { body: await page.screenshot(), contentType: 'image/png' });
        
        //Select Account
        await page.getByLabel('Select Journal').click();
        await page.getByRole('link', { name: 'Select: Account' }).click();
        await page.getByRole('button', { name: 'Search' }).click();
        await page.getByRole('cell', { name: '999999' }).first().click();
        await page.getByRole('button', { name: 'OK' }).click();
        await testInfo.attach('Select Journal Line Account', { body: await page.screenshot(), contentType: 'image/png' });

        //Populate Journal Lines 
        await page.getByRole('textbox', { name: 'Entered Debit' }).click();
        await page.getByRole('textbox', { name: 'Entered Debit' }).fill('10000');
        await page.getByRole('textbox', { name: 'Description Mandatory' }).click();
        await page.getByRole('textbox', { name: 'Description Mandatory' }).fill('Test');
        await testInfo.attach('Populate Journal Line', { body: await page.screenshot(), contentType: 'image/png' });

        await page.getByRole('link', { name: 'Select: Account' }).click();
        await page.getByRole('button', { name: 'Search' }).click();
        await page.locator('[id="__af_Z_window"]').getByText('8790000000').click();
        await page.getByRole('button', { name: 'OK' }).click();
        await page.getByLabel('Select Journal').click();
        await page.getByRole('button', { name: 'OK' }).click();
        await page.getByRole('textbox', { name: 'Entered Credit' }).click();
        await page.getByRole('textbox', { name: 'Entered Credit' }).fill('10000');

        await testInfo.attach('Journal Saved', { body: await page.screenshot(), contentType: 'image/png' });
        await page.getByRole('link', { name: 'Post', exact: true }).click();
        await testInfo.attach('Journal Posted', { body: await page.screenshot(), contentType: 'image/png' });

    });
    */
});