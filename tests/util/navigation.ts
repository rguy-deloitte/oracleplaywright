import test, { Page } from "@playwright/test";
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

export async function navigateToLeftNavLink(page: any, link: string, testInfo: any) {
    await test.step(`Navigate to ${link}`, async () => {
        await page.locator('a.app-nav-label').getByText(link).click();
        await page.waitForLoadState('networkidle');
        await testInfo.attach(`Select ${link}`, { body: await page.screenshot(), contentType: 'image/png' });
    });
}

export async function navigateToTileLink(page: any, link: string, testInfo: any) {
    await test.step(`Navigate to ${link}`, async () => {
        console.log(`Clicking on link with title: ${link}`, await page.getByTitle(link));
        await page.getByTitle(link).click();
        await page.waitForLoadState('networkidle');
        await testInfo.attach(`Select ${link}`, { body: await page.screenshot(), contentType: 'image/png' });
    });
}


export async function navigateByRef(page: any, ref: string, testInfo: any) {
    await test.step(`Navigate to ${ref}`, async () => {
        console.log(`Clicking on link with title: ${ref}`);
        await page.locator(ref).click();
        await page.waitForLoadState('networkidle');
        await testInfo.attach(`Select ${ref}`, { body: await page.screenshot(), contentType: 'image/png' });
    });
}
export async function clickButtonByName(page: any, buttonName: string, testInfo: any) {
    await test.step(`Click ${buttonName} button`, async () => {
        await page.getByRole('button', { name: buttonName }).click();
        await page.waitForLoadState('networkidle');
        await testInfo.attach(`Click ${buttonName} button`, { body: await page.screenshot(), contentType: 'image/png' });
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

// Takes the name of a collapsible section of the form and returns the Locator object for
// that section. This is useful if two fields have the same name but are in separate sections.
export async function getSectionFromCollapse(page: Page, buttonTitle: string){
  let collapseButtonLocator = await page.getByTitle(buttonTitle, { exact: true })
  let collapseButtonId = await collapseButtonLocator.getAttribute("aria-controls");

  if (collapseButtonId == null) {
      throw Error(`Button '${buttonTitle}' has no 'aria-controls' attribute`);
  }

  collapseButtonId = collapseButtonId.replace("::content", "");

  return page.locator(`id=${collapseButtonId}`);
}
