import { redirect } from "next/navigation";
import { isAuthenticated } from "../../lib/session";
import Dashboard from "./dashboard";

export default async function DashboardPage() {
  if (!(await isAuthenticated())) redirect("/login");
  return <Dashboard />;
}
