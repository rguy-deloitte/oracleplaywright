import test, { Page, TestInfo } from "@playwright/test";
import * as forms from "./form";
import dotenv from 'dotenv';
import path from "path";

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Navigate page to the provided url
export async function navigateToUrl(page: Page, url: string, testInfo?: TestInfo, testStepDescription?: string) {
    if (testStepDescription == undefined) { testStepDescription = 'Access URL' };
    await test.step(testStepDescription, async () => {
        await page.goto(url);
        if (testInfo) {
            await testInfo.attach(testStepDescription, { body: await page.screenshot(), contentType: 'image/png' });
        }
    });
}

// Navigate page to the login url specified in '.env' file
export async function navigateToHomePage(page: Page, testInfo?: TestInfo) {
    const url = process.env.LOGINURL;
    if (url == undefined) {
            throw Error("LOGINURL not set in environment, check './.env' file");
    }
    await navigateToUrl(page, url, testInfo, 'Access Home Page');
}

export async function navigateToTile(page: Page, name: string, testInfo?: TestInfo) {
    await test.step(`Navigate to ${name}`, async () => {
        let waitForPage = forms.waitForStablePage(page);
        await page.getByRole('link', { name: name, exact: true }).click();
        await waitForPage;
        if (testInfo) {
            await testInfo.attach(`Navigate to ${name} tile`, { body: await page.screenshot(), contentType: 'image/png' });
        }
    });
}

export async function navigateToLeftNavLink(page: Page, link: string, testInfo?: TestInfo) {
    await test.step(`Navigate to ${link}`, async () => {
        let waitForPage = forms.waitForStablePage(page);
        await page.locator('a.app-nav-label').getByText(link).click();
        await waitForPage;
        if (testInfo) {
            await testInfo.attach(`Click ${link} link`, { body: await page.screenshot(), contentType: 'image/png' });
        }
    });
}

export async function navigateToTileLink(page: Page, link: string, testInfo?: TestInfo) {
    await test.step(`Navigate to ${link}`, async () => {
        let waitForPage = forms.waitForStablePage(page);
        await page.getByTitle(link).click();
        await waitForPage;
        if (testInfo) {
            await testInfo.attach(`Select ${link}`, { body: await page.screenshot(), contentType: 'image/png' });
        }
    });
}

export async function navigateToTileSideLink(page: Page, link: string, testInfo?: TestInfo) {
    await test.step(`Select Tasks & ${link}`, async () => {      
        let waitForPage = forms.waitForStablePage(page);  
        await page.getByRole('link', { name: 'Tasks' }).click();
        await page.getByRole('link', { name: link, exact: true }).click();
        await waitForPage;
        if (testInfo) {
            await testInfo.attach(`Click ${link} from side bar`, { body: await page.screenshot(), contentType: 'image/png' });
        }
    });
}

export async function setDataAccessSet(page: Page, setName: string, testInfo: TestInfo) {
    await test.step(`Change to '${setName}' dataset`, async () => {
        let waitForPage = forms.waitForStablePage(page);  
        await page.getByRole("link", { name: "Change", exact: true }).click();
        await waitForPage;
        await forms.selectComboboxByName(page, "Data Access Set", setName);
        await forms.buttonClick(page, "OK");
    });
}
