import test from "@playwright/test";
import path from "path";


export async function navigateToHomePage(page: any, url?: string) {
    await test.step('Access Home Page', async () => {
        await page.goto('https://eiiv-dev6.fa.us6.oraclecloud.com/fscmUI/faces/FuseWelcome');
        await page.waitForLoadState('networkidle');
        // await page.getByTitle('Navigator').click();
    });
}

export async function navigateToTile(page: any, name: string, testInfo: any) {
    await test.step(`Navigate to ${name}`, async () => {
        // await page.getByRole('link', { name }).click();
        await page.locator(`css=a#groupNode_${name?.toLowerCase()}`).click();
        await page.waitForLoadState('networkidle');
        await testInfo.attach(`Navigate to ${name}`, { body: await page.screenshot(), contentType: 'image/png' });
    });
}
export async function navigateToLeftNavLink(page: any, link: string, testInfo: any) {
    await test.step(`Navigate to ${link}`, async () => {
        await page.locator('a.app-nav-label').getByText(link).click();
        await page.waitForLoadState('networkidle');
        await testInfo.attach(`Select ${link}`, { body: await page.screenshot(), contentType: 'image/png' });
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
        await page.getByRole('link', { name: link }).click();
        await page.waitForLoadState('networkidle');
        await testInfo.attach(`Manage Task & ${link}`, { body: await page.screenshot(), contentType: 'image/png' });
    });
}



