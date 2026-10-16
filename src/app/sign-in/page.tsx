import { AuthFrame, SignInForm } from "./auth-form";

export const dynamic = "force-dynamic";

export default function SignInPage() {
  return <AuthFrame mode="sign-in"><SignInForm /></AuthFrame>;
}
