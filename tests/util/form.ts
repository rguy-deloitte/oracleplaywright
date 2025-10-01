import { Locator, Page, expect } from "@playwright/test";

export async function setFormFieldValue(page: any, labelText: string, value: string) {
    const supplierLabel = await page.locator('label').getByText(labelText, { exact: true });
    const labelForId = cssEscape(await supplierLabel.getAttribute('for'));
    const inputField = await page.locator(`input#${labelForId}`);
    await inputField.fill(value);
}

export async function setFormSelectValue(page: any, labelText: string, value: string) {
    const supplierLabel = await page.locator('label').getByText(labelText, { exact: true });
    // await supplierLabel.click(); // Optional: interact with the label
    const labelForId = cssEscape(await supplierLabel.getAttribute('for'));
    const selectField = await page.locator(`select#${labelForId}`)
    await selectField.selectOption(value);
}

export async function setFormSelectIndex(page: any, labelText: string, index: string) {
    const supplierLabel = await page.locator('label').getByText(labelText, { exact: true });
    // await supplierLabel.click(); // Optional: interact with the label
    const labelForId = cssEscape(await supplierLabel.getAttribute('for'));
    const selectField = await page.locator(`select#${labelForId}`)
    await selectField.selectOption({ index: parseInt(index) });
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