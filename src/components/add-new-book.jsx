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

import { useSWRConfig } from "swr";
import { useState } from "react";
import { useMediaQuery } from "@/lib/use-media-query";
import { toast } from "sonner";

import BookForm from "./book-form";

function AddNewBookModal({ children }) {
  const { mutate } = useSWRConfig();
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const onSubmit = async (data) => {
    setOpen(false);

    const afterPromise = (data) => {
      mutate("/api/catalog");
      return data.message;
    };

    toast.promise(addNewBook(data), {
      loading: "Adding new book...",
      success: afterPromise,
      error: afterPromise,
    });
  };

  if (isDesktop)
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New book</DialogTitle>
          </DialogHeader>
          <BookForm buttonLabel="Add to catalog" onSubmit={onSubmit} />
        </DialogContent>
      </Dialog>
    );

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>New book</DrawerTitle>
          <BookForm buttonLabel="Add to catalog" onSubmit={onSubmit} />
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

async function addNewBook(data) {
  try {
    console.log(data);

    const response = await (
      await fetch(`/api/catalog`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
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

export default AddNewBookModal;
