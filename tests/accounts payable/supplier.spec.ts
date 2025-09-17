
import test from '@playwright/test';
import * as csTest from './create-supplier'

test.slow();
let supplierItems: any[] = [];

// test.beforeAll(async ({ page }) => {
//     // const context = await browser.newContext({
//     //     // Comment out or remove storageState if you don't have .auth/auth-state.json
//     //     storageState: '../auth/auth-state.json'
//     // });
//     // const page = await context.newPage();
//     console.log('Generating supplier data...');
//     supplierItems = await csTest.fakeData(5);
//     console.log(supplierItems?.length + ' suppliers generated ');

//     await fire();
// });


test.describe('Supplier Tests', async () => {
    
    console.log('Generating supplier data...');
    supplierItems = await csTest.fakeData(5);
    console.log(supplierItems?.length + ' suppliers generated ');
    let index = 0;
    // for (let index = 0; index < supplierItems.length; index++) { 
    for await (const supplierItem of supplierItems) {
        test(`Process Supplier: ${supplierItem.Supplier}`, async ({ page }, testInfo) => {
            console.log(`Running test for supplier: ${supplierItem.Supplier}`);
            await csTest.createSupplier(page, testInfo, supplierItem, index);
        });
        index++
    }
}); 


type SupplierItem = {
    Supplier: string;
    "Business Relationship": string;
    "Tax Organization Type": string;
    // "Tax Country": string;
    // "Currency": string;
    // "Paid Up": string;
};