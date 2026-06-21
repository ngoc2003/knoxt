import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { GOOGLE_CLIENT_ID } from "@/configs/common";
import { Button } from "@/shared/ui/button";

interface GoogleAuthButtonProps {
  mode: "login" | "register";
  loading?: boolean;
  onCredential: (credential: string) => Promise<void> | void;
}

export function GoogleAuthButton({
  mode,
  loading = false,
  onCredential,
}: GoogleAuthButtonProps) {
  const handleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) {
      toast.error("Google did not return a sign-in credential.");
      return;
    }

    await onCredential(response.credential);
  };

  if (!GOOGLE_CLIENT_ID) {
    return (
      <Button
        type="button"
        disabled
        variant="outline"
        className="h-12 w-full rounded-lg border-gray-300"
      >
        Google sign-in unavailable
      </Button>
    );
  }

  return (
    <div className="relative min-h-11 w-full overflow-hidden rounded-lg">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => toast.error("Google sign-in failed. Please try again.")}
        text={mode === "register" ? "signup_with" : "signin_with"}
        shape="rectangular"
        size="large"
        width="100%"
      />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80">
          <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
        </div>
      )}
    </div>
  );
}
