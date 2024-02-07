import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ReturnedBookCard from "@/components/returned-book-card";
import BookReturnCard from "@/components/return-card";

import { useState } from "react";
import { getSession } from "next-auth/react";
import isAdmin from "@/lib/is-admin";
import prisma from "@/lib/prisma";
import { toast } from "sonner";
import dateDifference from "@/lib/date-difference";

export default function ManageUser({ isAdmin, userStr }) {
  const [user, setUser] = useState(JSON.parse(userStr));

  const [books, setBooks] = useState(user.books);

  const rentedBooks = books
    .filter((book) => book.status === "RENTED")
    .map((book) => ({
      ...book,
      due: dateDifference(book.dueDate, Date.now()),
    }))
    .sort((a, b) => a.due - b.due);
  const returnedBooks = books.filter((book) => book.status === "BACK_SOON");
  const overdueBooks = rentedBooks.filter((book) => book.due < 0);

  async function updateData(route, onSuccess) {
    try {
      const response = await (
        await fetch(`/api/users${route}`, {
          method: "PATCH",
        })
      ).json();

      if (response.type === "success") {
        onSuccess(response?.data);
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
      <h1 className="text-4xl">Manage user</h1>
      <div className="flex flex-row mt-2">
        <h2 className="text-2xl text-neutral-500 font-medium">{user.name}</h2>
        <Badge
          variant={
            isAdmin ? "default" : user.isBanned ? "destructive" : "secondary"
          }
          className="ml-2"
        >
          {isAdmin ? "Admin" : user.isBanned ? "Banned" : "User"}
        </Badge>
      </div>
      <div className="mt-4 text-lg [&_span]:text-neutral-500">
        <p>
          <span>Rented books:</span> {rentedBooks.length}
        </p>
        <p>
          <span>Overdue books:</span> {overdueBooks.length}
        </p>
        <p>
          <span>Total rentals:</span> {user.previousRentals.length}
        </p>
        <p>
          <span>Registered:</span> {new Date(user.createdAt).toLocaleString()}
        </p>
        <p>
          <span>Email: </span>
          {user.email}
        </p>
        <Button
          variant="destructive"
          className="mt-4 px-8"
          size="sm"
          onClick={(e) => {
            e.target.disabled = true;

            toast.promise(
              updateData(`/ban?userId=${user.userId}`, () =>
                setUser({
                  ...user,
                  isBanned: !user.isBanned,
                })
              ),
              {
                loading: `${user.isBanned ? "Unbanning" : "Banning"} ${
                  user.name
                }...`,
                success: (data) => data.message,
                error: (data) => data.message,
              }
            );

            e.target.disabled = false;
          }}
        >
          {user.isBanned ? "Unban" : "Ban"} user
        </Button>
      </div>
      <h2 className="text-2xl mt-12">Rented books ({rentedBooks.length})</h2>
      {overdueBooks.length > 0 && (
        <p className="text-lg text-red-500 font-semibold">
          {overdueBooks.length} overdue{" "}
          {overdueBooks.length === 1 ? "book" : "books"}
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
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={(e) => {
                  e.target.disabled = true;

                  toast.promise(
                    updateData(`/prolongate?bookId=${book.id}`, (data) =>
                      setBooks(
                        books.map((b) =>
                          b.id === book.id
                            ? {
                                ...b,
                                dueDate: new Date(data.newDueDate),
                                due: dateDifference(
                                  data.newDueDate,
                                  Date.now()
                                ),
                              }
                            : b
                        )
                      )
                    ),
                    {
                      loading: `Prolongating ${book.title}...`,
                      success: (data) => data.message,
                      error: (data) => data.message,
                    }
                  );

                  e.target.disabled = false;
                }}
              >
                Prolongate (+{process.env.NEXT_PUBLIC_PROLONGATIONTIME} days)
              </Button>
            </BookReturnCard>
          ))}
        {rentedBooks.length === 0 && (
          <p className="text-lg text-neutral-500 mb-8">No rented books</p>
        )}
      </div>
      <h2 className="text-2xl mt-12">
        Returned books ({returnedBooks.length})
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full mt-4">
        {returnedBooks.length > 0 &&
          returnedBooks.map((book) => (
            <ReturnedBookCard
              key={book.id}
              book={book}
              showUser={false}
              setBooks={(books) => setBooks(books)}
              books={returnedBooks}
            />
          ))}
        {returnedBooks.length === 0 && (
          <p className="text-lg text-neutral-500 mb-8">No returned books</p>
        )}
      </div>
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
      previousRentals: true,
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
