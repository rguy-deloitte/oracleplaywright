// Run using: npx playwright test --ui --debug

import { test, type Page } from '@playwright/test';

test.describe.configure({ mode: 'serial' });
 
const url = 'https://iahdme-test.fa.ocs.oraclecloud.com/fscmUI/faces/FuseOverview';
const newProcessName = 'translate general Ledger account balances';
const dataAccessSet = 'HK ACTUALS HKD Apr';
const ledgerOrLedgerSet = 'HK ACTUALS HKD Apr';
const targetCurrency = 'GBP Pound Sterling';
const accountingPeriods = ['Apr-18', '13_Apr-18'];
const balancingSegment = '270000';
 
test('Schedule New Process', async ({ page, request }, testInfo) => {
    test.slow();
 
    // Login to Oracle Fusion - Expects manual login using SSO & MFA
    await test.step('Login into Oracle Fusion', async () => {
        await page.goto(url);
        await page.pause();
        await page.getByRole('link', { name: 'Tools' }).click();
        await page.getByTitle('Scheduled Processes').click();
        await page.getByRole('button', { name: 'Schedule New Process' }).click();
        await page.getByRole('combobox', { name: 'Name' }).click();
        await page.getByRole('combobox', { name: 'Name' }).fill(newProcessName);
        await page.getByRole('combobox', { name: 'Name' }).press('Enter');
    });
 
    // Schedule New Process
    for (var period of accountingPeriods) {
        await test.step(`Process: ${period}`, async () => {
            // await page.getByRole('link', { name: 'Home', exact: true }).click();
            // await page.goto(url);
            await page.getByRole('button', { name: 'OK' }).click();
            await page.getByLabel('Data Access Set').click();
            await page.getByLabel('Data Access Set').selectOption(dataAccessSet);
            await page.getByLabel('Ledger or Ledger Set').selectOption(ledgerOrLedgerSet);
            await page.getByLabel('Target Currency').selectOption(targetCurrency);
            await page.getByLabel('Accounting Period').selectOption(period);
            await page.getByRole('combobox', { name: 'Balancing Segment' }).click();
            await page.getByRole('combobox', { name: 'Balancing Segment' }).fill(balancingSegment);
            await page.getByRole('combobox', { name: 'Balancing Segment' }).press('Enter');
            await page.waitForTimeout(1000);
            await page.getByRole('button', { name: 'Submit', exact: true }).click();
            await page.getByRole('button', { name: 'OK' }).click();
            await page.waitForTimeout(60000);
            await page.getByRole('button', { name: 'Schedule New Process' }).click();
            await testInfo.attach(`${period} Final Screen...`, { body: await page.screenshot(), contentType: 'image/png' });
        });
    }
});
