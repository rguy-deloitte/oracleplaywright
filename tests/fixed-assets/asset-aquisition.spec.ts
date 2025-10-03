import test from '@playwright/test';
import * as csTest from './asset'

test.slow();
let assetItems: any[] = [];



// *** Note *** Login handled in auth.setup.ts
test.describe.configure({ mode: 'serial' });  // Required to ensure tests run in expected order and that beforeAll & afterAll only run once

// test.beforeAll(async ({ playwright }) => {

//     assetItems = await csTest.fakeData(5);
// });

test.describe('Asset Aquisitionn Tests', async () => {
    
    let index = 0;
    assetItems = await csTest.fakeData(2);
    assetItems.forEach((assetItem) => {
        console.log(`Processing Asset: ${assetItem.Asset}`);
        test(`Process Asset: ${index}`, async ({ page }, testInfo) => {
            console.log(`Running test for asset aquisition: ${assetItem.Asset}`);
            await csTest.createAsset(page, testInfo, assetItem, index);
        });
        index++; 
    });


type assetItem = {
    Customer: string;
    "Name": string;
    "xxx": string;
    "xxx": string;
    "xxx": string;
};
});