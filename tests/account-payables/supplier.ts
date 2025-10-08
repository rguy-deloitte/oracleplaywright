import { test, TestInfo, Page } from '@playwright/test';
import { navigateToTileSideLink } from '../util/navigation';
import * as forms from '../util/form';
import { faker } from '@faker-js/faker';
import { error } from 'console';


export async function fillSupplierDetails(page: Page, data: Record<string,any>, testInfo?: TestInfo) {
  await navigateToTileSideLink(page, 'Create Supplier', testInfo);

  await test.step("Enter Supplier Details", async () => {
    await forms.fillTextboxByName(page, "Supplier", data["Supplier"]);
    await forms.selectComboboxByName(page, "Business Relationship", data["Business Relationship"]);
    await forms.selectComboboxByName(page, "Tax Organization Type", data["Tax Organization Type"]);
    await forms.fillComboboxByName(page, "Tax Country", data["Tax Country"]);
    await forms.fillTextboxByName(page, "Tax Registration Number", data["Tax Registration Number"]);
    await forms.fillTextboxByName(page, "Taxpayer ID", data["Taxpayer ID"]);
    await forms.fillTextboxByName(page, "D-U-N-S Number", data["D-U-N-S Number"]);

    if (testInfo) {
      await testInfo.attach("Supplier details filled", { body: await page.screenshot(), contentType: 'image/png' });
    }
  });
}

export async function submitSupplier(page: Page, testInfo?: TestInfo) {
    await forms.clickButtonByName(page, 'Create');

    const errorMsg = page.getByText("Error");
    if (await errorMsg.isVisible()) {
      const errorText = (await errorMsg.allTextContents()).join(" ");
      if (testInfo) {
        await testInfo.attach(errorText, { body: await page.screenshot(), contentType: 'image/png' });
      }
      throw Error(`Failed to create supplier (${errorText})`)
    } 
    if (testInfo) {
      await testInfo.attach(`Supplier submitted`, { body: await page.screenshot(), contentType: 'image/png' });
    }
}

export function generateFakeSupplier() {    
  let newSupplier: Record<string, any> = {};

  newSupplier["Supplier"] = faker.company.name().substring(0, 30); // Limit to 30 characters
  newSupplier["Business Relationship"] = faker.helpers.arrayElement(['Prospective', 'Spend Authorized']);
  newSupplier["Tax Organization Type"] = faker.helpers.arrayElement(["Corporation",
                                                                      "Individual",
                                                                      "Government Agency",
                                                                      "Partnership",
                                                                      "Foreign Corporation",
                                                                      "Foreign Government Agency",
                                                                      "Foreign Individual",
                                                                      "Foreign Partnership"]);
  let taxCountry = faker.helpers.arrayElement([['France', 'FR'],
                                               ['United States', 'FR'], 
                                               ['Canada', 'CA'], 
                                               ['Australia', 'AU']]);
  newSupplier["Tax Country"] = taxCountry[0];
  newSupplier["Tax Registration Number"] = taxCountry[1] + '-' + faker.number.int({ min: 0, max: 999999 }).toFixed().padStart(6, "0");
  newSupplier["Taxpayer ID"] = faker.word.adjective({ length: { min: 5, max: 30 }});
  newSupplier["D-U-N-S Number"] = faker.number.int({ min: 0, max: 999999999 }).toFixed().padStart(9, "0");
  
  return newSupplier;
}
