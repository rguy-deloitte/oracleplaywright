import { expect, test } from '@playwright/test';
import path from 'path';
import * as navUtil from '../util/navigation';
import * as form from '../util/form';
import { faker } from '@faker-js/faker';
import { assert } from 'console';
const authFile = path.join(__dirname, '../.auth/auth-state.json');
test.use({ storageState: authFile });



export async function createAsset(page: any, testInfo: any, assetItem: any, i: number) {
    console.log(`Create Asset: ${i}`);
    await navUtil.navigateToHomePage(page);
    await navUtil.navigateToTile(page, 'Supply Chain Execution', testInfo);
    await navUtil.navigateToTileLink(page, 'Asset Information Management', testInfo);
    await navUtil.navigateToTileSideLink(page, 'xxx', testInfo);



    await form.setFormFieldValue(page, 'Name', assetItem.Asset);
    await form.setFormSelectValue(page, 'Account Adress Set', assetItem["Account Adress Set"]);
    await form.setFormSelectValue(page, 'Address Line 1', assetItem["Address Line 1"]);
    await form.setFormSelectValue(page, 'City or Town', assetItem["City or Town"]);

    await form.submit(page, 'Create');
    await page.waitForLoadState('networkidle');

    // REFINE this please .. 
    const errorMsg = await page.getByText("Error");
    if (await errorMsg.isVisible()) {
        assert(false,'Error creating asset');
        await testInfo.attach(`Error Message`, { body: await page.screenshot(), contentType: 'image/png' });
    } else {
        assert(true,'Asset created successfully');
        console.log("Asset Created Successfully");
    }


    // expect(page.locator(`a:has-text("${assetItem.Asset}")`)).toBeVisible();


    // / Select the label for "Supplier" (optional, for demonstration)


    //

    await testInfo.attach(`Enter Asset`, { body: await page.screenshot(), contentType: 'image/png' });
}


export async function fakeData(count: number) {
    const items = [];
    for (let i = 0; i < count; i++) {
        items.push({
            Customer: faker.person.fullName(),
            "Name": faker.name.arrayElement(),
            "Address Line 1": faker.location.streetAddress(),
            "City or Town": faker.location.city(),
            "Account Address Set": faker.name.arrayElement(['Primary', 'Secondary']),
            
            // "Tax Country": 'United States',
            // "Currency": 'USD',
            // "Paid Up": '1000',
        });
        
    }
    return items
}
