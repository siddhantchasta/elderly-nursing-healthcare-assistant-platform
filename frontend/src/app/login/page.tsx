import LoginForm from "@/components/auth/LoginForm";
import AuthShell from "@/components/ui/AuthShell";

export default function LoginPage() {
  return (
    <AuthShell title="Welcome back" subtitle="Log in to continue managing care services.">
      <LoginForm />
    </AuthShell>
  );
}
