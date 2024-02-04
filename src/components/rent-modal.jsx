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

import { useMediaQuery } from "@/lib/use-media-query";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { HelpCircleIcon } from "lucide-react";

function RentModal({ row, children }) {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop)
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rent a book</DialogTitle>
          </DialogHeader>
          <RentForm row={row} />
        </DialogContent>
      </Dialog>
    );

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Rent a book</DrawerTitle>
          <RentForm row={row} />
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

function RentForm({ row }) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-bold">{row.title}</h1>
      <div>
        <p className="text-lg">{row.author}</p>
        <ul className="text-sm text-left mt-4 md:mt-0 md:ml-4 md:list-disc">
          <li>Published: {row.year}</li>
          <li>Pages: {row.pages}</li>
          <li>ISBN: {row.isbn}</li>
        </ul>
      </div>

      <Alert variant="info" className="text-left">
        <HelpCircleIcon className="w-5 h-5" />
        <AlertTitle>How it works</AlertTitle>
        <AlertDescription>
          After taking the book from the bookshelf, click the button below to
          confirm the rent. The book will be marked as rented and you will have{" "}
          {process.env.NEXT_PUBLIC_DEFAULTDEPOSITTIME} days to return it.
        </AlertDescription>
      </Alert>

      <Button className="w-full">Rent book</Button>
    </div>
  );
}

export default RentModal;
