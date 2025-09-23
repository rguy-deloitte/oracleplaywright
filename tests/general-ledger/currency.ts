import { expect, test } from '@playwright/test';
import path from 'path';
import * as navUtil from '../util/navigation';
import * as form from '../util/form';
import { faker } from '@faker-js/faker';
import { assert } from 'console';
const authFile = path.join(__dirname, '../.auth/auth-state.json');
test.use({ storageState: authFile });

export async function translateGL(page: any, testInfo: any, setupData: any[], rowData: any[], i: number) {

    await navUtil.navigateToHomePage(page);
    await navUtil.navigateToTile(page, 'Tools', testInfo);
    await navUtil.navigateToTileLink(page, 'Scheduled Processes', testInfo);
    await form.buttonClick(page, 'Schedule New Process');
    await form.comboFillAndEnter(page, 'Name', setupData[1]);
    await form.buttonClick(page, 'OK');

    await page.getByLabel('Data Access Set').click(); // <-- Odd.... but it ain't working without this!
    await form.setFormSelectValue(page, 'Data Access Set', setupData[2]);
    await form.setFormSelectValue(page, 'Ledger or Ledger Set', setupData[3]);
    await form.setFormSelectValue(page, 'Target Currency', setupData[4]);
    await form.setFormSelectValue(page, 'Accounting Period', rowData[0]);
    await form.comboFillAndEnter(page, 'Balancing Segment', rowData[1]);
}

export async function transferLedgerBalances(page: any, testInfo: any, setupData: any[], rowData: any[], i: number) {
    await navUtil.navigateToHomePage(page);
    await navUtil.navigateToTile(page, 'Tools', testInfo);
    await navUtil.navigateToTileLink(page, 'Scheduled Processes', testInfo);
    await form.buttonClick(page, 'Schedule New Process');
    await form.comboFillAndEnter(page, 'Name', setupData[1]);
    await form.buttonClick(page, 'OK');

    await form.comboFillAndEnter(page, 'Source Ledger', rowData[0]);
    await form.comboFillAndEnter(page, 'Target Ledger', rowData[1]);

    await form.setFormSelectValueRG(page, 'Chart of Accounts Mapping', setupData[4]);
    await form.setFormSelectValue(page, 'Amount Type', setupData[5]);
    await form.setFormSelectValue(page, 'Source Ledger Period', rowData[2]);
    await form.setFormSelectValue(page, 'Target Ledger Period', rowData[2]);
    await form.setFormCheckBox(page, 'Run Journal Import', setupData[6].toLowerCase() == 'true');
    await form.setFormCheckBox(page, 'Create Summary Journals', setupData[7].toLowerCase() == 'true');
    await form.setFormCheckBox(page, 'Run Automatic Posting', setupData[8].toLowerCase() == 'true');
    // // await form.comboFillAndEnter(page, 'Legal Entity', setupData[6])
}
