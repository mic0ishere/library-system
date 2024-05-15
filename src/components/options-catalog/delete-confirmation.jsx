import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import useDictionary from "@/lib/use-translation";
import { AlertCircle } from "lucide-react";

function BookDeleteConfirmation({ row, onSubmit }) {
  const { t } = useDictionary("book-delete");

  return (
    <div>
      <h1 className="text-2xl font-bold">{row.title}</h1>
      <p className="text-lg mb-4">{row.author}</p>
      <Alert variant="destructive" className="text-left">
        <AlertCircle className="w-5 h-5 mt-1" />
        <AlertTitle className="font-semibold text-lg">
          {t("alertTitle")}
        </AlertTitle>
        <AlertDescription>{t("alertDescription")}</AlertDescription>
      </Alert>
      <Button
        className="w-full mt-4 -mb-2"
        variant="destructive"
        onClick={onSubmit}
      >
        {t("deleteBook")}
      </Button>
    </div>
  );
}

export default BookDeleteConfirmation;
