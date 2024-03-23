import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Book } from "lucide-react";
import Link from "next/link";
import useDictionary from "@/lib/use-translation";

function BookAlerts({ books = [], showCatalog = true }) {
  const t = useDictionary("overdueAlerts");

  const overdue = books
    .filter((book) => book.due < 0)
    .sort((a, b) => a.due - b.due);
  const dueSoon = books.filter((book) => book.due <= 3 && book.due >= 0);

  if (overdue.length === 1) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="w-6 h-6" />
        <AlertTitle className="font-semibold">
          {t("overdue.one.title")}
        </AlertTitle>
        <AlertDescription>
          <Tooltip>
            <TooltipTrigger className="underline underline-offset-1 decoration-dashed font-semibold">
              {overdue[0].title}
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>
                <strong>{overdue[0].title}</strong> {t("overdue.by")}{" "}
                {overdue[0].author}
              </p>
              <p className="text-xs">ISBN: {overdue[0].isbn}</p>
            </TooltipContent>
          </Tooltip>{" "}
          {overdue[0].due === 0 ? (
            <>
              {t("overdue.one.isDue")}{" "}
              <span className="font-semibold">{t("overdue.today")}</span>
            </>
          ) : (
            <>
              {t("overdue.one.wasDue")}{" "}
              <span className="font-semibold">
                {new Intl.RelativeTimeFormat(t("locale")).format(
                  overdue[0].due,
                  "day"
                )}
              </span>
            </>
          )}
          .<br />
          {t("overdue.one.notice")}
        </AlertDescription>
      </Alert>
    );
  }

  if (overdue.length > 1) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="w-6 h-6" />
        <AlertTitle className="font-semibold">
          {t("overdue.many.title")}
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
                    <strong>{book.title}</strong> {t("overdue.by")}{" "}
                    {book.author}
                  </p>
                  <p className="text-xs">ISBN: {book.isbn}</p>
                  <p className="font-semibold text-red-500">
                    {t("overdue.many.due")}{" "}
                    {book.due === 0
                      ? t("overdue.today")
                      : new Intl.RelativeTimeFormat(t("locale")).format(
                          book.due,
                          "day"
                        )}
                  </p>
                </TooltipContent>
              </Tooltip>
              {index < overdue.length - 1 && ", "}
            </>
          ))}{" "}
          {overdue.length > 3 && (
            <>
              {t("overdue.many.and")}{" "}
              <Tooltip>
                <TooltipTrigger className="underline underline-offset-1 decoration-dashed font-semibold">
                  <Link
                    href="/books"
                    className="underline underline-offset-1 decoration-dashed font-semibold"
                  >
                    {overdue.length - 3}{" "}
                    {overdue.length - 3 === 1
                      ? t("overdue.many.oneMore")
                      : t("overdue.many.multipleMore")}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  {overdue.slice(3).map((book, index) => (
                    <p key={`book-${index}`}>
                      <strong>{book.title}</strong> {t("overdue.by")}{" "}
                      {book.author}
                    </p>
                  ))}
                </TooltipContent>
              </Tooltip>
            </>
          )}{" "}
          {t("overdue.many.areOverdue")} {t("overdue.many.notice")}
        </AlertDescription>
      </Alert>
    );
  }

  if (dueSoon.length === 1) {
    return (
      <Alert variant="warning">
        <AlertCircle className="w-6 h-6" />
        <AlertTitle className="font-semibold">
          {t("dueSoon.one.title")}
        </AlertTitle>
        <AlertDescription>
          <span className="font-semibold">
            {dueSoon[0].title} {t("dueSoon.by")} {dueSoon[0].author}
          </span>{" "}
          {t("dueSoon.one.due")}
          <br />
          {t("dueSoon.one.preBooks")}{" "}
          <Link
            href="/books"
            className="underline underline-offset-1 decoration-dashed font-semibold"
          >
            {t("dueSoon.one.books")}
          </Link>{" "}
          {t("dueSoon.one.afterBooks")}
        </AlertDescription>
      </Alert>
    );
  }

  if (dueSoon.length > 1) {
    return (
      <Alert variant="warning">
        <AlertCircle className="w-6 h-6" />
        <AlertTitle className="font-semibold">
          {t("dueSoon.many.title")}
        </AlertTitle>
        <AlertDescription>
          {t("dueSoon.many.preBooks")}{" "}
          <span className="font-semibold">
            {dueSoon.length} {t("dueSoon.many.books")}
          </span>{" "}
          {t("dueSoon.many.afterBooks")}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    showCatalog && (
      <Alert>
        <Book className="w-6 h-6" />
        <AlertTitle className="font-semibold">{t("browse.title")}</AlertTitle>
        <AlertDescription>
          {t("browse.preCatalog")}{" "}
          <Link
            href="/catalog"
            className="underline underline-offset-1 decoration-dashed"
          >
            {t("browse.catalog")}
          </Link>{" "}
          {t("browse.afterCatalog")}
        </AlertDescription>
      </Alert>
    )
  );
}

export default BookAlerts;
