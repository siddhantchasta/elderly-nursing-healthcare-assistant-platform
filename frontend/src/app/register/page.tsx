import RegisterForm from "@/components/auth/RegisterForm";
import AuthShell from "@/components/ui/AuthShell";

export default function RegisterPage() {
  return (
    <AuthShell 
      title="Get started" 
      subtitle="Create your account to access compassionate, professional in-home care services."
    >
      <RegisterForm />
    </AuthShell>
  );
}
