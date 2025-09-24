import { Locator, Page } from "@playwright/test";

// Given a location on a page or a whole page, finds all inputs using the Name (usually gained from the field label)
// labelsWithFillValues is a Record where each key is the label associated with the field, and the value is the fill value
// for the field. If a different method for filling in the value is needed, the label can be added to the fillStrategies 
// Record, and the value represents which switch option to use for filling it out.
export async function fillAllFieldsByName(page: Page , subsection: Page | Locator, labelsWithFillValues: Record<string, string>,
                                          fillStrategies?: Record<string, string>) {
    for (const [label, value] of Object.entries(labelsWithFillValues)) {
        const textBox = subsection.getByRole('textbox', { name: label });
        let fillStrategy = "fill";

        if (fillStrategies != undefined && fillStrategies[label] != undefined) {
            fillStrategy = fillStrategies[label];
        }

        switch (fillStrategy) {
            case "click":
                await page.getByRole('textbox', { name: label }).click();
                await page.getByRole('gridcell', { name: value }).click();
                break;
            case "fill":
                await textBox.focus();
                await textBox.fill(value);
                await textBox.blur();
                break;
            default:
                throw Error(`The fill strategy '${fillStrategy}' for label '${label}' is not recognised`)
        }
    }
}

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