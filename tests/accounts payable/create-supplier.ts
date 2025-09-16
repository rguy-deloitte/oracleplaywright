import { expect, test } from '@playwright/test';
import path from 'path';
import * as navUtil from '../util/navigation';
import * as form from '../util/form';
const authFile = path.join(__dirname, '../.auth/auth-state.json');
test.use({ storageState: authFile });



export async function createSupplier(page: any, testInfo: any, supplierItem: any, i: number) {
    console.log(`Create Supplier: ${i}`);
    await navUtil.navigateToHomePage(page);
    await navUtil.navigateToTile(page, 'Procurement', testInfo);
    await navUtil.navigateToTileLink(page, 'Suppliers', testInfo);
    await navUtil.navigateToTileSideLink(page, 'Create Supplier', testInfo);



    form.setFormFieldValue(page, 'Supplier', supplierItem.Supplier);
    form.setFormSelectValue(page, 'Business Relationship', supplierItem["Business Relationship"]);
    form.setFormSelectIndex(page, 'Tax Organization Type', supplierItem["Tax Organization Type"]);
    form.submit(page,'Create');
    page.waitForLoadState('networkidle');


    //
    // await page.getByText('Error').waitFor();
    await expect(await page.getByText("Error")).not.toBeVisible();

    // expect(page.locator(`a:has-text("${supplierItem.Supplier}")`)).toBeVisible();
    

    // / Select the label for "Supplier" (optional, for demonstration)
    

    //

    await testInfo.attach(`Enter Supplier`, { body: await page.screenshot(), contentType: 'image/png' });
}




// pt1:_FOr1:1:_FONSr2:0:_FOTRaT:0:dynam1:0:it1::content
// pt1:_FOr1:1:_FONSr2:0:_FOTRaT:0:dynam1:0:it1::content
// pt1:_FOr1:1:_FONSr2:0:_FOTRaT:0:dynam1:0:it1