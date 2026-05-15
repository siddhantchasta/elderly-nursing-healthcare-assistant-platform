import LoginForm from "@/components/auth/LoginForm";
import AuthShell from "@/components/ui/AuthShell";

export default function LoginPage() {
  return (
    <AuthShell 
      title="Welcome back" 
      subtitle="Sign in to your account to manage care services and connect with your care team."
    >
      <LoginForm />
    </AuthShell>
  );
}
