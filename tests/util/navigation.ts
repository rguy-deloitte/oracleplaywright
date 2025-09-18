import test from "@playwright/test";
import dotenv from 'dotenv';
import path from "path";

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export async function navigateToHomePage(page: any, url?: string) {
    await test.step('Access Home Page', async () => {
        url ??= process.env.LOGINURL;
        await page.goto(url);
        await page.waitForLoadState('networkidle');
    });
}

export async function navigateToTile(page: any, name: string, testInfo: any) {
    await test.step(`Navigate to ${name}`, async () => {
        await page.getByRole('link', { name: name, exact: true }).click();
        await page.waitForLoadState('networkidle');
        await testInfo.attach(`Navigate to ${name}`, { body: await page.screenshot(), contentType: 'image/png' });
    });
}

export async function navigateToTileLink(page: any, link: string, testInfo: any) {
    await test.step(`Navigate to ${link}`, async () => {
        await page.getByTitle(link).click();
        await page.waitForLoadState('networkidle');
        await testInfo.attach(`Select ${link}`, { body: await page.screenshot(), contentType: 'image/png' });
    });
}

export async function navigateToTileSideLink(page: any, link: string, testInfo: any) {
    await test.step(`Select Tasks & ${link}`, async () => {
        await page.getByRole('link', { name: 'Tasks' }).click();
        await page.getByRole('link', { name: link, exact: true }).click();
        await page.waitForLoadState('networkidle');
        await testInfo.attach(`Manage Task & ${link}`, { body: await page.screenshot(), contentType: 'image/png' });
    });
}
