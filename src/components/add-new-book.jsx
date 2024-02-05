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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { useSWRConfig } from "swr";
import { useState } from "react";
import { useMediaQuery } from "@/lib/use-media-query";
import { toast } from "sonner";

import { useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import { bookSchema } from "@/lib/book-schema";

function AddNewBookModal({ children }) {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop)
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New book</DialogTitle>
          </DialogHeader>
          <NewBookForm open={setOpen} />
        </DialogContent>
      </Dialog>
    );

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>New book</DrawerTitle>
          <NewBookForm open={setOpen} />
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

function NewBookForm({ open }) {
  const { mutate } = useSWRConfig();

  const form = useForm({
    resolver: joiResolver(bookSchema),
    defaultValues: {
      title: "",
      author: "",
      year: "",
      pages: "",
      isbn: "",
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (data) => {
          open(false);

          const afterPromise = (data) => {
            mutate("/api/catalog");
            return data.message;
          };

          toast.promise(addNewBook(data), {
            loading: "Adding new book...",
            success: afterPromise,
            error: afterPromise,
          });
        })}
      >
        <div className="flex flex-col gap-2">
          <Field form={form} name="title">
            Title
          </Field>
          <Field form={form} name="author">
            Author
          </Field>
          <div className="w-full flex flex-row sm:space-x-2">
            <Field form={form} name="year">
              Publishing year
            </Field>
            <Field form={form} name="pages" type="number">
              Pages count
            </Field>
          </div>
          <Field form={form} name="isbn">
            ISBN
          </Field>
        </div>
        <Button className="w-full mt-4" type="submit">
          Add to catalog
        </Button>
      </form>
    </Form>
  );
}

function Field({ form, name, children, ...props }) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{children}</FormLabel>
          <FormControl>
            <Input {...field}  />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

async function addNewBook(data) {
  try {
    console.log(data)

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
