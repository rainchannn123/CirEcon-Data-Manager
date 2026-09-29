import { NextResponse } from "next/server";
import { database } from "../../../../../lib/mongodb";
import { csvCell, flattenDocument } from "../../../../../lib/data";
import { isAuthenticated } from "../../../../../lib/session";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ name: string }> }) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name } = await context.params;
  const db = await database();
  if (!(await db.listCollections({ name }, { nameOnly: true }).next()))
    return NextResponse.json({ error: "Collection not found" }, { status: 404 });
  const collection = db.collection(name);
  const sample = await collection.find({}).sort({ _id: -1 }).limit(200).toArray();
  const columns = [...new Set(sample.flatMap((document) => Object.keys(flattenDocument(document))))].sort();
  if (columns.includes("_id")) columns.splice(columns.indexOf("_id"), 1), columns.unshift("_id");
  const encoder = new TextEncoder();
  const cursor = collection.find({}).sort({ _id: -1 });
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode(`${columns.map(csvCell).join(",")}\r\n`));
    },
    async pull(controller) {
      const next = await cursor.next();
      if (!next) {
        await cursor.close();
        controller.close();
        return;
      }
      const row = flattenDocument(next);
      controller.enqueue(encoder.encode(`${columns.map((column) => csvCell(row[column] ?? "")).join(",")}\r\n`));
    },
    async cancel() {
      await cursor.close();
    },
  });
  return new NextResponse(stream, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${name}.csv"`,
      "cache-control": "no-store",
    },
  });
}
