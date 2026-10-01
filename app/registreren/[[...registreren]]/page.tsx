import { SignUp } from "@clerk/nextjs";
import { AuthConfigurationNotice } from "../../../components/AuthConfigurationNotice";
import { isClerkConfigured } from "../../lib/config";

export default function RegisterPage() {
  if (!isClerkConfigured()) return <AuthConfigurationNotice />;

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
      <SignUp
        routing="path"
        path="/registreren"
        signInUrl="/login"
        fallbackRedirectUrl="/pricing?checkout=1"
      />
    </main>
  );
}
