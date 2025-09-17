
import test from '@playwright/test';
import * as csTest from './supplier'

test.slow();
let supplierItems: any[] = [];



// *** Note *** Login handled in auth.setup.ts
test.describe.configure({ mode: 'serial' });  // Required to ensure tests run in expected order and that beforeAll & afterAll only run once

// test.beforeAll(async ({ playwright }) => {

//     supplierItems = await csTest.fakeData(5);
// });

test.describe('Supplier Tests', async () => {
    
    let index = 0;
    supplierItems = await csTest.fakeData(2);
    supplierItems.forEach((supplierItem) => {
        console.log(`Processing supplier: ${supplierItem.Supplier}`);
        test(`Process Supplier: ${index}`, async ({ page }, testInfo) => {
            
            console.log(`Running test for supplier: ${supplierItem.Supplier}`);
            await csTest.createSupplier(page, testInfo, supplierItem, index);

            
        });
        index++; 
    });
})


type SupplierItem = {
    Supplier: string;
    "Business Relationship": string;
    "Tax Organization Type": string;
};