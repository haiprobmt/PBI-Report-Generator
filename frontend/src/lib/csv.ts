export interface CsvPreviewResult {
  headers: string[];
  sampleRows: string[][];
  rowCount: number;
}

export function parseCsvPreview(text: string, maxPreviewRows = 8): CsvPreviewResult {
  let headers: string[] | null = null;
  const sampleRows: string[][] = [];
  let rowCount = 0;
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  const finishRow = () => {
    const completedRow = [...row, cell.trim()];
    if (completedRow.some((value) => value.length > 0)) {
      if (headers === null) {
        headers = completedRow.map((value, index) => index === 0 ? value.replace(/^\uFEFF/, '') : value);
      } else {
        rowCount += 1;
        if (sampleRows.length < maxPreviewRows) sampleRows.push(completedRow);
      }
    }
    row = [];
    cell = '';
  };

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];

    if (character === '"') {
      if (inQuotes && text[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (character === ',' && !inQuotes) {
      row.push(cell.trim());
      cell = '';
      continue;
    }

    if ((character === '\n' || character === '\r') && !inQuotes) {
      if (character === '\r' && text[index + 1] === '\n') index += 1;
      finishRow();
      continue;
    }

    cell += character;
  }

  if (cell.length > 0 || row.length > 0) finishRow();
  return {
    headers: headers ?? [],
    sampleRows,
    rowCount,
  };
}
