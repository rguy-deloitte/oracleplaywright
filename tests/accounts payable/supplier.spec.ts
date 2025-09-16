
import test from '@playwright/test';
import * as csTest from './create-supplier'
import path from 'path';
import * as loginSetup from '../auth.setup';

// Array of supplier objects to test
const supplierItems: SupplierItem[] = [
    {
        "Supplier": 'Auto Test Supplier',
        "Business Relationship": 'Prospective',
        "Tax Organization Type": '1',
    }
    // {
    //     name: 'Another Supplier',
    //     businessRelationship: '2',
    //     taxOrganizationType: '1',
    //     taxCountry: 'United States',
    //     currency: 'USD',
    //     paidUp: '20000'
    // }
    // Add more supplier objects as needed
];

test.slow();




// Fire tests for each supplier
supplierItems.forEach((supplierItem, index) => {

    test(`Process Supplier: ${supplierItem.Supplier}`, async ({ page }, testInfo) => {
        console.log(`Running test for supplier: ${index} ::  ${supplierItem.Supplier}`);
        await csTest.createSupplier(page, testInfo, supplierItem, index);
    })

    // create 
    // raise an invoice 
    // pay an invoice 
    // run a report 
});

type SupplierItem = {
    Supplier: string;
    "Business Relationship": string;
    "Tax Organization Type": string;
    // "Tax Country": string;
    // "Currency": string;
    // "Paid Up": string;
};