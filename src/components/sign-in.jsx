import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LogIn } from "lucide-react";

function SignIn() {
  return (
    <div className="h-screen w-full flex items-center">
      <Card className="w-[min(380px,90vw)] -mt-12 mx-auto sm:p-2">
        <CardHeader>
          <CardTitle className="text-3xl pb-2">
            <span className="text-xl">Welcome to</span>
            <br />
            Library System!
          </CardTitle>
          <CardDescription>
            In order to browse our catalog and manage borrowed books, you need
            to login with Microsoft Teams.
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
    </div>
  );
}

export default SignIn;
