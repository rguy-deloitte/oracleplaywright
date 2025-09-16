import { test, expect, type Page } from '@playwright/test';

// const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

// Annotate entire file as serial.
test.describe.configure({ mode: 'serial' });
// const accountingPeriods = ['Jun-23', 'Jul-23'];
const accountingPeriods = ['Jun-25', 'Jul-25'];
// const accountingPeriods = ['Jun-25'];

test('Schedule New Process', async ({ page, request }, testInfo) => {
    // Use a glob URL pattern. Note no await.
    const responsePromise = page.waitForResponse('**/FuseWelcome');
    test.slow();

    // Login to Oracle Fusion
     await test.step('Login into Oracle Fusion', async () => {
        await page.goto('https://eiiv-dev6.login.us6.oraclecloud.com/oam/server/obrareq.cgi?encquery%3D3A11MhGdTbDq7Vj3NEDsXdMnTw3lbUfJOutikWSxMX855YIXgp4UhfLN2oYWFhuBpcLgD718QDLzqsJIzmEFW3shpL3GzQRRZby1udpbKZSyg7xNaWJbeZBVRNBm9IUWGKkmhPc0m5ikEROT7p7lJMknPWv588PrD1PdT3TED8576tZi9Cr%2B6%2Fs00TENNbbbJu22%2F5p%2FpYILL5GKEXbYNyxTSLno%2BGQuJZje8s7h41eGMrsc4BFDCFLAvq3pjPQ%2B7jlIdw%2Bb9D0VPAt68gF7pfHFto9HlPPRDj0hewXXd9L9EcP1Vj%2F64mE%2BGxmHQdpvtcqYvhGmXmfMDIPtPK54%2B1eVBCZWCZXlSFmAlaBGzLwnkEkpCW%2FvOeutSE2p48%2Bo38QBfDKW9SB%2FXhvQIuYPR8CkHhfNao4n0OeP43Z7zo0jl4G6a3QfRC0hnkEluXv6%20agentid%3DOraFusionApp_11AG%20ver%3D1%20crmethod%3D2%26cksum%3Df045344d0952cf7cde27cbd0f0d2b04abd3740f8&ECID-Context=1.006E58Ml%5ESnAPPs6wjuXMG0071X90006xE%3BkXjE');
        await page.getByRole('textbox', { name: 'User ID' }).click();
        await page.getByRole('textbox', { name: 'User ID' }).fill('xxx');
        await page.getByRole('textbox', { name: 'Password' }).click();
        await page.getByRole('textbox', { name: 'Password' }).fill('xxx');
        await page.getByRole('button', { name: 'Sign In' }).click();
        // await page.getByRole('link', { name: 'Tools' }).click();
        // await page.getByTitle('Scheduled Processes').click();
    });

    // Schedule New Process
    for (var period of accountingPeriods) {
        await test.step(`Process: ${period}`, async () => {
            // await page.getByRole('link', { name: 'Home', exact: true }).click();
            await page.goto('https://eiiv-dev6.fa.us6.oraclecloud.com/fscmUI/faces/FuseWelcome?_adf.ctrl-state=b9ldsqwr0_5');
            await page.getByRole('link', { name: 'Tools' }).click();
            await page.getByTitle('Scheduled Processes').click();
            await page.getByRole('button', { name: 'Schedule New Process' }).click();
            await page.getByRole('combobox', { name: 'Name' }).click();
            await page.getByRole('combobox', { name: 'Name' }).fill('translate general Ledger account balances');
            await page.getByRole('combobox', { name: 'Name' }).press('Enter');
            await page.getByRole('button', { name: 'OK' }).click();
            await page.getByLabel('Data Access Set').click();
            await page.getByLabel('Data Access Set').selectOption('DELOITTE INSURANCE LEDGER SET');
            await page.getByLabel('Ledger or Ledger Set').selectOption('DNB GBP GAAP PL')
            await page.getByLabel('Target Currency').selectOption('SAR Saudi Riyal');
            await page.getByLabel('Accounting Period').selectOption(period);
            // await page.getByLabel('Balancing Segment').selectOption('???');
            await page.getByTitle('Search: Balancing Segment').click();
            await page.getByRole('cell', { name: '100004' }).first().click();
            await page.waitForTimeout(1000);
            await page.getByRole('button', { name: 'Cancel', exact: true }).click();
            // await page.getByRole('button', { name: 'Submit' }).click();

            /*
            // await Promise.all([
            //     await page.getByRole('button', { name: 'OK' }).click(),
            //     page.waitForResponse(resp => resp.url().includes('/FuseWelcome') && resp.status() === 200),
            //     page.waitForResponse(resp => resp.url().includes('/FuseWelcome') && resp.status() === 200)
            // ]);

            await responsePromise;

            await Promise.all([
                // page.getByLabel('Data Access Set').selectOption('DELOITTE INSURANCE LEDGER SET'),
                // page.waitForResponse(resp => resp.url().includes('/FuseWelcome') && resp.status() === 200)
                page.waitForResponse(resp => resp.url().includes('/FuseWelcome') && resp.status() === 200),
                page.getByLabel('Data Access Set').selectOption('DELOITTE INSURANCE LEDGER SET')
            ]);

            await responsePromise;

            await Promise.all([
                // page.getByLabel('Ledger or Ledger Set').selectOption('DNB GBP GAAP PL'),
                // page.waitForResponse(resp => resp.url().includes('/FuseWelcome') && resp.status() === 200)
                page.waitForResponse(resp => resp.url().includes('/FuseWelcome') && resp.status() === 200),
                page.getByLabel('Ledger or Ledger Set').selectOption('DNB GBP GAAP PL')
            ]);

            await responsePromise;

            // await responsePromise;
            // await page.getByLabel('Data Access Set').selectOption('DELOITTE INSURANCE LEDGER SET');
            // await responsePromise;
            // await page.getByLabel('Ledger or Ledger Set').selectOption('DNB GBP GAAP PL');
            // await responsePromise;
            // await page.getByLabel('Target Currency').selectOption('SAR Saudi Riyal');
            // await responsePromise;
            // await page.getByLabel('Accounting Period').selectOption(period);
            // await responsePromise;

            // await page.getByLabel('Balancing Segment').selectOption('???');
            // await page.getByRole('button', { name: 'Submit' }).click();

            */
            await testInfo.attach(`${period} Final Screen...`, { body: await page.screenshot(), contentType: 'image/png' });
        });
    }

    return;

    /* Faster?
    // Schedule New Process
    await test.step('Schedule New Process', async () => {
        for (var period of accountingPeriods) {
            await page.goto('https://eiiv-dev6.fa.us6.oraclecloud.com/fscmUI/faces/FuseWelcome?_adf.ctrl-state=b9ldsqwr0_5');
            await page.getByRole('link', { name: 'Tools' }).click();
            await page.getByTitle('Scheduled Processes').click();
            await page.getByRole('button', { name: 'Schedule New Process' }).click();
            await page.getByRole('combobox', { name: 'Name' }).click();
            await page.getByRole('combobox', { name: 'Name' }).fill('translate general Ledger account balances');
            await page.getByRole('combobox', { name: 'Name' }).press('Enter');
            await page.getByRole('button', { name: 'OK' }).click();
            await page.getByLabel('Data Access Set').selectOption('DSI UK Access');
            await page.getByLabel('Accounting Period').selectOption(period);
            await testInfo.attach(`${period} Final Screen...`, { body: await page.screenshot(), contentType: 'image/png' });
        }
    });
    */

    /*
let page: Page;

test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('https://eiiv-dev6.login.us6.oraclecloud.com/oam/server/obrareq.cgi?encquery%3D3A11MhGdTbDq7Vj3NEDsXdMnTw3lbUfJOutikWSxMX855YIXgp4UhfLN2oYWFhuBpcLgD718QDLzqsJIzmEFW3shpL3GzQRRZby1udpbKZSyg7xNaWJbeZBVRNBm9IUWGKkmhPc0m5ikEROT7p7lJMknPWv588PrD1PdT3TED8576tZi9Cr%2B6%2Fs00TENNbbbJu22%2F5p%2FpYILL5GKEXbYNyxTSLno%2BGQuJZje8s7h41eGMrsc4BFDCFLAvq3pjPQ%2B7jlIdw%2Bb9D0VPAt68gF7pfHFto9HlPPRDj0hewXXd9L9EcP1Vj%2F64mE%2BGxmHQdpvtcqYvhGmXmfMDIPtPK54%2B1eVBCZWCZXlSFmAlaBGzLwnkEkpCW%2FvOeutSE2p48%2Bo38QBfDKW9SB%2FXhvQIuYPR8CkHhfNao4n0OeP43Z7zo0jl4G6a3QfRC0hnkEluXv6%20agentid%3DOraFusionApp_11AG%20ver%3D1%20crmethod%3D2%26cksum%3Df045344d0952cf7cde27cbd0f0d2b04abd3740f8&ECID-Context=1.006E58Ml%5ESnAPPs6wjuXMG0071X90006xE%3BkXjE');
    await page.getByRole('textbox', { name: 'User ID' }).click();
    await page.getByRole('textbox', { name: 'User ID' }).fill('xxx');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('xxx');
    await page.getByRole('button', { name: 'Sign In' }).click();
});

// test.afterAll(async () => {
//   await page.close();
// });

for (var period of accountingPeriods) {
  test(`Process: ${period}`, async ({ page }) => {
    await page.goto('https://eiiv-dev6.fa.us6.oraclecloud.com/fscmUI/faces/FuseWelcome?_adf.ctrl-state=b9ldsqwr0_5');
    await page.getByRole('link', { name: 'Tools' }).click();
    await page.getByTitle('Scheduled Processes').click();
    await page.getByRole('button', { name: 'Schedule New Process' }).click();
    await page.getByRole('combobox', { name: 'Name' }).click();
    await page.getByRole('combobox', { name: 'Name' }).fill('translate general Ledger account balances');
    await page.getByRole('combobox', { name: 'Name' }).press('Enter');
    await page.getByRole('button', { name: 'OK' }).click();
    await page.getByLabel('Data Access Set').selectOption('DSI UK Access');
    //await testInfo.attach('Final Screen...', { body: await page.screenshot(), contentType: 'image/png' });
  });
}
*/

    // Populate Populate New PRocess Name
    await test.step('Populate New Process Name', async () => {
        await page.getByTitle('Search: Name').click();
        await page.getByRole('combobox', { name: 'Name' }).click();
        // await page.getByTitle('Process Events').click();
        // await page.getByTitle('Search: Business Unit').click();
        await page.getByRole('link', { name: 'Process Events' }).click();
        // await page.getByRole('textbox', { name: 'Name' }).click();
        // await page.getByRole('textbox', { name: 'Name' }).fill('GB BU');
        await testInfo.attach('Populate_Business_Unit', { body: await page.screenshot(), contentType: 'image/png' });
        // await page.getByRole('button', { name: 'Search', exact: true }).click();
        // await page.getByRole('rowgroup').filter({ hasText: /^GB BU$/ }).getByRole('cell').click();
        // await page.getByRole('button', { name: 'OK' }).click();
     });

    return;

     //Populate Supplier
    await test.step('Populate Supplier', async () => {
        await page.getByRole('combobox', { name: 'Supplier', exact: true }).click();
        await page.getByRole('combobox', { name: 'Supplier', exact: true }).fill('ABC');
        await page.getByRole('link', { name: 'Search: Supplier' }).click();
        await page.getByRole('textbox', { name: 'Supplier', exact: true }).click();
        await page.getByRole('textbox', { name: 'Supplier', exact: true }).fill('ABC Stationary');
        await testInfo.attach('Select Supplier', { body: await page.screenshot(), contentType: 'image/png' });
        await page.getByRole('button', { name: 'Search', exact: true }).click();
        await page.getByRole('cell', { name: 'ABC Stationary', exact: true }).click();
        await page.getByRole('button', { name: 'OK' }).click();
        await testInfo.attach('Populate_Supplier', { body: await page.screenshot(), contentType: 'image/png' });

    });

    //Populate invoice Number
    await test.step('Populate Invoice Number', async () => {
        await page.getByRole('textbox', { name: 'Number' }).nth(0).click();
        await page.getByRole('textbox', { name: 'Number' }).fill('1819802142');
        await testInfo.attach('Populate_Invoice_Number', { body: await page.screenshot(), contentType: 'image/png' });

    });

    //POpulate Invoice Amount
    await test.step('Populate Invoice Amount', async () => {
        await page.getByRole('textbox', { name: 'Amount' }).click();
        await page.getByRole('textbox', { name: 'Amount' }).fill('2,000');
        await testInfo.attach('Populate_Invoice_Amount', { body: await page.screenshot(), contentType: 'image/png' });

    });
    //Save Invoice
    await test.step('Save Invoice', async () => {
        await page.getByRole('button', { name: 'Save and Close' }).click();
        await testInfo.attach('Save Invoice', { body: await page.screenshot(), contentType: 'image/png' });
    });
});