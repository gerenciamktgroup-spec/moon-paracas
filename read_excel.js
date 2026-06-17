import XLSX from 'xlsx';
import path from 'path';

const filePath = path.resolve('../Moon_Paracas_Modelo_Validado_Obras_Desde_Lote31.xlsx');
console.log('Reading Excel file from:', filePath);

try {
  const workbook = XLSX.readFile(filePath);
  console.log('Sheets in workbook:', workbook.SheetNames);
  
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);
    console.log(`\n--- Sheet: ${sheetName} ---`);
    console.log(`Row count: ${data.length}`);
    console.log('First 5 rows:');
    console.log(JSON.stringify(data.slice(0, 5), null, 2));
  }
} catch (error) {
  console.error('Error reading Excel file:', error);
}
