import { NextResponse } from "next/server";
import { database } from "../../../../lib/mongodb";
import { flattenDocument } from "../../../../lib/data";
import { isAuthenticated } from "../../../../lib/session";

export const dynamic = "force-dynamic";

async function collectionExists(name: string): Promise<boolean> {
  return Boolean(await (await database()).listCollections({ name }, { nameOnly: true }).next());
}

export async function GET(request: Request, context: { params: Promise<{ name: string }> }) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name } = await context.params;
  if (!(await collectionExists(name))) return NextResponse.json({ error: "Collection not found" }, { status: 404 });
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
  const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get("pageSize") ?? 50)));
  const collection = (await database()).collection(name);
  const [documents, total] = await Promise.all([
    collection.find({}).sort({ _id: -1 }).skip((page - 1) * pageSize).limit(pageSize).toArray(),
    collection.countDocuments(),
  ]);
  const rows = documents.map((document) => flattenDocument(document));
  const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))].sort((left, right) => {
    if (left === "_id") return -1;
    if (right === "_id") return 1;
    return left.localeCompare(right);
  });
  return NextResponse.json({ name, columns, rows, page, pageSize, total });
}
