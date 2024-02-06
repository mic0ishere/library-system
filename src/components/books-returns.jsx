import useSWR from "swr";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import BookReturnCard from "@/components/return-card";
import BookAlerts from "@/components/overdue-alerts";
import dateDifference from "@/lib/date-difference";

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

  return (
    <>
      <p className="mt-2 mb-4">
        You are currently renting{" "}
        <strong>
          {books.length}/{process.env.NEXT_PUBLIC_MAXDEPOSITS}
        </strong>{" "}
        books. You can return them at any time by clicking the return button
        below.
      </p>
      <BookAlerts books={books} showCatalog={books.length === 0} />
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-8">
        {books.map((book) => (
          <BookReturnCard key={book.id} book={book} />
        ))}
      </div>
    </>
  );
}

export default BooksReturns;
