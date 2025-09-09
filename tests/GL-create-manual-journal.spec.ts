import { test } from '@playwright/test';

const userName = 'tbc';
const password = 'tbc';
 
test('Post Manual Journal', async ({ page, request }, testInfo) => {
    test.slow();
 
    // Login to Oracle Fusion
     await test.step('Login into Oracle Fusion', async () => {
        await page.goto('https://secure-web.cisco.com/13kyZjA_Y3iSzSkdRg0vwA-wjJVTWiIXSFZJKBMYrzf1ENqKvFU6Duyq_7DEm1XZy8fxU9XdeTYk5H0Y1HHnu2ttNTUDIq709NOzeRPIGGBi7aK-FOJqeRhinvRZ1-Qoi5hRJZx6UFeEpLpqwmtD8GXy0bV0LOQT6dbRztH8m4iuG8y5lngWxgNfrc7U-XVKxW5f9AFWSN8kacUEotYxKhNLvkmAdctAz2sPYxN6eqzaaKdZS6LjfqmnrSQcu8YQYhPFJGa7zLtoL8yBswd9FXzkhKlvxdlIyNgbf-UVC3axlO2NjOpmn240Nylju1otb0acLjTMhGzgWydj73xXcrA/https%3A%2F%2Fiahdme-test.fa.ocs.oraclecloud.com%2FfscmUI%2Ffaces%2FFuseOverview');
        await page.getByRole('textbox', { name: 'User ID' }).click();
        await page.getByRole('textbox', { name: 'User ID' }).fill(userName);
        await testInfo.attach('Login_UserID', { body: await page.screenshot(), contentType: 'image/png' });
        await page.getByRole('textbox', { name: 'Password' }).click();
        await page.getByRole('textbox', { name: 'Password' }).fill(password);
        await testInfo.attach('Login_Password', { body: await page.screenshot(), contentType: 'image/png' });
        await page.getByRole('button', { name: 'Sign In' }).click();
        await testInfo.attach('Login_to_Oracle', { body: await page.screenshot(), contentType: 'image/png' });
    });
 
    //Insert login function from a shared library
 
    // Access the Oracle Fusion Home Page
    await test.step('Access Home Page', async () => {
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