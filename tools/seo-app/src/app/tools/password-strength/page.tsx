import { redirect } from "next/navigation";

export default function PasswordStrengthRedirect() {
  redirect("/tools/password-checker");
}
