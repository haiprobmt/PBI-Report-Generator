import JSZip from 'jszip';
import mammoth from 'mammoth';
import { basename, extname } from 'node:path';
import readXlsxFile from 'read-excel-file/node';
import { createWorker } from 'tesseract.js';
import englishLanguageData from '@tesseract.js-data/eng';
import vietnameseLanguageData from '@tesseract.js-data/vie';

export type AnalysisLanguage = 'en' | 'vi';

export interface EncodedUpload {
  name: string;
  type: string;
  size: number;
  contentBase64: string;
}

export interface ExtractedSource {
  fileName: string;
  fileType: string;
  mimeType: string;
  extractionStatus: 'analyzed' | 'partial' | 'failed';
  summary: string;
  characterCount: number;
  warnings: string[];
  content: string;
}

export interface ExtractedTable {
  fileName: string;
  sheetName?: string;
  headers: string[];
  sampleRows: string[][];
  rowCount: number;
}

export interface ExtractionResult {
  sources: ExtractedSource[];
  dataContext: ExtractedTable[];
}

export const SUPPORTED_FILE_EXTENSIONS = [
  '.csv', '.tsv', '.txt', '.md', '.json', '.xml', '.yaml', '.yml',
  '.pdf', '.docx', '.xlsx', '.pptx', '.png', '.jpg', '.jpeg', '.webp', '.bmp', '.tif', '.tiff',
] as const;

const TEXT_EXTENSIONS = new Set(['.txt', '.md', '.json', '.xml', '.yaml', '.yml']);
const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.bmp', '.tif', '.tiff']);
const MAX_FILE_BYTES = 15 * 1024 * 1024;
const MAX_FILES = 12;
const MAX_EXTRACTED_CHARACTERS = 80_000;

function decodeXml(value: string) {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

function normalizeText(value: string) {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{4,}/g, '\n\n\n')
    .trim();
}

function truncateText(value: string) {
  const normalized = normalizeText(value);
  if (normalized.length <= MAX_EXTRACTED_CHARACTERS) return normalized;
  return `${normalized.slice(0, MAX_EXTRACTED_CHARACTERS)}\n\n[Content truncated for analysis]`;
}

function parseDelimited(text: string, delimiter: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '"') {
      if (quoted && text[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === delimiter && !quoted) {
      row.push(cell.trim());
      cell = '';
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && text[index + 1] === '\n') index += 1;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += character;
    }
  }
  if (cell || row.length) {
    row.push(cell.trim());
    if (row.some(Boolean)) rows.push(row);
  }
  return rows;
}

function tableFromRows(fileName: string, rows: unknown[][], sheetName?: string): ExtractedTable | null {
  const normalizedRows = rows.map((row) => row.map((value) => value == null ? '' : String(value)));
  const firstNonEmpty = normalizedRows.findIndex((row) => row.some(Boolean));
  if (firstNonEmpty < 0) return null;
  const usable = normalizedRows.slice(firstNonEmpty);
  const width = Math.max(...usable.slice(0, 20).map((row) => row.length));
  const rawHeaders = usable[0] ?? [];
  const headers = Array.from({ length: width }, (_, index) => rawHeaders[index]?.trim() || `Column ${index + 1}`);
  return {
    fileName,
    sheetName,
    headers,
    sampleRows: usable.slice(1, 9).map((row) => headers.map((_, index) => row[index] ?? '')),
    rowCount: Math.max(usable.length - 1, 0),
  };
}

async function extractPdf(buffer: Buffer) {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const document = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
  const pages: string[] = [];
  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const text = await page.getTextContent();
    pages.push(text.items.map((item) => 'str' in item ? item.str : '').join(' '));
  }
  return pages.join('\n\n');
}

async function extractPresentation(buffer: Buffer) {
  const archive = await JSZip.loadAsync(buffer);
  const slideNames = Object.keys(archive.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));
  const slides: string[] = [];
  for (const name of slideNames) {
    const xml = await archive.file(name)?.async('string') ?? '';
    const text = [...xml.matchAll(/<a:t>([\s\S]*?)<\/a:t>/g)].map((match) => decodeXml(match[1])).join(' ');
    slides.push(`Slide ${slides.length + 1}: ${text}`);
  }
  return slides.join('\n\n');
}

async function extractSpreadsheet(fileName: string, buffer: Buffer) {
  const sheets = await readXlsxFile(buffer);
  const tables: ExtractedTable[] = [];
  const text: string[] = [];
  for (const sheet of sheets.slice(0, 8)) {
    const table = tableFromRows(fileName, sheet.data, sheet.sheet);
    if (table) {
      tables.push(table);
      text.push(`Sheet: ${sheet.sheet}\nColumns: ${table.headers.join(', ')}\nRows: ${table.rowCount}\nSample:\n${table.sampleRows.map((row) => row.join(' | ')).join('\n')}`);
    }
  }
  return { text: text.join('\n\n'), tables };
}

async function recognizeImage(buffer: Buffer, language: 'eng' | 'vie', languageData: typeof englishLanguageData) {
  const worker = await createWorker(language, 1, { langPath: languageData.langPath, gzip: languageData.gzip, cacheMethod: 'none' });
  try { return (await worker.recognize(buffer)).data.text; } finally { await worker.terminate(); }
}

async function extractImage(buffer: Buffer, language: AnalysisLanguage) {
  const primary = language === 'vi'
    ? await recognizeImage(buffer, 'vie', vietnameseLanguageData)
    : await recognizeImage(buffer, 'eng', englishLanguageData);
  const secondary = language === 'vi'
    ? await recognizeImage(buffer, 'eng', englishLanguageData)
    : await recognizeImage(buffer, 'vie', vietnameseLanguageData);
  return `${primary.trim()}\n\n[Secondary OCR]\n${secondary.trim()}`.trim();
}

function sourceSummary(fileName: string, text: string) {
  const collapsed = text.replace(/\s+/g, ' ').trim();
  return collapsed ? `${fileName}: ${collapsed.slice(0, 260)}${collapsed.length > 260 ? '…' : ''}` : `${fileName}: no readable text was found.`;
}

export function validateUploads(files: EncodedUpload[]) {
  if (files.length === 0) throw new Error('Select at least one file.');
  if (files.length > MAX_FILES) throw new Error(`Upload no more than ${MAX_FILES} files at a time.`);
  let totalBytes = 0;
  for (const file of files) {
    if (!file || typeof file.name !== 'string' || typeof file.type !== 'string' || typeof file.contentBase64 !== 'string') {
      throw new Error('The upload payload contains an invalid file descriptor.');
    }
    const extension = extname(file.name).toLowerCase();
    if (!SUPPORTED_FILE_EXTENSIONS.includes(extension as typeof SUPPORTED_FILE_EXTENSIONS[number])) {
      throw new Error(`${basename(file.name)} is not a supported file format.`);
    }
    if (!Number.isFinite(file.size) || file.size <= 0 || file.size > MAX_FILE_BYTES) {
      throw new Error(`${basename(file.name)} must be between 1 byte and 15 MB.`);
    }
    totalBytes += file.size;
  }
  if (totalBytes > 50 * 1024 * 1024) throw new Error('The combined upload must not exceed 50 MB.');
}

export async function extractUploads(files: EncodedUpload[], language: AnalysisLanguage = 'en'): Promise<ExtractionResult> {
  validateUploads(files);
  const sources: ExtractedSource[] = [];
  const dataContext: ExtractedTable[] = [];

  for (const file of files) {
    const fileName = basename(file.name);
    const extension = extname(fileName).toLowerCase();
    const buffer = Buffer.from(file.contentBase64, 'base64');
    if (buffer.length !== file.size) throw new Error(`${fileName} upload content did not match its declared size.`);
    const warnings: string[] = [];
    let content = '';
    let status: ExtractedSource['extractionStatus'] = 'analyzed';
    try {
      if (extension === '.csv' || extension === '.tsv') {
        content = buffer.toString('utf8');
        const table = tableFromRows(fileName, parseDelimited(content, extension === '.tsv' ? '\t' : ','));
        if (table) dataContext.push(table);
      } else if (TEXT_EXTENSIONS.has(extension)) {
        content = buffer.toString('utf8');
      } else if (extension === '.pdf') {
        content = await extractPdf(buffer);
      } else if (extension === '.docx') {
        const result = await mammoth.extractRawText({ buffer });
        content = result.value;
        warnings.push(...result.messages.map((message) => message.message).slice(0, 5));
      } else if (extension === '.xlsx') {
        const spreadsheet = await extractSpreadsheet(fileName, buffer);
        content = spreadsheet.text;
        dataContext.push(...spreadsheet.tables);
      } else if (extension === '.pptx') {
        content = await extractPresentation(buffer);
      } else if (IMAGE_EXTENSIONS.has(extension)) {
        content = await extractImage(buffer, language);
        warnings.push(language === 'vi'
          ? 'Việc hiểu hình ảnh dựa trên văn bản OCR tiếng Việt và tiếng Anh; biểu đồ hoặc sơ đồ thuần hình ảnh có thể cần người dùng làm rõ.'
          : 'Image understanding is based on Vietnamese and English OCR text; purely visual charts or diagrams may need user clarification.');
      }
      content = truncateText(content);
      if (!content) {
        status = 'partial';
        warnings.push('No machine-readable text could be extracted from this file.');
      }
    } catch (error) {
      status = 'failed';
      warnings.push(error instanceof Error ? error.message : 'File extraction failed.');
      content = '';
    }
    sources.push({
      fileName,
      fileType: extension.slice(1).toUpperCase(),
      mimeType: file.type || 'application/octet-stream',
      extractionStatus: status,
      summary: sourceSummary(fileName, content),
      characterCount: content.length,
      warnings,
      content,
    });
  }

  return { sources, dataContext };
}

export function buildKnowledgeCorpus(result: ExtractionResult) {
  const limit = 180_000;
  let used = 0;
  return result.sources.map((source) => {
    const remaining = Math.max(limit - used, 0);
    const excerpt = source.content.slice(0, remaining);
    used += excerpt.length;
    return {
      fileName: source.fileName,
      fileType: source.fileType,
      extractionStatus: source.extractionStatus,
      warnings: source.warnings,
      content: excerpt,
    };
  });
}
