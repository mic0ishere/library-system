import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ReturnedBookCard from "@/components/returned-book-card";
import { ExternalLinkIcon } from "lucide-react";
import Link from "next/link";

import { useState } from "react";
import { getSession } from "next-auth/react";
import isAdmin from "@/lib/is-admin";
import prisma from "@/lib/prisma";
import dateDifference from "@/lib/date-difference";
import useDictionary from "@/lib/use-translation";
import PageTitle from "@/components/page-title";

export default function ManageReturns({ confirmationStr, overdueStr }) {
  const [confirmationBooks, setConfirmationBooks] = useState(
    JSON.parse(confirmationStr)
  );
  const overdueBooks = JSON.parse(overdueStr);

  const { t } = useDictionary("manage-returns");

  return (
    <div className="w-full pt-8 pb-16 max-w-[900px]">
      <PageTitle>{t("pageTitle")}</PageTitle>
      <h1 className="text-4xl">{t("title")}</h1>
      <p className="mt-2 mb-4">{t("description")}</p>
      {confirmationBooks.length === 0 && (
        <div className="text-center py-12">
          <h1 className="text-2xl font-semibold">{t("noBooks.title")}</h1>
          <p className="text-lg">{t("noBooks.description")}</p>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full mt-4">
        {confirmationBooks.length > 0 &&
          confirmationBooks.map((book) => (
            <ReturnedBookCard
              key={book.id}
              book={book}
              setBooks={setConfirmationBooks}
              books={confirmationBooks}
            />
          ))}
      </div>
      {overdueBooks.length > 0 && (
        <>
          <h2 className="text-2xl mt-8">{t("overdueBooks.title")}</h2>
          <p className="mt-2 mb-4">{t("overdueBooks.description")}</p>
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
                      <span className="font-semibold">{t("rentedBy")}:</span>{" "}
                      {book.rentedBy.name}
                    </CardDescription>
                    <ul className="text-sm ml-4 md:list-disc">
                      <li>
                        {t("rentedAt")}:{" "}
                        {new Date(book.rentedAt).toLocaleDateString()}
                      </li>
                      <li>
                        {t("dueAt")}:{" "}
                        {new Date(book.dueDate).toLocaleDateString()} (
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
                        {t("viewUser")}{" "}
                        <ExternalLinkIcon className="ml-1 h-4 w-4" />
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
