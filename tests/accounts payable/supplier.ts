import { expect, test } from '@playwright/test';
import path from 'path';
import * as navUtil from '../util/navigation';
import * as form from '../util/form';
import { faker } from '@faker-js/faker';
import { assert } from 'console';
const authFile = path.join(__dirname, '../.auth/auth-state.json');
test.use({ storageState: authFile });



export async function createSupplier(page: any, testInfo: any, supplierItem: any, i: number) {
    console.log(`Create Supplier: ${i}`);
    await navUtil.navigateToHomePage(page);
    await navUtil.navigateToTile(page, 'Procurement', testInfo);
    await navUtil.navigateToTileLink(page, 'Suppliers', testInfo);
    await navUtil.navigateToTileSideLink(page, 'Create Supplier', testInfo);



    await form.setFormFieldValue(page, 'Supplier', supplierItem.Supplier);
    await form.setFormSelectValue(page, 'Business Relationship', supplierItem["Business Relationship"]);
    await form.setFormSelectValue(page, 'Tax Organization Type', supplierItem["Tax Organization Type"]);

    await form.submit(page, 'Create');
    await page.waitForLoadState('networkidle');

    // REFINE this please .. 
    const errorMsg = await page.getByText("Error");
    if (await errorMsg.isVisible()) {
        assert(false,'Error creating supplier');
        await testInfo.attach(`Error Message`, { body: await page.screenshot(), contentType: 'image/png' });
    } else {
        assert(true,'Supplier created successfully');
        console.log("Supplier Created Successfully");
    }


    // expect(page.locator(`a:has-text("${supplierItem.Supplier}")`)).toBeVisible();


    // / Select the label for "Supplier" (optional, for demonstration)


    //

    await testInfo.attach(`Enter Supplier`, { body: await page.screenshot(), contentType: 'image/png' });
}


export async function fakeData(count: number) {
    const items = [];
    for (let i = 0; i < count; i++) {
        items.push({
            Supplier: faker.company.name().substring(0, 30), // Limit to 30 characters
            "Business Relationship": faker.helpers.arrayElement(['Prospective', 'Spend Authorized']),
            "Tax Organization Type": faker.helpers.arrayElement(["Corporation",
                "Individual",
                "Government Agency",
                "Partnership",
                "Foreign Corporation",
                "Foreign Government Agency",
                "Foreign Individual",
                "Foreign Partnership",
                "Charities and Nonprofits",
                "Employee",
                "Other" ]),
            "Tax Country": faker.helpers.arrayElement(['United Kingdom', 'France', 'United States', 'Canada', 'Australia']),
            "D-U-N-S Number": faker.number.int({ min: 100000000, max: 999999999 }).toString(),
            // "Tax Country": 'United States',
            // "Currency": 'USD',
            // "Paid Up": '1000',
        });
        
    }
    return items
}
