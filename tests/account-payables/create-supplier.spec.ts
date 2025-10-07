import test from '@playwright/test';
import * as navigation from '../util/navigation';
import { fillSupplierDetails, generateFakeSupplier, submitSupplier } from './supplier';
import { clickButtonByName } from '../util/form';


test.describe.configure({ mode: 'serial' });  // Required to ensure tests run in expected order and that beforeAll & afterAll only run once

test.describe('Create new supplier', async () => {
  test.beforeEach(async ({ page }, testInfo) => {
    // Navigate to Journals page
    await navigation.navigateToHomePage(page, testInfo);
    await navigation.navigateToTile(page, 'Procurement', testInfo);
    await navigation.navigateToTileLink(page, 'Suppliers', testInfo);
  });

  let nRepeats = 3;

  for (let supplierNo = 0; supplierNo < nRepeats; supplierNo++) {
    let testName = "Save fake supplier";
    if (nRepeats > 1) { testName += ` (Repeat ${supplierNo+1}/${nRepeats})`; }

    const supplierData = generateFakeSupplier();

    test(testName, async ({ page }, testInfo) => {
      await fillSupplierDetails(page, supplierData, testInfo);

      await clickButtonByName(page, 'Create');

      // const errorMsg = page.getByText("Error");
      // if (await errorMsg.isVisible()) {
      //   if (testInfo) {
      //     await testInfo.attach(`Error Message`, { body: await page.screenshot(), contentType: 'image/png' });
      //   }
      //   throw Error("Failed to create supplier")
      // } 
      // if (testInfo) {
      //   await testInfo.attach(`Supplier submitted`, { body: await page.screenshot(), contentType: 'image/png' });
      // }
  
      await submitSupplier(page, testInfo);
    });
  }

  test("Save without supplier name", async ({ page }, testInfo) => {
    const supplierData = generateFakeSupplier();
    delete supplierData['Supplier'];

    await fillSupplierDetails(page, supplierData, testInfo);

    await submitSupplier(page, testInfo);
  });

  test("Save without business relationship", async ({ page }, testInfo) => {
    const supplierData = generateFakeSupplier();
    delete supplierData['Business Relationship'];

    await fillSupplierDetails(page, supplierData, testInfo);

    await submitSupplier(page, testInfo);
  });

  test("Save without tax organisation type", async ({ page }, testInfo) => {
    const supplierData = generateFakeSupplier();
    delete supplierData["Tax Organization Type"];

    await fillSupplierDetails(page, supplierData, testInfo);

    await submitSupplier(page, testInfo);
  });

  test("Save with wrong tax registration number country code", async ({ page }, testInfo) => {
    const supplierData = generateFakeSupplier();
    supplierData["Tax Country"] = "United Kingdom";

    await fillSupplierDetails(page, supplierData, testInfo);

    await submitSupplier(page, testInfo);
  });
});
