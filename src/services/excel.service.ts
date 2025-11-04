import * as xlsx from 'xlsx';
//const path = require('path');
import * as path from 'path';

export class ExcelService {
    static workbook: xlsx.WorkBook;
    static resultsSheet: xlsx.WorkSheet;
    static fileNameAndPath: string;

    static readExcelData(testFileName: string) {
        const setupDataSheetName = 'Setup';
        const loopDataSheetName = 'Loop';
        let setupData: any[] = [];    // Data items from the Setup sheet
        let loopData: any[][] = [];   // Data items from the Loop sheet

        const sourceDataXslxFilename = path.basename(testFileName, '.spec.ts');
        this.fileNameAndPath = path.join(__dirname, '..', '..', 'excel-data-files', sourceDataXslxFilename);
        const sourceDataXslxFilePath = this.fileNameAndPath + '.xlsx';

        // check if file exists
        const fs = require('fs');
        if (!fs.existsSync(sourceDataXslxFilePath)) {
            console.error(`Error: The Excel file ${sourceDataXslxFilePath} does not exist.`);
            process.exit(1);
        }

        // const workbook = xlsx.readFile(sourceDataXslxFilePath);
        this.workbook = xlsx.readFile(sourceDataXslxFilePath);
        setupData = (xlsx.utils.sheet_to_json(this.workbook.Sheets[setupDataSheetName], { raw: false, header: 1 }) as any[][]).map((item: any[]) => {return item[1]});
        loopData = (xlsx.utils.sheet_to_json(this.workbook.Sheets[loopDataSheetName], { raw: false, header: 1 }) as any[][]).map((item: any[]) => {return [item[0], item[1], item[2], item[3], item[4]]});
        if (setupData.length === 0 || loopData.length === 0) {
            console.error(`Error with format of Excel file: ${sourceDataXslxFilePath}`);
            process.exit(1);
        }
        loopData.shift();   // remove header row

        return { setupData, loopData };
    }

    static isWorkbookOpen(): boolean {
        return this.workbook !== undefined;
    }

    static writeResultsHeaderRow(headings: string[]) {
        this.resultsSheet = xlsx.utils.aoa_to_sheet([headings]);
        xlsx.utils.book_append_sheet(this.workbook, this.resultsSheet, 'results');      
    }

    static writeResultsResultRow(results: string[]) {
        xlsx.utils.sheet_add_aoa(this.resultsSheet!, [results], {origin:-1});
    }

    static save() {
        const now = new Date();
        const pad = (n: number) => n.toString().padStart(2, '0');
        const dateTimeFormatted = 
            now.getFullYear().toString() +
            pad(now.getMonth() + 1) +
            pad(now.getDate()) + '-' +
            pad(now.getHours()) +
            pad(now.getMinutes()) +
            pad(now.getSeconds());

        xlsx.writeFile(this.workbook, this.fileNameAndPath + '-results-' + dateTimeFormatted + '.xlsx');
    }

    static readExcelToRecords(testFileName: string) {
        let setupData: Record<string, any> = {};
        let loopData: Record<string, any>[] = [];

        const filename = path.basename(testFileName, '.spec.ts') + '.xlsx';
        this.fileNameAndPath = path.join(__dirname, '..', '..', 'excel-data-files', filename);

        // check if file exists
        const fs = require('fs');
        if (!fs.existsSync(this.fileNameAndPath)) {
            console.error(`Error: The Excel file ${this.fileNameAndPath} does not exist.`);
            process.exit(1);
        }

        this.workbook = xlsx.readFile(this.fileNameAndPath);

        // Check that the workbook contains a sheet called 'Setup'
        if (this.workbook.Sheets['Setup'] == undefined) { throw Error("Excel workbook does not contain a sheet called 'Setup'") };

        // Read the rows of the Setup sheet and add column A as keys and B as values
        const setupSheet = xlsx.utils.sheet_to_json(this.workbook.Sheets['Setup'], { raw: false, header: 1 }) as any[][];
        setupSheet.forEach(row => {
            setupData[row[0]] = row[1];
        });

        // Check that the workbook contains a sheet called 'Loop'
        if (this.workbook.Sheets['Loop'] == undefined) { throw Error("Excel workbook does not contain a sheet called 'Loop'") };

        // Convert the headers and rows into JSON objects
        loopData = xlsx.utils.sheet_to_json(this.workbook.Sheets['Loop']);

        return { setupData, loopData };
    }

    static updateValue(columnName: string, rowIndex: number, value: any, type: string = 's') {
        let loopSheet = this.workbook.Sheets['Loop'];
        let columnIndex = 0;

        for (let i = 0; i < 1000; i++) {
            let headerCell = loopSheet[xlsx.utils.encode_cell({ c: i, r: 0 })];
            
            if (headerCell != undefined && headerCell['v'] == columnName) {
                columnIndex = i;
                break;
            }

            if (i == 999) { throw Error(`Column '${columnName}' does not exist`)}
        }

        const updateCell = xlsx.utils.encode_cell({ c: columnIndex, r: rowIndex + 1 });
        loopSheet[updateCell] = { 't': type,
                                  'v': value,
                                  'r': `<t>${value}</t>`,
                                  'h': value,
                                  'w': value }

        this.workbook.Sheets['Loop'] = loopSheet;
        
        xlsx.writeFile(this.workbook, this.fileNameAndPath);
    }
}