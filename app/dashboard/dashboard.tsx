"use client";

import { useEffect, useState } from "react";

type Overview = { database: { collections: number; objects: number; dataSize: number; storageSize: number; indexes: number }; collections: Array<{ name: string; count: number; size: number }> };
type CollectionData = { name: string; columns: string[]; rows: Record<string, string>[]; page: number; pageSize: number; total: number };
const bytes = (value: number) => value < 1024 * 1024 ? `${Math.round(value / 1024)} KB` : `${(value / 1024 / 1024).toFixed(1)} MB`;

export default function Dashboard() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [selected, setSelected] = useState("");
  const [data, setData] = useState<CollectionData | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const loadOverview = async () => {
    const response = await fetch("/api/database/overview");
    if (!response.ok) throw new Error("Unable to load database metadata.");
    const next = await response.json() as Overview;
    setOverview(next);
    if (!selected && next.collections[0]) setSelected(next.collections[0].name);
  };
  useEffect(() => { void loadOverview().catch((failure) => setError(failure.message)); }, []);
  useEffect(() => {
    if (!selected) return;
    fetch(`/api/collections/${encodeURIComponent(selected)}?page=${page}&pageSize=50`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load collection rows.");
        return response.json() as Promise<CollectionData>;
      })
      .then(setData)
      .catch((failure) => setError(failure.message));
  }, [selected, page]);
  const select = (name: string) => { setPage(1); setSelected(name); };
  return <main className="dashboard"><aside className="sidebar"><div><p className="eyebrow">DATABASE</p><h1>CirEcon</h1></div><nav>{overview?.collections.map((collection) => <button className={selected === collection.name ? "selected" : ""} key={collection.name} onClick={() => select(collection.name)} type="button"><span>{collection.name}</span><small>{collection.count.toLocaleString()}</small></button>)}</nav><button className="logout" onClick={() => fetch("/api/auth/logout", { method: "POST" }).then(() => location.assign("/login"))} type="button">Sign out</button></aside><section className="workspace"><header className="workspace-header"><div><p className="eyebrow">MONGODB VISUALIZATION</p><h2>{selected || "Loading collections..."}</h2><p>{data ? `${data.total.toLocaleString()} documents` : ""}</p></div>{selected && <a className="download" href={`/api/collections/${encodeURIComponent(selected)}/csv`}>Download CSV</a>}</header>{overview && <div className="stats"><span><b>{overview.database.collections}</b> collections</span><span><b>{overview.database.objects.toLocaleString()}</b> documents</span><span><b>{bytes(overview.database.dataSize)}</b> data</span><span><b>{overview.database.indexes}</b> indexes</span></div>}{error && <p className="error">{error}</p>}<div className="table-wrap">{data && <table><thead><tr>{data.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{data.rows.map((row, index) => <tr key={`${row._id ?? "row"}-${index}`}>{data.columns.map((column) => <td key={column} title={row[column]}>{row[column]}</td>)}</tr>)}</tbody></table>}</div>{data && <footer className="pagination"><button disabled={page <= 1} onClick={() => setPage((value) => value - 1)} type="button">Previous</button><span>Page {page} of {Math.max(1, Math.ceil(data.total / data.pageSize))}</span><button disabled={page * data.pageSize >= data.total} onClick={() => setPage((value) => value + 1)} type="button">Next</button></footer>}</section></main>;
}
