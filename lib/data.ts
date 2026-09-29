import { BSON, Document } from "mongodb";

export type FlatDocument = Record<string, string>;

function scalar(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") return BSON.EJSON.stringify(value, { relaxed: true });
  return String(value);
}

export function flattenDocument(document: Document, prefix = ""): FlatDocument {
  return Object.entries(document).reduce<FlatDocument>((flat, [key, value]) => {
    const name = prefix ? `${prefix}.${key}` : key;
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      !(value instanceof Date) &&
      !(value instanceof BSON.ObjectId)
    ) {
      Object.assign(flat, flattenDocument(value as Document, name));
    } else flat[name] = scalar(value);
    return flat;
  }, {});
}

export function csvCell(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}
