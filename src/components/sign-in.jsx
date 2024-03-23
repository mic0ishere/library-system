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
import useDictionary from "@/lib/use-translation";

function SignIn() {
  const t = useDictionary("sign-in");

  return (
    <Card className="w-[min(380px,90vw)] absolute top-1/4 left-1/2 transform -translate-x-1/2 sm:p-2">
      <CardHeader>
        <CardTitle className="text-3xl pb-2">
          <span className="text-xl">{t("welcomeTo")}</span>
          <br />
          {t("title")}
        </CardTitle>
        <CardDescription>{t("signInDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant="secondary"
          size="full"
          onClick={() => signIn("azure-ad")}
        >
          <LogIn className="w-4 h-4 mr-2" />
          {t("signInWith")}
        </Button>
      </CardContent>
    </Card>
  );
}

export default SignIn;
