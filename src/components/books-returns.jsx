import useSWR from "swr";

import { Alert } from "@/components/ui/alert";
import BookReturnCard from "@/components/return-card";
import BookAlerts from "@/components/overdue-alerts";

function BooksReturns() {
  const { data, error } = useSWR("/api/catalog/my", (...args) =>
    fetch(...args).then((res) => res.json())
  );

  const books = data
    .map((book) => ({
      ...book,
      due: Math.floor(
        (new Date(book.dueDate) - new Date()) / (1000 * 60 * 60 * 24)
      ),
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
      {error && <Alert variant="error">{error.message}</Alert>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-8">
        {books.map((book) => (
          <BookReturnCard key={book.id} book={book} />
        ))}
      </div>
    </>
  );
}

export default BooksReturns;
