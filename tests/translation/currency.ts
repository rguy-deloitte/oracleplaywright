import { test, expect, type APIRequestContext } from '@playwright/test';
import path from 'path';
import * as navUtil from '../util/navigation';
import * as form from '../util/form';
const authFile = path.join(__dirname, '../.auth/auth-state.json');
test.use({ storageState: authFile });

export async function navigate(page: any, testInfo: any, setupData: Record<string, any>) {
    await navUtil.navigateToHomePage(page);
    await navUtil.navigateToTile(page, 'Tools', testInfo);
    await navUtil.navigateToTileLink(page, 'Scheduled Processes', testInfo);
    await form.buttonClick(page, 'Schedule New Process');
    await form.comboFillAndEnter(page, 'Name', setupData['newProcessName']);
    await form.buttonClick(page, 'OK');
}

export async function translateGLAccountBalances(page: any, testInfo: any, setupData: Record<string, any>, rowData: Record<string, any>, i: number) {
    await form.setFormSelectValue(page, 'Data Access Set', setupData['dataAccessSet']);
    await form.setFormSelectValue(page, 'Ledger or Ledger Set', setupData['ledgerOrLedgerSet']);
    await form.setFormSelectValue(page, 'Target Currency', setupData['targetCurrency']);
    await form.setFormSelectValue(page, 'Accounting Period', rowData['accountingPeriods']);
    await form.comboFillAndEnter(page, 'Balancing Segment', rowData['balancingSegment']);
}

export async function translateGLAccountBalancesGGP(page: any, testInfo: any, setupData: Record<string, any>, rowData: Record<string, any>, i: number) {
    await form.setFormSelectValue(page, 'Data Access Set', rowData['DATA_ACCESS_SET']);
    await form.setFormSelectValue(page, 'Ledger or Ledger Set', rowData['LEDGER_NAME']);
    await form.setFormSelectValue(page, 'Target Currency', rowData['TARGET_CURRENCY']);
    await form.setFormSelectValue(page, 'Accounting Period', rowData['PERIOD']);
    if (rowData['BALANCING_SEGMENT']) {
        await form.comboFillAndEnter(page, 'Balancing Segment', rowData['BALANCING_SEGMENT']);
    }
}

export async function transferLedgerBalances(page: any, testInfo: any, setupData: Record<string, any>, rowData: Record<string, any>, i: number) {
    await form.comboFillAndEnter(page, 'Source Ledger', rowData['Source Ledger'], 'Search and Select: Source Ledger');
    await form.comboFillAndEnter(page, 'Target Ledger', rowData['Target Ledger']);
    await form.setFormSelectValue(page, 'Chart of Accounts Mapping', setupData['CoA Mapping']);
    await form.setFormSelectValue(page, 'Amount Type', setupData['Amount Type']);
    await form.setFormSelectValue(page, 'Source Ledger Period', rowData['Source Ledger Period']);
    await form.setFormSelectValue(page, 'Target Ledger Period', rowData['Target Ledger Period']);
    await form.setFormCheckBox(page, 'Run Journal Import', setupData['Run Journal Import'].toLowerCase() == 'true');
    await form.setFormCheckBox(page, 'Create Summary Journals', setupData['Create Summary Journals'].toLowerCase() == 'true');
    await form.setFormCheckBox(page, 'Run Automatic Posting', setupData['Run Automatic Posting'].toLowerCase() == 'true');
}

export async function confirmProcessCompletion(page: any, testInfo: any, apiContext: APIRequestContext, setupData: Record<string, any>, rowData: Record<string, any>, testLoopStartTime: Date, testLoopEndTime: Date) {
    await form.buttonClick(page, 'Submit');

    const processSubmittedMessage = await page.getByText(/Process \d+ was submitted\./).textContent();
    const processNumber = processSubmittedMessage?.match(/^Process (\d+) was submitted\.$/)?.[1];
    await testInfo.attach(`${rowData['Source Ledger']} Final Screen (submitted)...`, { body: await page.screenshot(), contentType: 'image/png' });
    await page.getByRole('button', { name: 'OK' }).click();

    if (processNumber) {
        let jobStatus, jobStatusJson, jobRequestStatus = '';
        do {
            await page.waitForTimeout(10000);
            jobStatus = await apiContext.get('./erpintegrations', { params: `?finder=ESSJobStatusRF;requestId=${processNumber}` })
                .catch((e) => console.log('Error with api call:', e));
            jobStatusJson = await jobStatus?.json();
            jobRequestStatus = jobStatusJson.items[0].RequestStatus;
        } while (!['SUCCEEDED', 'CANCELED', 'ERROR', 'ERROR MANUAL RECOVERY', 'EXPIRED', 'FINISHED', 'HOLD', 'VALIDATION FAILED', 'WARNING'].includes(jobRequestStatus));  // See: https://docs.oracle.com/en/cloud/saas/applications-common/25c/oacpr/statuses-of-scheduled-processes.html

        testLoopEndTime = new Date();

        const runResults = { 
            rowData: rowData,
            processNumber: processNumber,
            testLoopStartTime: testLoopStartTime,
            testLoopEndTime: testLoopEndTime,
            requestStatus: jobRequestStatus 
        };
        await testInfo.attach('Run Results', { body: JSON.stringify(runResults, null, 2), contentType: 'application/json' }); 
        return runResults;
    } else {
        throw new Error('Process number not found in the submission confirmation message.');
    }
}
