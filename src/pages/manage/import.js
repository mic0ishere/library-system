import { AlertCircleIcon, CheckCircle2Icon, FolderUpIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { useState } from "react";
import { getSession } from "next-auth/react";
import useDictionary from "@/lib/use-translation";
import isAdmin from "@/lib/is-admin";

import Joi from "joi";
import { bookSchema } from "@/lib/book-schema";
import { parse } from "csv-parse/sync";
import { toast } from "sonner";
import PageTitle from "@/components/page-title";

export default function ManageReturns() {
  const [dragging, setDragging] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [books, setBooks] = useState([]);
  const [error, setError] = useState(null);

  const { t } = useDictionary("import-books");

  async function handleFileChange(e) {
    setDragging(false);

    const file = e.target?.files[0] || e.dataTransfer?.files[0];

    const reader = new FileReader();
    reader.readAsText(file);

    const fileContents = await new Promise((resolve) => {
      reader.onload = (event) => resolve(event.target.result);
    });

    setDisabled(true);

    try {
      const data = parse(fileContents, {
        columns: true,
        skip_empty_lines: true,
      });

      const books = [];

      for (const book of data) {
        try {
          const validatedData = Joi.attempt(book, bookSchema, {
            abortEarly: false,
            stripUnknown: true,
          });
          books.push({
            book: validatedData,
            errors: [],
            success: true,
          });
        } catch (error) {
          console.error(error);
          books.push({
            book: book,
            errors: error.details,
            success: false,
          });
        }
      }

      setBooks(books);
      setError(null);
    } catch (error) {
      e.target.value = "";

      console.error(error);

      setBooks([]);
      setError(error.message);
    }

    setDisabled(false);
  }

  return (
    <div className="w-full pt-8 pb-16 max-w-[900px]">
      <PageTitle>{t("pageTitle")}</PageTitle>
      <h1 className="text-4xl">{t("title")}</h1>
      <p className="mt-2 mb-4">{t("description")}</p>
      <Input
        type="file"
        accept=".csv, .txt, text/csv"
        className={`cursor-pointer h-auto border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900 ${
          dragging ? "border-2 border-dashed p-[15px]" : "p-4"
        }`}
        disabled={disabled}
        onDragOver={() => setDragging(true)}
        onDragLeave={() => setDragging(false)}
        onDrop={handleFileChange}
        onChange={handleFileChange}
      />
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>Error parsing CSV file</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {books?.length > 0 &&
        books.filter((book) => book.success).length > 0 &&
        !disabled && (
          <Button
            className="mt-8"
            size="lg"
            variant="outline"
            disabled={disabled}
            onClick={async () => {
              const booksToBeAdded = books
                .filter((book) => book.success)
                .map((book) => book.book);

              const afterPromise = (data) => {
                setBooks(books.filter((book) => !book.success));
                return data.message;
              };

              toast.promise(importBooks(booksToBeAdded), {
                loading: t("loadingAddBooks", booksToBeAdded.length),
                success: afterPromise,
                error: afterPromise,
              });
            }}
          >
            <FolderUpIcon className="size-5 mr-2" />
            {t("import")}{" "}
            <div className="mx-1 flex flex-row items-center text-green-600 dark:text-green-500">
              <CheckCircle2Icon className="size-4 mr-1" />
              <span>{t("ready")}</span>
            </div>{" "}
            {t("booksToCatalog")}
          </Button>
        )}
      {books?.length > 0 && (
        <Table className="mt-8">
          <TableHeader>
            <TableRow>
              <TableHead className="h-10 min-w-[100px]">
                {t("table.status")}
              </TableHead>
              <TableHead className="h-10 min-w-[200px]">
                {t("table.title")}
              </TableHead>
              <TableHead className="h-10 min-w-[200px]">
                {t("table.author")}
              </TableHead>
              <TableHead className="h-10 min-w-[150px]">
                {t("table.category")}
              </TableHead>
              <TableHead className="h-10 min-w-[80px]">
                {t("table.year")}
              </TableHead>
              <TableHead className="h-10 min-w-[80px]">
                {t("table.pages")}
              </TableHead>
              <TableHead className="h-10 min-w-[100px] text-right">
                {t("table.isbn")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {books.map(({ book, success, errors }, index) => (
              <TableRow key={index}>
                <TableCell className="text-center">
                  {success ? (
                    <div className="flex flex-row text-green-600 dark:text-green-500">
                      <CheckCircle2Icon className="size-5 mr-1.5" />
                      <span>{t("book.ready")}</span>
                    </div>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger className="flex flex-row underline underline-offset-1 decoration-dashed font-semibold text-red-600 dark:text-red-400">
                        <AlertCircleIcon className="size-5 mr-1.5" />
                        <span>{t("book.errors")}</span>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-red-500">
                        <ul>
                          {errors.map((error, index) => (
                            <li key={index}>{error.message}</li>
                          ))}
                        </ul>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </TableCell>
                <TableCell>{book.title}</TableCell>
                <TableCell>{book.author}</TableCell>
                <TableCell>{book.category}</TableCell>
                <TableCell>{book.year}</TableCell>
                <TableCell>{book.pages}</TableCell>
                <TableCell className="text-right">{book.isbn}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

async function importBooks(books) {
  try {
    const response = await (
      await fetch(`/api/catalog/import`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          books,
        }),
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

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session) {
    return {
      props: {},
    };
  }

  const admin = isAdmin(session.user.email);
  if (!admin) {
    return {
      notFound: true,
    };
  }

  return {
    props: {},
  };
}
