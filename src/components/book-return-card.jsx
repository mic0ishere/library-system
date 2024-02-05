import { useState } from "react";
import { useMediaQuery } from "@/lib/use-media-query";

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
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { HelpCircleIcon } from "lucide-react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";

function BookReturnCard({ book }) {
  return (
    <Card
      className={`${
        book.due <= 0
          ? "ring-2 ring-red-500 dark:ring-red-900"
          : book.due <= 3 && "ring-2 ring-yellow-500"
      }`}
    >
      <CardHeader>
        <CardTitle>{book.title}</CardTitle>
        <CardDescription>{book.author}</CardDescription>
        <ul className="text-sm text-left mt-2 ml-4 list-disc text-black dark:text-white">
          <li>Published: {book.year}</li>
          <li>Pages: {book.pages}</li>
          <li>ISBN: {book.isbn}</li>
        </ul>
      </CardHeader>
      <CardContent>
        <p className={book.due <= 0 && "text-red-500"}>
          <strong>Due date:</strong> {new Date(book.dueDate).toDateString()} (
          {new Intl.RelativeTimeFormat("en").format(book.due, "day")})
        </p>
        <ReturnModal book={book}>
          <Button variant="outline" className="w-full mt-4">
            Return
          </Button>
        </ReturnModal>
      </CardContent>
    </Card>
  );
}

function ReturnModal({ book, children }) {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop)
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return a book</DialogTitle>
          </DialogHeader>
          <ReturnForm book={book} open={setOpen} />
        </DialogContent>
      </Dialog>
    );

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Return a book</DrawerTitle>
          <ReturnForm book={book} open={setOpen} />
        </DrawerHeader>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function ReturnForm({ book, open }) {
  const { mutate } = useSWRConfig();

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-bold">{book.title}</h1>
      <div>
        <p className="text-lg">{book.author}</p>
      </div>

      <Alert variant="info" className="text-left">
        <HelpCircleIcon className="w-5 h-5" />
        <AlertTitle>How it works</AlertTitle>
        <AlertDescription>
          After putting the book back onto the bookshelf, click the button below
          to confirm the return. It will be sent to the librarian for
          confirmation, and afterwards, the book will be available for rent
          again.
        </AlertDescription>
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
            loading: "Returning book...",
            success: afterPromise,
            error: afterPromise
          });
        }}
      >
        Return book
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
