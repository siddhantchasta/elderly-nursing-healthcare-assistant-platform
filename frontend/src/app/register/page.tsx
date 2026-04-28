import RegisterForm from "@/components/auth/RegisterForm";
import AuthShell from "@/components/ui/AuthShell";

export default function RegisterPage() {
  return (
    <AuthShell title="Create account" subtitle="Register as user/family or caregiver.">
      <RegisterForm />
    </AuthShell>
  );
}
