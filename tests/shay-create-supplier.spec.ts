import { test } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../.auth/auth-state.json');

test.use({ storageState: authFile });

function generateRandomNumber() {
    
    return Math.floor(Math.random() * 900) + 100;
}

for(let i = 0; i < 3; i++){
    const randomNumber = generateRandomNumber();
    console.log(i);
    test(`Create Supplier${i}`, async ({ page, request }, testInfo) => {
        test.slow();

        await test.step('Access Home Page', async () => {
            await page.goto('https://eiiv-dev6.fa.us6.oraclecloud.com/fscmUI/faces/FuseWelcome');

        });

        await test.step('Navigate to Procurement', async () => { 
            await page.getByRole('link', { name: 'Procurement' }).click();
            await testInfo.attach('Navigate to Procurement', { body: await page.screenshot(), contentType: 'image/png' });
        });

        await test.step('Navigate to Supplier', async () => { 
            await page.getByTitle('Suppliers').click();
            await testInfo.attach('Select Suppliers', { body: await page.screenshot(), contentType: 'image/png' });
        });

        await test.step('Select Tasks & Manage Suppliers', async () => { 
            await page.getByRole('link', { name: 'Tasks' }).click();
            await page.getByRole('link', { name: 'Manage Suppliers' }).click();
            await testInfo.attach('Manage Suppliers', { body: await page.screenshot(), contentType: 'image/png' });
        });

        await test.step('Create Supplier', async () => {
            await page.getByRole('button', { name: 'Create' }).click();
            await page.getByRole('textbox', { name: 'Supplier' }).click();
            await page.getByRole('textbox', { name: 'Supplier' }).fill(`Auto Test Supplier${i}-${randomNumber}`);
            await testInfo.attach('Input Supplier Name', { body: await page.screenshot(), contentType: 'image/png' });
        });
            
        await test.step('Input Supplier Information', async () => {
            await page.getByLabel('Business Relationship').selectOption('1');
            await page.getByLabel('Tax Organization Type').selectOption('0');
            await page.getByTitle('Search:  Tax Country').click();
            await page.getByRole('link', { name: 'Search...' }).click();
            await page.getByRole('textbox', { name: 'Name' }).click();
            await page.getByRole('textbox', { name: 'Name' }).fill('United Kingdom');
            await page.locator('[id="__af_Z_window"]').getByRole('button', { name: 'Search', exact: true }).click();
            await page.getByRole('cell', { name: 'United Kingdom', exact: true }).click();
            await page.getByRole('button', { name: 'OK' }).click();
            await testInfo.attach('Input Supplier Information', { body: await page.screenshot(), contentType: 'image/png' });
        });

        await test.step('Confirm Supplier Information', async () => {
            await page.locator('[id="__af_Z_window"]').getByRole('button', { name: 'Create' }).click();
            await page.getByRole('button', { name: 'Ignore Match Results and' }).click();
            await testInfo.attach('Confirm Supplier Information', { body: await page.screenshot(), contentType: 'image/png' });
        });

        await test.step('Input Structure Currency', async () => {
            await page.getByRole('textbox', { name: 'Capital Structure Currency' }).click();
            await page.getByRole('textbox', { name: 'Capital Structure Currency' }).fill('GBP');
            await page.getByRole('textbox', { name: 'Capital Structure (Paid-up' }).click();
            await page.getByRole('textbox', { name: 'Capital Structure (Paid-up' }).fill('10000');
            await testInfo.attach('Input Structure Currency', { body: await page.screenshot(), contentType: 'image/png' });
        });

        await test.step('Save and Submit Supplier', async () => {
            await page.getByRole('button', { name: 'Save' }).click();
            await page.getByRole('button', { name: 'Submit' }).click();
            await page.getByRole('button', { name: 'OK' }).click();
            await testInfo.attach('Save and Submit Supplier', { body: await page.screenshot(), contentType: 'image/png' });
        });

    });

}
