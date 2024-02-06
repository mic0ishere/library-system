import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ExternalLinkIcon } from "lucide-react";
import Link from "next/link";

import { useState } from "react";
import { getSession } from "next-auth/react";
import { toast } from "sonner";
import isAdmin from "@/lib/is-admin";
import prisma from "@/lib/prisma";
import dateDifference from "@/lib/date-difference";

export default function ManageReturns({ confirmationStr, overdueStr }) {
  const [confirmationBooks, setConfirmationBooks] = useState(
    JSON.parse(confirmationStr)
  );
  const overdueBooks = JSON.parse(overdueStr);

  async function confirmBook(id) {
    try {
      const response = await (
        await fetch(`/api/catalog/${id}`, {
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
        setConfirmationBooks(confirmationBooks.filter((b) => b.id !== id));
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
    <div className="w-full pt-8 pb-16 max-w-[900px]">
      <h1 className="text-4xl">Manage book statuses</h1>
      <p className="mt-2 mb-4">
        Here, you can see the books that were marked as returned by the users
        and are waiting for your confirmation on their status in order to be
        available in the catalog again.
      </p>
      {confirmationBooks.length === 0 && (
        <div className="text-center py-12">
          <h1 className="text-2xl font-semibold">Congratulations!</h1>
          <p className="text-lg">
            There are no books waiting for confirmation at the moment.
          </p>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full mt-4">
        {confirmationBooks.length > 0 &&
          confirmationBooks.map((book) => (
            <Card
              key={book.id}
              className="h-full flex flex-col justify-between"
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">{book.title}</CardTitle>
                <CardDescription>
                  <span className="font-semibold">Rented by:</span>{" "}
                  {book.rentedBy.name}
                </CardDescription>
                <ul className="text-sm ml-4 md:list-disc">
                  <li>
                    Rented: {new Date(book.rentedAt).toLocaleDateString()}
                  </li>
                  <li>
                    Returned:{" "}
                    <span
                      className={
                        dateDifference(book.returnedAt, book.dueDate) > 0 &&
                        "text-red-600 dark:text-red-400 font-semibold"
                      }
                    >
                      {new Date(book.returnedAt).toLocaleDateString()}
                    </span>
                  </li>
                  <li>Due: {new Date(book.dueDate).toLocaleDateString()}</li>
                </ul>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  size="sm"
                  onClick={async (e) => {
                    e.target.disabled = true;

                    toast.promise(confirmBook(book.id), {
                      loading: `Confirming return of ${book.title}...`,
                      success: (data) => data.message,
                      error: (data) => data.message,
                    });
                  }}
                >
                  Confirm return
                </Button>
                <Link
                  href={`/manage/users/${book.rentedBy.userId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="w-full mt-2" variant="outline" size="sm">
                    View user <ExternalLinkIcon className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
      </div>
      {overdueBooks.length > 0 && (
        <>
          <h2 className="text-2xl mt-8">Overdue books</h2>
          <p className="mt-2 mb-4">
            Here, you can see the books that are currently rented and are
            overdue.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full mt-4">
            {overdueBooks
              .sort((a, b) => dateDifference(a.dueDate, b.dueDate))
              .map((book) => (
                <Card
                  key={book.id}
                  className="h-full flex flex-col justify-between"
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl">{book.title}</CardTitle>
                    <CardDescription>
                      <span className="font-semibold">Rented by:</span>{" "}
                      {book.rentedBy.name}
                    </CardDescription>
                    <ul className="text-sm ml-4 md:list-disc">
                      <li>
                        Rented: {new Date(book.rentedAt).toLocaleDateString()}
                      </li>
                      <li>
                        Due: {new Date(book.dueDate).toLocaleDateString()} (
                        <span className="font-semibold">
                          {new Intl.RelativeTimeFormat("en").format(
                            dateDifference(book.dueDate, Date.now()),
                            "day"
                          )}
                        </span>
                        )
                      </li>
                    </ul>
                  </CardHeader>
                  <CardContent>
                    <Link
                      href={`/manage/users/${book.rentedBy.userId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button className="w-full" variant="outline" size="sm">
                        View user <ExternalLinkIcon className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
          </div>
        </>
      )}
    </div>
  );
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

  const books = await prisma.book.findMany({
    where: {
      status: {
        in: ["BACK_SOON", "RENTED"],
      },
    },
    select: {
      id: true,
      status: true,
      title: true,
      rentedAt: true,
      dueDate: true,
      returnedAt: true,
      rentedBy: {
        select: {
          name: true,
          userId: true,
        },
      },
    },
  });

  return {
    props: {
      confirmationStr: JSON.stringify(
        books.filter((x) => x.status === "BACK_SOON") || []
      ),
      overdueStr: JSON.stringify(
        books.filter(
          (x) =>
            x.status === "RENTED" && dateDifference(x.dueDate, Date.now()) < 0
        ) || []
      ),
    },
  };
}
