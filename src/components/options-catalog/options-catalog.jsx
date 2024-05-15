import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { BookUp2Icon, InfoIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RentForm } from "@/components/rent-modal";
import BookForm from "@/components/options-catalog/edit-form";
import BookDeleteConfirmation from "@/components/options-catalog/delete-confirmation";
import StatusInformation from "@/components/options-catalog/status-information";

import { useState } from "react";
import { useSWRConfig } from "swr";
import { useMediaQuery } from "@/lib/use-media-query";
import { toast } from "sonner";
import useDictionary from "@/lib/use-translation";

function BookOptions({ row, rent, adminProps, children }) {
  const { mutate } = useSWRConfig();

  const [open, setOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState("");
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const { t } = useDictionary("options-catalog");

  const afterPromise = (data) => {
    mutate("/api/catalog");
    return data.message;
  };

  const changeCategory = async (category) => {
    setOpen(true);
    setCategoryOpen(category);
  };

  const onBookEdit = async (data) => {
    setOpen(false);

    toast.promise(editBook(row.id, data), {
      loading: t("editingBook", { title: row.title }),
      success: afterPromise,
      error: afterPromise,
    });
  };

  const onBookDelete = async () => {
    setOpen(false);

    toast.promise(deleteBook(row.id), {
      loading: t("deletingBook", { title: row.title }),
      success: afterPromise,
      error: afterPromise,
    });
  };

  const onStatusUpdate = async (data) => {
    setOpen(false);

    toast.promise(statusUpdate(row.id, data), {
      loading: t("updatingStatus", { title: row.title }),
      success: afterPromise,
      error: afterPromise,
    });
  };

  if (isDesktop)
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <BookOptionsDropdown setCategory={changeCategory} rentAvailable={rent} t={t}>
          {children}
        </BookOptionsDropdown>
        <DialogContent className={categoryOpen == "status" && "max-w-xl"}>
          <DialogHeader>
            <DialogTitle>{open ? t(`titles.${categoryOpen}`) : ""}</DialogTitle>
          </DialogHeader>
          {categoryOpen === "rent" && <RentForm row={row} open={setOpen} />}
          {categoryOpen === "edit" && (
            <BookForm
              buttonLabel={t("edit.button")}
              onSubmit={onBookEdit}
              defaultValues={{
                title: row.title,
                author: row.author,
                category: row.category,
                year: row.year,
                pages: row.pages,
                isbn: row.isbn,
              }}
            />
          )}
          {categoryOpen === "delete" && (
            <>
              <BookDeleteConfirmation row={row} onSubmit={onBookDelete} />
              <DialogClose asChild>
                <Button variant="outline">{t("cancel")}</Button>
              </DialogClose>
            </>
          )}
          {categoryOpen == "status" && (
            <StatusInformation
              row={row}
              users={adminProps?.users ?? []}
              onSubmit={onStatusUpdate}
            />
          )}
        </DialogContent>
      </Dialog>
    );

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <BookOptionsDropdown setCategory={changeCategory} rentAvailable={rent} t={t}>
        {children}
      </BookOptionsDropdown>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{open ? t(`titles.${categoryOpen}`) : ""}</DrawerTitle>
          {categoryOpen === "rent" && <RentForm row={row} open={setOpen} />}
          {categoryOpen === "edit" && (
            <BookForm
              buttonLabel={t("edit.button")}
              onSubmit={onBookEdit}
              defaultValues={{
                title: row.title,
                author: row.author,
                category: row.category,
                year: row.year,
                pages: row.pages,
                isbn: row.isbn,
              }}
            />
          )}
          {categoryOpen === "delete" && (
            <BookDeleteConfirmation row={row} onSubmit={onBookDelete} />
          )}
          {categoryOpen == "status" && (
            <StatusInformation
              row={row}
              users={adminProps?.users ?? []}
              onSubmit={onStatusUpdate}
            />
          )}
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

function BookOptionsDropdown({ children, setCategory, rentAvailable, t }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>{children}</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          disabled={!rentAvailable}
          onClick={() => setCategory("rent")}
        >
          <BookUp2Icon className="mr-2 h-4 w-4" />
          <span>{t("options.rent")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setCategory("status")}>
          <InfoIcon className="mr-2 h-4 w-4" />
          <span>{t("options.status")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setCategory("edit")}>
          <PencilIcon className="mr-2 h-4 w-4" />
          <span>{t("options.edit")}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-500 focus:bg-red-500 focus:text-neutral-100 dark:focus:bg-red-800"
          onClick={() => setCategory("delete")}
        >
          <Trash2Icon className="mr-2 h-4 w-4" />
          <span>{t("options.delete")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

async function deleteBook(id) {
  try {
    const response = await (
      await fetch(`/api/catalog/${id}`, {
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

async function editBook(id, data) {
  try {
    const response = await (
      await fetch(`/api/catalog/${id}`, {
        method: "PUT",
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

async function statusUpdate(id, data) {
  try {
    const response = await (
      await fetch(`/api/catalog/${id}`, {
        method: "PATCH",
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

export default BookOptions;
