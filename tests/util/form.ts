

export async function setFormFieldValue(page: any, labelText: string, value: string) {
    const supplierLabel = await page.locator('label').getByText(labelText, { exact: true });
    // await supplierLabel.click(); // Optional: interact with the label
    const labelForId = cssEscape(await supplierLabel.getAttribute('for'));
    console.log(`Label 'for' attribute: ${labelForId}`);
    const inputField = await page.locator(`input#${labelForId}`)
    await inputField.fill(value);
}

export async function setFormSelectValue(page: any, labelText: string, value: string) {
    const supplierLabel = await page.locator('label').getByText(labelText, { exact: true });
    // await supplierLabel.click(); // Optional: interact with the label
    const labelForId = cssEscape(await supplierLabel.getAttribute('for'));
    console.log(`Label 'for' attribute: ${labelForId}`);
    const selectField = await page.locator(`select#${labelForId}`)
    await selectField.selectOption(value);
}

export async function setFormSelectIndex(page: any, labelText: string, index: string) {
    const supplierLabel = await page.locator('label').getByText(labelText, { exact: true });
    // await supplierLabel.click(); // Optional: interact with the label
    const labelForId = cssEscape(await supplierLabel.getAttribute('for'));
    console.log(`Label 'for' attribute: ${labelForId}`);
    const selectField = await page.locator(`select#${labelForId}`)
    await selectField.selectOption({ index: parseInt(index) });
}


function cssEscape(ident: string) {
    return ident.replace(/([ !"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~])/g, '\\$1');
}