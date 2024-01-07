import { signIn } from "next-auth/react";
import { Button } from "./ui/button";
import { LogIn } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function SignIn() {
  return (
    <Card className="w-[min(380px,90vw)] mx-auto mt-[35vh] sm:p-2">
      <CardHeader>
        <CardTitle className="text-3xl pb-2">
          <span className="text-xl">Welcome to</span>
          <br />
          Library System!
        </CardTitle>
        <CardDescription>
          In order to manage borrowed books, you need to login with Microsoft
          Teams.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant="secondary"
          size="full"
          onClick={() => signIn("azure-ad")}
        >
          <LogIn className="w-4 h-4 mr-2" />
          Sign In with Microsoft Teams
        </Button>
      </CardContent>
    </Card>
  );
}

export default SignIn;
