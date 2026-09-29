import { redirect } from "next/navigation";
import { isAuthenticated } from "../lib/session";

export default async function HomePage() {
  redirect((await isAuthenticated()) ? "/dashboard" : "/login");
}
