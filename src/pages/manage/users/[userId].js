import { BookCheckIcon, CalendarClockIcon, GavelIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ReturnedBookCard from "@/components/returned-book-card";
import BookReturnCard from "@/components/return-card";
import PreviousRentalsTable from "@/components/previous-rentals-table";

import { useState } from "react";
import { getSession } from "next-auth/react";
import isAdmin from "@/lib/is-admin";
import prisma from "@/lib/prisma";

import { toast } from "sonner";
import dateDifference from "@/lib/date-difference";
import useDictionary from "@/lib/use-translation";

export default function ManageUser({ isAdmin, userStr }) {
  const [user, setUser] = useState(JSON.parse(userStr));

  const [books, setBooks] = useState(user.books);

  const { t } = useDictionary("manage-user");

  const rentedBooks = books
    .filter((book) => book.status === "RENTED")
    .map((book) => ({
      ...book,
      due: dateDifference(book.dueDate, Date.now()),
    }))
    .sort((a, b) => a.due - b.due);
  const returnedBooks = books.filter((book) => book.status === "BACK_SOON");
  const overdueBooks = rentedBooks.filter((book) => book.due < 0);

  async function swapBook(book) {
    setBooks(books.map((b) => (b.id === book.id ? book : b)));
  }

  async function swapPreviousRental(book, updatedInfo) {
    const previousRentals = user.previousRentals.map((rental) =>
      rental.bookId === book.id && rental.rentedAt === book.rentedAt
        ? {
            ...rental,
            ...updatedInfo,
          }
        : rental
    );

    setUser({
      ...user,
      previousRentals,
    });
  }

  async function updateData(route, body = {}) {
    try {
      const response = await (
        await fetch(route, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
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

  function onProlongateClick(e, book) {
    e.target.disabled = true;

    toast.promise(updateData(`/api/users/prolongate?bookId=${book.id}`), {
      loading: t("loadingProlongate", book.title),
      success: (result) => {
        swapBook({
          ...book,
          dueDate: new Date(result.data.dueDate),
          due: dateDifference(result.data.dueDate, Date.now()),
        });

        swapPreviousRental(book, {
          dueDate: new Date(result.data.dueDate),
        });

        e.target.disabled = false;
        return result.message;
      },
      error: (data) => data.message,
    });
  }

  function onReturnClick(e, book) {
    e.target.disabled = true;

    toast.promise(
      updateData(`/api/catalog/${book.id}`, {
        status: "BACK_SOON",
      }),
      {
        loading: t("loadingReturn", book.title),
        success: (data) => {
          swapBook({
            ...book,
            status: "BACK_SOON",
            returnedAt: new Date(),
          });

          swapPreviousRental(book, {
            returnedAt: new Date(),
          });

          e.target.disabled = false;
          return data.message;
        },
        error: (data) => data.message,
      }
    );
  }

  return (
    <div className="w-full pt-8 pb-16 max-w-[900px]">
      <h1 className="text-4xl">{t("title")}</h1>
      <div className="flex flex-row mt-2">
        <h2 className="text-2xl text-neutral-500 font-medium">{user.name}</h2>
        <Badge
          variant={
            isAdmin ? "default" : user.isBanned ? "destructive" : "secondary"
          }
          className="ml-2"
        >
          {isAdmin
            ? t("role.admin")
            : user.isBanned
            ? t("role.banned")
            : t("role.user")}
        </Badge>
      </div>
      <div className="mt-4 text-lg [&_span]:text-neutral-500">
        <p>
          <span>{t("books.rented")}</span> {rentedBooks.length}
        </p>
        <p>
          <span>{t("books.overdue")}</span> {overdueBooks.length}
        </p>
        <p>
          <span>{t("books.total")}:</span> {user.previousRentals.length}
        </p>
        <p>
          <span>{t("registeredAt")}:</span>{" "}
          {new Date(user.createdAt).toLocaleString()}
        </p>
        <p>
          <span>{t("email")}: </span>
          {user.email}
        </p>
        <Button
          variant="destructive"
          className="mt-4 px-6"
          size="sm"
          onClick={(e) => {
            e.target.disabled = true;

            toast.promise(updateData(`/api/users/ban?userId=${user.userId}`), {
              loading: t(
                user.isBanned ? "loadingUnban" : "loadingBan",
                user.name
              ),
              success: (data) => {
                setUser({
                  ...user,
                  isBanned: !user.isBanned,
                });
                e.target.disabled = false;
                return data.message;
              },
              error: (data) => data.message,
            });
          }}
        >
          <GavelIcon className="w-5 h-5 mr-2" />
          {user.isBanned ? t("unbanUser") : t("banUser")}
        </Button>
      </div>
      <h2 className="text-2xl mt-12">
        {t("rentedTitle")} ({rentedBooks.length})
      </h2>
      {overdueBooks.length > 0 && (
        <p className="text-lg text-red-500 font-semibold">
          {t(overdueBooks.length === 1 ? "overdueOne" : "overdueMany", {
            count: overdueBooks.length,
          })}
        </p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-4">
        {rentedBooks.length > 0 &&
          rentedBooks.map((book) => (
            <BookReturnCard
              key={book.id}
              book={book}
              showDetails={false}
              showReturn={false}
            >
              <div className="flex flex-col sm:flex-row md:flex-col xl:flex-row gap-2 items-center justify-between mt-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={(e) => onProlongateClick(e, book)}
                >
                  {t("prolongateBook", {
                    days: process.env.NEXT_PUBLIC_PROLONGATIONTIME,
                  })}
                  <CalendarClockIcon className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={(e) => onReturnClick(e, book)}
                >
                  {t("returnBook")}
                  <BookCheckIcon className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </BookReturnCard>
          ))}
        {rentedBooks.length === 0 && (
          <p className="text-lg text-neutral-500 mb-8">{t("noRentedBooks")}</p>
        )}
      </div>
      <h2 className="text-2xl mt-12">
        {t("returnedTitle")} ({returnedBooks.length})
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full mt-4">
        {returnedBooks.length > 0 &&
          returnedBooks.map((book) => (
            <ReturnedBookCard
              key={book.id}
              book={book}
              showUser={false}
              setBooks={setBooks}
              books={books}
            />
          ))}
        {returnedBooks.length === 0 && (
          <p className="text-lg text-neutral-500 mb-8">
            {t("noReturnedBooks")}
          </p>
        )}
      </div>
      <h2 className="text-2xl mt-12 pb-4">
        {t("previousTitle")} ({user.previousRentals.length})
      </h2>
      <PreviousRentalsTable
        maxHeight="80vh"
        rentals={user.previousRentals}
        isUser
      />
    </div>
  );
}

export async function getServerSideProps({ req, res, params: { userId } }) {
  const session = await getSession({ req });

  if (!session || !isAdmin(session?.user?.email)) {
    return {
      notFound: true,
    };
  }

  const user = await prisma.user.findUnique({
    where: {
      userId,
    },
    select: {
      userId: true,
      email: true,
      name: true,
      isBanned: true,
      createdAt: true,
      books: true,
      previousRentals: {
        select: {
          bookId: true,
          rentedAt: true,
          dueDate: true,
          returnedAt: true,
          book: {
            select: {
              author: true,
              title: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      isAdmin: isAdmin(user.email),
      userStr: JSON.stringify(user),
    },
  };
}
