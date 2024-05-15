import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { HelpCircleIcon } from "lucide-react";

import { useState } from "react";
import { useMediaQuery } from "@/lib/use-media-query";
import { useSWRConfig } from "swr";
import { toast } from "sonner";

function BookReturnCard({
  t,
  book,
  children,
  showReturn = true,
  showDetails = true,
}) {
  return (
    <Card
      className={`${
        book.due < 0
          ? "ring-2 ring-red-500 dark:ring-red-800"
          : book.due <= 3 && "ring-2 ring-yellow-500"
      }`}
    >
      <CardHeader>
        <CardTitle>{book.title}</CardTitle>
        <CardDescription>{book.author}</CardDescription>
        {showDetails && (
          <ul className="text-sm text-left mt-2 ml-4 list-disc text-black dark:text-white">
            <li>{t("published", book.year)}</li>
            <li>{t("pages", book.pages)}</li>
            <li>{t("isbn", book.isbn)}</li>
          </ul>
        )}
      </CardHeader>
      <CardContent>
        <p className={book.due < 0 ? "text-red-500" : ""}>
          <strong>{t("dueDate")}:</strong>{" "}
          {new Date(book.dueDate).toDateString()} (
          {book.due === 0
            ? "today"
            : new Intl.RelativeTimeFormat("en").format(book.due, "day")}
          )
        </p>
        {showReturn && (
          <ReturnModal book={book} t={t}>
            <Button variant="outline" className="w-full mt-4">
              {t("dialog.openButton")}
            </Button>
          </ReturnModal>
        )}
        {children}
      </CardContent>
    </Card>
  );
}

function ReturnModal({ book, children, t }) {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop)
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("dialog.title")}</DialogTitle>
          </DialogHeader>
          <ReturnForm book={book} open={setOpen} t={t} />
        </DialogContent>
      </Dialog>
    );

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{t("dialog.title")}</DrawerTitle>
          <ReturnForm book={book} open={setOpen} t={t} />
        </DrawerHeader>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">{t("dialog.cancel")}</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function ReturnForm({ book, open, t }) {
  const { mutate } = useSWRConfig();

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-bold">{book.title}</h1>
      <div>
        <p className="text-lg">{book.author}</p>
      </div>

      <Alert variant="info" className="text-left">
        <HelpCircleIcon className="w-5 h-5" />
        <AlertTitle>{t("dialog.howItWorksTitle")}</AlertTitle>
        <AlertDescription>{t("dialog.howItWorks")}</AlertDescription>
      </Alert>

      <Button
        className="w-full mt-2"
        onClick={async () => {
          open(false);

          const afterPromise = (data) => {
            mutate("/api/catalog/my");
            return data.message;
          };

          toast.promise(returnBook(book.id), {
            loading: t("dialog.loading"),
            success: afterPromise,
            error: afterPromise,
          });
        }}
      >
        {t("dialog.confirm")}
      </Button>
    </div>
  );
}

async function returnBook(bookId) {
  try {
    const response = await (
      await fetch(`/api/rent/${bookId}`, {
        method: "DELETE",
      })
    ).json();

    if (response.type === "success") {
      return response;
    } else {
      throw new Error(response.message);
    }
  } catch (error) {
    console.error("Error:", error);
    throw new Error(error.message || "An unexpected error occured");
  }
}

export default BookReturnCard;
