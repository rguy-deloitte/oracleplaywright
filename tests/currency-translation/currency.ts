import { test, expect, type APIRequestContext } from '@playwright/test';
import path from 'path';
import * as navUtil from '../util/navigation';
import * as form from '../util/form';
const authFile = path.join(__dirname, '../.auth/auth-state.json');
test.use({ storageState: authFile });

export async function navigate(page: any, testInfo: any, setupData: any[]) {
    await navUtil.navigateToHomePage(page);
    await navUtil.navigateToTile(page, 'Tools', testInfo);
    await navUtil.navigateToTileLink(page, 'Scheduled Processes', testInfo);
    await form.buttonClick(page, 'Schedule New Process');
    await form.comboFillAndEnter(page, 'Name', setupData[1]);
    await form.buttonClick(page, 'OK');
}

export async function translateGLAccountBalances(page: any, testInfo: any, setupData: any[], rowData: any[], i: number) {
    await page.getByLabel('Data Access Set').click(); // <-- Odd.... but it ain't working without this!
    await form.setFormSelectValue(page, 'Data Access Set', setupData[2]);
    await form.setFormSelectValue(page, 'Ledger or Ledger Set', setupData[3]);
    await form.setFormSelectValue(page, 'Target Currency', setupData[4]);
    await form.setFormSelectValue(page, 'Accounting Period', rowData[0]);
    await form.comboFillAndEnter(page, 'Balancing Segment', rowData[1]);
}

export async function transferLedgerBalances(page: any, testInfo: any, setupData: any[], rowData: any[], i: number) {
    await form.comboFillAndEnter(page, 'Source Ledger', rowData[0]);
    await form.comboFillAndEnter(page, 'Target Ledger', rowData[1]);
    await form.setFormSelectValue(page, 'Chart of Accounts Mapping', setupData[4]);
    await form.setFormSelectValue(page, 'Amount Type', setupData[5]);
    await form.setFormSelectValue(page, 'Source Ledger Period', rowData[2]);
    await form.setFormSelectValue(page, 'Target Ledger Period', rowData[2]);
    await form.setFormCheckBox(page, 'Run Journal Import', setupData[6].toLowerCase() == 'true');
    await form.setFormCheckBox(page, 'Create Summary Journals', setupData[7].toLowerCase() == 'true');
    await form.setFormCheckBox(page, 'Run Automatic Posting', setupData[8].toLowerCase() == 'true');
    // await form.comboFillAndEnter(page, 'Legal Entity', setupData[6])
}

export async function confirmProcessCompletion(page: any, testInfo: any, apiContext: APIRequestContext, setupData: any[], rowData: any[], testLoopStartTime: Date, testLoopEndTime: Date) {
    await form.buttonClick(page, 'Submit');

    const processSubmittedMessage = await page.getByText(/Process \d+ was submitted\./).textContent();
    const processNumber = processSubmittedMessage?.match(/^Process (\d+) was submitted\.$/)?.[1];
    await testInfo.attach(`${rowData[0]} Final Screen (submitted)...`, { body: await page.screenshot(), contentType: 'image/png' });
    await page.getByRole('button', { name: 'OK' }).click();

    if (processNumber) {
        let jobStatus, jobStatusJson, jobRequestStatus = '';
        do {
        await page.waitForTimeout(1000);
        jobStatus = await apiContext.get('./erpintegrations', { params: `?finder=ESSJobStatusRF;requestId=${processNumber}` })
            .catch((e) => console.log('Error with api call:', e));
        jobStatusJson = await jobStatus.json();
        jobRequestStatus = jobStatusJson.items[0].RequestStatus;
        } while (!['SUCCEEDED', 'CANCELED', 'ERROR', 'ERROR MANUAL RECOVERY', 'EXPIRED', 'FINISHED', 'HOLD', 'VALIDATION FAILED', 'WARNING'].includes(jobRequestStatus));  // See: https://docs.oracle.com/en/cloud/saas/applications-common/25c/oacpr/statuses-of-scheduled-processes.html

        testLoopEndTime = new Date();
        return { 
            rowData: [rowData[0], rowData[1], processNumber, testLoopStartTime, testLoopEndTime, jobRequestStatus],
            result: jobRequestStatus 
        };
    } else {
        throw new Error('Process number not found in the submission confirmation message.');
    }
}
