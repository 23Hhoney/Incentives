import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExportExcelService {

  constructor() { }

  public exportAsExcelFile(data: any[], excelFileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);

    const columnWidths = Array(data[0] ? Object.keys(data[0]).length : 0).fill({ wpx: 150 });
    worksheet['!cols'] = columnWidths;

    const dateColumns = ['StartDate', 'EndDate'];
    dateColumns.forEach(col => {
      for (let i = 1; i <= data.length; i++) {
        const cellAddress = XLSX.utils.encode_cell({ c: Object.keys(data[0]).indexOf(col), r: i });
        if (worksheet[cellAddress]) {
          worksheet[cellAddress].t = 'd'; 
          worksheet[cellAddress].z = 'mm/dd/yyyy'; 
        }
      }
    });

    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }
  public exportAsExcelFileWithMultipleSheets(creditData: any[], redemptionData: any[], excelFileName: string): void {
    const creditWorksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(creditData);
    const redemptionWorksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(redemptionData);

    const columnWidths = Array(creditData[0] ? Object.keys(creditData[0]).length : 0).fill({ wpx: 150 });
    creditWorksheet['!cols'] = columnWidths;

    const redemptionColumnWidths = Array(redemptionData[0] ? Object.keys(redemptionData[0]).length : 0).fill({ wpx: 150 });
    redemptionWorksheet['!cols'] = redemptionColumnWidths;

    const workbook: XLSX.WorkBook = {
      Sheets: { 'Credit_Details': creditWorksheet, 'Redemption_Details': redemptionWorksheet },
      SheetNames: ['Credit_Details', 'Redemption_Details']
    };

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
}
  
  private saveAsExcelFile(buffer: any, fileName: string): void {
     const data: Blob = new Blob([buffer], {type: EXCEL_TYPE});
     FileSaver.saveAs(data, fileName + '_export_' + new  Date().getTime() + EXCEL_EXTENSION);
  }
}
