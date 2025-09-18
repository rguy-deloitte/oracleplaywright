import { test as setup, expect } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });
const loginUrl = process.env.LOGINURL!;
const userName = process.env.ORACLEUSERNAME!;
const password = process.env.ORACLEPASSWORD!;

setup('authenticate', async ({ page }) => {
    // https://playwright.dev/docs/auth
    await page.goto(loginUrl);
    await page.getByRole('textbox', { name: 'User ID' }).click();
    await page.getByRole('textbox', { name: 'User ID' }).fill(userName);
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill(password);
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Wait for the final URL to ensure the storage state is set
    await page.waitForURL(`${new URL(loginUrl).origin}/**`);
    await page.waitForLoadState('networkidle');
    // await page.waitForTimeout(10000);    // <-- An alternative approach

    // Save storage state into the file.
    await page.context().storageState({ path: './tests/.auth/auth-state.json' });
});