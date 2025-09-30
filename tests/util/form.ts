

export async function setFormFieldValue(page: any, labelText: string, value: string) {
    const supplierLabel = await page.locator('label').getByText(labelText, { exact: true });
    const labelForId = cssEscape(await supplierLabel.getAttribute('for'));
    const inputField = await page.locator(`input#${labelForId}`)
    await inputField.fill(value);
}

// 25 Sept 2025: This has been substituted with the simplified version below. It can be deleted soon if everything still works
export async function setFormSelectValueTD(page: any, labelText: string, value: string) {
    // await page.waitForTimeout(10000);
    // await page.waitForLoadState('networkidle');
    // await page.waitForTimeout(10000);
    await page.waitForLoadState('domcontentloaded');
    const supplierLabel = await page.locator('label').getByText(labelText, { exact: true });
    // await supplierLabel.click(); // Optional: interact with the label
    const labelForId = cssEscape(await supplierLabel.getAttribute('for'));
    const selectField = await page.locator(`select#${labelForId}`)
    await selectField.selectOption(value);
    await page.waitForLoadState('domcontentloaded');
}

export async function setFormSelectValue(page: any, labelText: string, value: string) {
    const locator = page.getByLabel(labelText, { exact: true });
    await locator.click(); // Ensure the dropdown is focused
    // await page.waitForTimeout(1000); // Optional: wait for any animations or loading  
    await locator.selectOption(value);

    // Trying to resolve the bug version:
    /*
    console.log(labelText, value);
    // await page.waitForLoadState('networkidle');
    await page.getByLabel(labelText, { exact: true }).selectOption({ index: 0 });
    await page.getByLabel(labelText, { exact: true }).selectOption({ index: 1 });
    await page.getByLabel(labelText, { exact: true }).selectOption({ index: 2 });

    await page.getByLabel(labelText, { exact: true }).selectOption(value);
    // await page.waitForTimeout(10000);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');
    console.log('wait for start ...')
    await page.waitForTimeout(1000)
    console.log('wait for end ...')
    */
}

export async function setFormCheckBox(page: any, labelText: string, value: boolean) {
    await page.getByText(labelText, { exact: true}).setChecked(value);
}

export async function setFormSelectIndex(page: any, labelText: string, index: string) {
    const supplierLabel = await page.locator('label').getByText(labelText, { exact: true });
    // await supplierLabel.click(); // Optional: interact with the label
    const labelForId = cssEscape(await supplierLabel.getAttribute('for'));
    const selectField = await page.locator(`select#${labelForId}`)
    await selectField.selectOption({ index: parseInt(index) });
}

export async function buttonClick(page: any, labelText: string) {
    await page.getByRole('button', { name: labelText, exact: true }).click();
    // await page.locator('button').getByText(labelText, { exact: true }).click();  <-- Didn't work when I tried it
}

export async function comboFillAndEnter(page: any, labelText: string, value: string) {
    const comboBox = await page.getByRole('combobox', { name: labelText, exact: true });
    await comboBox.click();
    await comboBox.fill(value);
    await comboBox.press('Enter');
}

export async function submit(page: any, labelText: string = 'Create') {
    const submitButton = await page.locator('button').getByText(labelText, { exact: true });
    await submitButton.click();
}

function cssEscape(ident: string) {
    return ident.replace(/([ !"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~])/g, '\\$1');
}