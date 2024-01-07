import { useSession } from "next-auth/react";
import SignIn from "./sign-in";

export const ProtectedLayout = ({ children }) => {
  const { status: sessionStatus } = useSession();
  const authorized = sessionStatus === "authenticated";
  const unAuthorized = sessionStatus === "unauthenticated";
  const loading = sessionStatus === "loading";

  if (unAuthorized) return <SignIn />;
  if (loading) return <></>;

  return authorized && children
};
