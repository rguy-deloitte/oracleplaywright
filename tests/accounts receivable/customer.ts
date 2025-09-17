import { expect, test } from '@playwright/test';
import path from 'path';
import * as navUtil from '../util/navigation';
import * as form from '../util/form';
import { faker } from '@faker-js/faker';
import { assert } from 'console';
const authFile = path.join(__dirname, '../.auth/auth-state.json');
test.use({ storageState: authFile });



export async function createCustomer(page: any, testInfo: any, customerItem: any, i: number) {
    console.log(`Create Customer: ${i}`);
    await navUtil.navigateToHomePage(page);
    await navUtil.navigateToTile(page, 'Receivables', testInfo);
    await navUtil.navigateToTileLink(page, 'Manage Customers', testInfo);
    await navUtil.navigateToTileSideLink(page, 'Create', testInfo);



    await form.setFormFieldValue(page, 'Name', customerItem.Customer);
    await form.setFormSelectValue(page, 'Account Adress Set', customerItem["Account Adress Set"]);
    await form.setFormSelectValue(page, 'Address Line 1', customerItem["Address Line 1"]);
    await form.setFormSelectValue(page, 'City or Town', customerItem["City or Town"]);

    await form.submit(page, 'Create');
    await page.waitForLoadState('networkidle');

    // REFINE this please .. 
    const errorMsg = await page.getByText("Error");
    if (await errorMsg.isVisible()) {
        assert(false,'Error creating customer');
        await testInfo.attach(`Error Message`, { body: await page.screenshot(), contentType: 'image/png' });
    } else {
        assert(true,'Customer created successfully');
        console.log("Customer Created Successfully");
    }


    // expect(page.locator(`a:has-text("${supplierItem.Supplier}")`)).toBeVisible();


    // / Select the label for "Supplier" (optional, for demonstration)


    //

    await testInfo.attach(`Enter Customer`, { body: await page.screenshot(), contentType: 'image/png' });
}


export async function fakeData(count: number) {
    const items = [];
    for (let i = 0; i < count; i++) {
        items.push({
            Supplier: faker.company.name().substring(0, 30), // Limit to 30 characters
            "Name": faker.helpers.arrayElement(['Customer 1', 'Customer 99']),
            "Account Address Set": faker.helpers.arrayElement(["ACE CORP Data Set",
                "ACE_1",
                "ACE_PAYMENT_RDS",
                "ADECA Reference Set",
                "75 Sales",
                "75 Human Resources",
                "5355",
                "Other" ]),
            "Address Line 1": faker.helpers.arrayElement(['United Kingdom', 'France', 'United States', 'Canada', 'Australia']),
            "D-U-N-S Number": faker.number.int({ min: 100000000, max: 999999999 }).toString(),
            // "Tax Country": 'United States',
            // "Currency": 'USD',
            // "Paid Up": '1000',
        });
        
    }
    return items
}
