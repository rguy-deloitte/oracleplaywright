
import test from '@playwright/test';
import * as csTest from './create-supplier'

test.slow();
let supplierItems: any[] = [];

// test('Create Suppliers', async ({ page }, testInfo) => {
//     console.log('Generating supplier data...');
// });

test.describe('Supplier Tests', async () => {
    
    console.log('Generating supplier data...');
    supplierItems = await csTest.fakeData(5);
    console.log(supplierItems?.length + ' suppliers generated ');
    let index = 0;
    for (const supplierItem of supplierItems) {
        console.log(`Processing supplier: ${supplierItem.Supplier}`);
        await test(`Process Supplier: ${supplierItem.Supplier}`, async ({ page }, testInfo) => {
            console.log(`Running test for supplier: ${supplierItem.Supplier}`);
            await csTest.createSupplier(page, testInfo, supplierItem, index);
        });
        index++; 
    }
})


type SupplierItem = {
    Supplier: string;
    "Business Relationship": string;
    "Tax Organization Type": string;
    // "Tax Country": string;
    // "Currency": string;
    // "Paid Up": string;
};