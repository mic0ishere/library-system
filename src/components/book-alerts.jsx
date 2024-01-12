import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { AlertCircle, Book } from "lucide-react";
import Link from "next/link";

function BookAlerts({ books = [] }) {
  const overdue = books
    .filter((book) => book.due < 0)
    .sort((a, b) => a.due - b.due);
  const dueSoon = books.filter((book) => book.due <= 3 && book.due >= 0);

  if (overdue.length === 1) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="w-6 h-6" />
        <AlertTitle className="font-semibold">Overdue book</AlertTitle>
        <AlertDescription>
          <Tooltip>
            <TooltipTrigger className="underline underline-offset-1 decoration-dashed font-semibold">
              {overdue[0].title}
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>
                <strong>{overdue[0].title}</strong> by {overdue[0].author}
              </p>
              <p className="text-xs">ISBN: {overdue[0].isbn}</p>
            </TooltipContent>
          </Tooltip>{" "}
          was due{" "}
          <span className="font-semibold">
            {new Intl.RelativeTimeFormat("en").format(overdue[0].due, "day")}
          </span>
          .<br /> Please return it as soon as possible.
        </AlertDescription>
      </Alert>
    );
  }

  if (overdue.length > 1) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="w-6 h-6" />
        <AlertTitle className="font-semibold">
          Multiple overdue books
        </AlertTitle>
        <AlertDescription>
          {overdue.slice(0, 3).map((book, index) => (
            <>
              <Tooltip key={`book-${index}`}>
                <TooltipTrigger className="underline underline-offset-1 decoration-dashed font-semibold">
                  {book.title}
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>
                    <strong>{book.title}</strong> by {book.author}
                  </p>
                  <p className="text-xs">ISBN: {book.isbn}</p>
                  <p className="font-semibold text-red-500">
                    Due{" "}
                    {new Intl.RelativeTimeFormat("en").format(book.due, "day")}
                  </p>
                </TooltipContent>
              </Tooltip>
              {index < overdue.length - 1 && ", "}
            </>
          ))}{" "}
          {overdue.length > 3 && (
            <>
              and{" "}
              <Tooltip>
                <TooltipTrigger className="underline underline-offset-1 decoration-dashed font-semibold">
                  <Link
                    href="/books"
                    className="underline underline-offset-1 decoration-dashed font-semibold"
                  >
                    {overdue.length - 3} more{" "}
                    {overdue.length - 3 === 1 ? "book" : "books"}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  {overdue.slice(3).map((book, index) => (
                    <p key={`book-${index}`}>
                      <strong>{book.title}</strong> by {book.author}
                    </p>
                  ))}
                </TooltipContent>
              </Tooltip>
            </>
          )}{" "}
          are overdue. Please return them as soon as possible.
        </AlertDescription>
      </Alert>
    );
  }

  if (dueSoon.length === 1) {
    return (
      <Alert variant="warning">
        <AlertCircle className="w-6 h-6" />
        <AlertTitle className="font-semibold">Book due soon</AlertTitle>
        <AlertDescription>
          <span className="font-semibold">
            {dueSoon[0].title} by {dueSoon[0].author}
          </span>{" "}
          is due within the next 3 days.
          <br />
          You can find more information in the{" "}
          <Link
            href="/books"
            className="underline underline-offset-1 decoration-dashed font-semibold"
          >
            My books
          </Link>{" "}
          section.
        </AlertDescription>
      </Alert>
    );
  }

  if (dueSoon.length > 1) {
    return (
      <Alert variant="warning">
        <AlertCircle className="w-6 h-6" />
        <AlertTitle className="font-semibold">Books due soon</AlertTitle>
        <AlertDescription>
          You have <span className="font-semibold">{dueSoon.length} books</span>
          due within the next 3 days.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert>
      <Book className="w-6 h-6" />
      <AlertTitle className="font-semibold">Get reading today</AlertTitle>
      <AlertDescription>
        Head over to{" "}
        <Link
          href="/catalog"
          className="underline underline-offset-1 decoration-dashed"
        >
          the catalog
        </Link>{" "}
        and browse our selection of books. Maybe you&apos;ll find your new
        favorite series today?
      </AlertDescription>
    </Alert>
  );
}

export default BookAlerts;
