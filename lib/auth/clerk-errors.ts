type ClerkErrorLike = {
  code?: string;
  longMessage?: string;
  message?: string;
};

const friendlyErrorMessages: Record<string, string> = {
  form_identifier_not_found: "No admin account was found for that email.",
  form_password_incorrect: "The password is incorrect.",
  form_param_format_invalid: "Please check the email and password fields.",
  form_password_pwned: "Please choose a stronger password.",
  too_many_requests: "Too many attempts. Please wait a moment and try again.",
};

export function getClerkErrorMessage(error: unknown) {
  const clerkError = Array.isArray(error) ? error[0] : error;
  const code =
    typeof clerkError === "object" && clerkError !== null
      ? (clerkError as ClerkErrorLike).code
      : undefined;

  if (code && friendlyErrorMessages[code]) {
    return friendlyErrorMessages[code];
  }

  return "We could not complete sign in. Please try again.";
}
