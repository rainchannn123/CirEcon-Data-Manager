import { NextResponse } from "next/server";
import { database } from "../../../../lib/mongodb";
import { isAuthenticated } from "../../../../lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = await database();
  const [stats, collections] = await Promise.all([
    db.stats(),
    db.listCollections({}, { nameOnly: true }).toArray(),
  ]);
  const collectionStats = await Promise.all(
    collections.map(async ({ name }) => {
      const [count, detail] = await Promise.all([
        db.collection(name).countDocuments(),
        db.command({ collStats: name }),
      ]);
      return { name, count, size: Number(detail.size ?? 0) };
    }),
  );
  return NextResponse.json({
    database: {
      collections: Number(stats.collections ?? 0),
      objects: Number(stats.objects ?? 0),
      dataSize: Number(stats.dataSize ?? 0),
      storageSize: Number(stats.storageSize ?? 0),
      indexes: Number(stats.indexes ?? 0),
    },
    collections: collectionStats.sort((left, right) => left.name.localeCompare(right.name)),
  });
}
