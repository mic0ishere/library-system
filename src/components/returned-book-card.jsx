import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLinkIcon } from "lucide-react";
import Link from "next/link";

import dateDifference from "@/lib/date-difference";
import { toast } from "sonner";
import useDictionary from "@/lib/use-translation";

function ReturnedBookCard({ book, showUser = true, setBooks, books }) {
  const { t } = useDictionary("returned-book-card");

  async function confirmBook() {
    try {
      const response = await (
        await fetch(`/api/catalog/${book.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "AVAILABLE",
          }),
        })
      ).json();

      if (response.type === "success") {
        setBooks(books.filter((b) => b.id !== book.id));
        return response;
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error("Error:", error);
      throw new Error(error.message || "An unexpected error occured");
    }
  }

  return (
    <Card key={book.id} className="h-full flex flex-col justify-between">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">{book.title}</CardTitle>
        {showUser && (
          <CardDescription>
            <span className="font-semibold">{t("rentedBy")}:</span>{" "}
            {book?.rentedBy?.name || t("unknownUser")}
          </CardDescription>
        )}
        <ul className="text-sm ml-4 md:list-disc">
          <li>
            {t("rented")}: {new Date(book.rentedAt).toLocaleDateString()}
          </li>
          <li>
            {t("returned")}:{" "}
            <span
              className={
                dateDifference(book.returnedAt, book.dueDate) > 0 &&
                "text-red-600 dark:text-red-400 font-semibold"
              }
            >
              {new Date(book.returnedAt).toLocaleDateString()}
            </span>
          </li>
          <li>
            {t("due")}: {new Date(book.dueDate).toLocaleDateString()}
          </li>
        </ul>
      </CardHeader>
      <CardContent>
        <Button
          className="w-full"
          size="sm"
          onClick={async (e) => {
            e.target.disabled = true;

            toast.promise(confirmBook(book.id), {
              loading: t("loadingReturn", book.title),
              success: (data) => data.message,
              error: (data) => data.message,
            });
          }}
        >
          {t("confirmReturn")}
        </Button>
        {showUser && (
          <Link href={`/manage/users/${book?.rentedBy?.userId || ""}`}>
            <Button className="w-full mt-2" variant="outline" size="sm">
              {t("viewUser")} <ExternalLinkIcon className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

export default ReturnedBookCard;
