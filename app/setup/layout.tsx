import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getInnerUser } from "../lib/auth";

export default async function SetupLayout({ children }: { children: ReactNode }) {
  const user = await getInnerUser();
  if (!user) redirect("/login?next=/setup");
  return children;
}
