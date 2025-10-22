import { expect, test } from '@playwright/test';
import path from 'path';
import * as navUtil from '../util/navigation';
import * as form from '../util/form';
import { faker } from '@faker-js/faker';
import { assert } from 'console';
const authFile = path.join(__dirname, '../.auth/auth-state.json');
test.use({ storageState: authFile });


export async function navigateToReport(page: any, testInfo: any, reportName: any) {
    console.log(`Navigate to Report: ${reportName}`);
    await navUtil.navigateToHomePage(page);
    await navUtil.navigateToTile(page, 'Others', testInfo);
    await navUtil.navigateByRef(page, 'div[filmstrip="Financial Reporting Center"]', testInfo);
    // Wait for new page to open when clicking Browse Catalog
    const [newPage] = await Promise.all([
        page.context().waitForEvent('page'),
        navUtil.clickButtonByName(page, 'Browse Catalog', testInfo)
    ]);
    
    // Wait for the new page to load completely
    await newPage.waitForLoadState('networkidle');
    await testInfo.attach(`Report Catalog`, { body: await newPage.screenshot(), contentType: 'image/png' });
    
    const startTime = Date.now();
    // add the paramter for report name

    // performance bench march ... 
    // exeuction time in seconds.. 
     // write .. 

}

