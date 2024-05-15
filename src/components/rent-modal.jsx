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
import useDictionary from "@/lib/use-translation";

function RentModal({ row, children }) {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const { t } = useDictionary("rent-book");

  if (isDesktop)
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("title")}</DialogTitle>
          </DialogHeader>
          <RentForm row={row} open={setOpen} />
        </DialogContent>
      </Dialog>
    );

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{t("title")}</DrawerTitle>
          <RentForm row={row} open={setOpen} />
        </DrawerHeader>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">{t("cancel")}</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function RentForm({ row, open }) {
  const { mutate } = useSWRConfig();

  const { t } = useDictionary("rent-book");

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-bold">{row.title}</h1>
      <div>
        <p className="text-lg">{row.author}</p>
        <ul className="text-sm text-left mt-4 md:mt-0 md:ml-4 md:list-disc">
          <li>{t("category", row.category)}</li>
          <li>{t("published", row.year)}</li>
          <li>{t("pages", row.pages)}</li>
          <li>{t("isbn", row.isbn)}</li>
        </ul>
      </div>

      <Alert variant="info" className="text-left">
        <HelpCircleIcon className="w-5 h-5" />
        <AlertTitle>{t("howItWorksTitle")}</AlertTitle>
        <AlertDescription>
          {t("howItWorks", {
            max: process.env.NEXT_PUBLIC_DEFAULTRENTALTIME,
          })}
        </AlertDescription>
      </Alert>

      <Button
        className="w-full mt-2"
        onClick={async () => {
          open(false);

          const afterPromise = (data) => {
            mutate("/api/catalog");
            return data.message;
          };

          toast.promise(rentBook(row.id), {
            loading: t("loading"),
            success: afterPromise,
            error: afterPromise,
          });
        }}
      >
        {t("confirm")}
      </Button>
    </div>
  );
}

async function rentBook(bookId) {
  try {
    const response = await (
      await fetch(`/api/rent/${bookId}`, {
        method: "POST",
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

export { RentForm };
export default RentModal;
