import test from '@playwright/test';
import * as csTest from './customer'

test.slow();
let customerItems: any[] = [];



// *** Note *** Login handled in auth.setup.ts
test.describe.configure({ mode: 'serial' });  // Required to ensure tests run in expected order and that beforeAll & afterAll only run once


test.describe('Customer Tests', async () => {
    
    let index = 0;
    customerItems = await csTest.fakeData(2);
    customerItems.forEach((customerItem) => {
        console.log(`Processing Customer: ${customerItem.Customer}`);
        test(`Process Customer: ${index}`, async ({ page }, testInfo) => {
            console.log(`Running test for customer: ${customerItem.Customer}`);
            await csTest.createCustomer(page, testInfo, customerItem, index);
        });
        index++; 
    });


type CustomerItem = {
    Customer: string;
    "Name": string;
    "Account Address Set": string;
    "Address Line 1": string;
    "City or Town": string;
};
});