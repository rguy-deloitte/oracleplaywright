import { Locator, Page, expect } from "@playwright/test";

export async function setFormFieldValue(page: any, labelText: string, value: string) {
    const supplierLabel = await page.locator('label').getByText(labelText, { exact: true });
    const labelForId = cssEscape(await supplierLabel.getAttribute('for'));
    const inputField = await page.locator(`input#${labelForId}`);
    await inputField.fill(value);
}

// 25 Sept 2025: This has been substituted with the simplified version below. It can be deleted soon if everything still works
export async function setFormSelectValueTD(page: any, labelText: string, value: string) {
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
    await locator.click();  // Ensure the dropdown is focused
    await locator.selectOption(value);
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

// Given a location on a page or a whole page, finds all inputs using the Name (usually gained from the field label)
// labelsWithFillValues is a Record where each key is the label associated with the field, and the value is the fill value
// for the field. If a different method for filling in the value is needed, the label can be added to the fillStrategies 
// Record, and the value represents which switch option to use for filling it out.
export async function fillAllFieldsByName(page: Page, subsection: Locator, labelsWithFillValues: Record<string, string>,
                                          fillStrategies?: Record<string, string>) {
    for (const [name, value] of Object.entries(labelsWithFillValues)) {
        let fillStrategy = "fill";

        if (fillStrategies != undefined && fillStrategies[name] != undefined) {
            fillStrategy = fillStrategies[name];
        }

        switch (fillStrategy) {
            case "click":
                await clickCellByFieldName(page, name, value, subsection);
                break;
            case "fill":
                await fillAndWaitByFieldName(page, name, value, subsection);
                break;
            default:
                throw Error(`The fill strategy '${fillStrategy}' for field '${name}' is not recognised`)
        }
    }
}

// Identify a field by name, click the field, then select the option containing value from the gridcell dropdown 
export async function clickCellByFieldName(page: Page, name: string, value: string, optionalLocator?: Locator) {
    const textBox = (optionalLocator) ? optionalLocator.getByRole('textbox', { name: name }) : page.getByRole('textbox', { name: name });
    
    await textBox.click();
    await page.getByRole('gridcell', { name: value, exact: true }).click();
    await textBox.focus();
    await textBox.blur();
    await expect(textBox).toHaveValue(value);
}

// Idenfity a field by name, fill the value and then defocus the field. Wait until a response has been received for a POST request before continuing
export async function fillAndWaitByFieldName(page: Page, name: string, value: string, optionalLocator?: Locator) {
    const textBox = (optionalLocator) ? optionalLocator.getByRole('textbox', { name: name }) : page.getByRole('textbox', { name: name });
    let awaitResponse = page.waitForResponse(/.*_adf.ctrl-state.*/);
    await textBox.fill(value);
    await textBox.blur();
    await awaitResponse;
    await expect(textBox).toHaveValue(value);
}