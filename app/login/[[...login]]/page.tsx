import { SignIn } from "@clerk/nextjs";
import { AuthConfigurationNotice } from "../../../components/AuthConfigurationNotice";
import { isClerkConfigured, safeInternalPath } from "../../lib/config";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  if (!isClerkConfigured()) return <AuthConfigurationNotice />;

  const query = await searchParams;
  const nextPath = safeInternalPath(query.next, "/dashboard");

  return (
    <main
      style={{
        minHeight: "80vh",
        display: "grid",
        placeItems: "center",
        padding: "40px 20px",
        background: "linear-gradient(to bottom, #0d0d2b, #1a1a3e)",
      }}
    >
      <SignIn
        routing="path"
        path="/login"
        signUpUrl="/registreren"
        fallbackRedirectUrl={nextPath}
      />
    </main>
  );
}
