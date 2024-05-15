import useSWR from "swr";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import BookReturnCard from "@/components/return-card";
import BookAlerts from "@/components/overdue-alerts";
import dateDifference from "@/lib/date-difference";
import useDictionary from "@/lib/use-translation";

function BooksReturns() {
  const { data, error } = useSWR("/api/catalog/my", (...args) =>
    fetch(...args).then((res) => res.json())
  );

  const books = data
    .map((book) => ({
      ...book,
      due: dateDifference(book.dueDate, Date.now()),
    }))
    .sort((a, b) => a.due - b.due);

  const { t } = useDictionary("books-returns");

  return (
    <>
      <h1 className="text-4xl">{t("title")}</h1>
      <p
        className="mt-2 mb-4"
        dangerouslySetInnerHTML={{
          __html: t("description", {
            current: books.length,
            max: process.env.NEXT_PUBLIC_MAXRENTALS,
          }),
        }}
      ></p>
      <BookAlerts books={books} showCatalog={books.length === 0} />
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-8">
        {books
          .filter((book) => typeof book.due === "number")
          .map((book) => (
            <BookReturnCard key={book.id} book={book} />
          ))}
      </div>
    </>
  );
}

export default BooksReturns;
