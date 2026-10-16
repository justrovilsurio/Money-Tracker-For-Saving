import { AuthFrame, SignUpForm } from "@/app/sign-in/auth-form";

export const dynamic = "force-dynamic";

export default function SignUpPage() {
  return <AuthFrame mode="sign-up"><SignUpForm /></AuthFrame>;
}
