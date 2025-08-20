import { test } from '@playwright/test';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

test('Create Invoice', async ({ page, request }, testInfo) => {
    test.slow();

    // Login to Oracle Fusion
     await test.step('Login into Oracle Fusion', async () => {
        await page.goto('https://eiiv-dev6.login.us6.oraclecloud.com/oam/server/obrareq.cgi?encquery%3D3A11MhGdTbDq7Vj3NEDsXdMnTw3lbUfJOutikWSxMX855YIXgp4UhfLN2oYWFhuBpcLgD718QDLzqsJIzmEFW3shpL3GzQRRZby1udpbKZSyg7xNaWJbeZBVRNBm9IUWGKkmhPc0m5ikEROT7p7lJMknPWv588PrD1PdT3TED8576tZi9Cr%2B6%2Fs00TENNbbbJu22%2F5p%2FpYILL5GKEXbYNyxTSLno%2BGQuJZje8s7h41eGMrsc4BFDCFLAvq3pjPQ%2B7jlIdw%2Bb9D0VPAt68gF7pfHFto9HlPPRDj0hewXXd9L9EcP1Vj%2F64mE%2BGxmHQdpvtcqYvhGmXmfMDIPtPK54%2B1eVBCZWCZXlSFmAlaBGzLwnkEkpCW%2FvOeutSE2p48%2Bo38QBfDKW9SB%2FXhvQIuYPR8CkHhfNao4n0OeP43Z7zo0jl4G6a3QfRC0hnkEluXv6%20agentid%3DOraFusionApp_11AG%20ver%3D1%20crmethod%3D2%26cksum%3Df045344d0952cf7cde27cbd0f0d2b04abd3740f8&ECID-Context=1.006E58Ml%5ESnAPPs6wjuXMG0071X90006xE%3BkXjE');
        await page.getByRole('textbox', { name: 'User ID' }).click();
        await page.getByRole('textbox', { name: 'User ID' }).fill('xxx');
        await testInfo.attach('Login_UserID', { body: await page.screenshot(), contentType: 'image/png' });
        await page.getByRole('textbox', { name: 'Password' }).click();
        await page.getByRole('textbox', { name: 'Password' }).fill('xxx');
        await testInfo.attach('Login_Password', { body: await page.screenshot(), contentType: 'image/png' });
        await page.getByRole('button', { name: 'Sign In' }).click();
        await testInfo.attach('Login_to_Oracle', { body: await page.screenshot(), contentType: 'image/png' });
    });

    // Access the Oracle Fusion Home Page
    await test.step('Access Home Page', async () => {
        await testInfo.attach('Access_Home_Page', { body: await page.screenshot(), contentType: 'image/png' });
    });

    //Navigate to Payables
    await test.step('Navigate to Payables', async () => {
        await page.getByRole('link', { name: 'Payables', exact: true }).click();
        await page.getByTitle('Invoices').locator('path').nth(3).click();
        await testInfo.attach('Navigate_to_Payables_Page', { body: await page.screenshot(), contentType: 'image/png' });
    });

        //Select tasks and create invoice
    await test.step('Navigate to Payables', async () => {
        await page.getByRole('link', { name: 'Tasks' }).click();
        await page.getByRole('link', { name: 'Create Invoice', exact: true }).click();
        await testInfo.attach('Select Tasks and Create Invoice', { body: await page.screenshot(), contentType: 'image/png' });
    });

    
    // Populate Invoice Details
    await test.step('Populate Business Unit', async () => {
        await page.getByTitle('Search: Business Unit').click();
        await page.getByRole('combobox', { name: 'Business Unit' }).click();
        await page.getByTitle('Search: Business Unit').click();
        await page.getByTitle('Search: Business Unit').click();
        await page.getByRole('link', { name: 'Search...' }).click();
        await page.getByRole('textbox', { name: 'Name' }).click();
        await page.getByRole('textbox', { name: 'Name' }).fill('GB BU');
        await testInfo.attach('Populate_Business_Unit', { body: await page.screenshot(), contentType: 'image/png' });
        await page.getByRole('button', { name: 'Search', exact: true }).click();
        await page.getByRole('rowgroup').filter({ hasText: /^GB BU$/ }).getByRole('cell').click();
        await page.getByRole('button', { name: 'OK' }).click();
     });

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
