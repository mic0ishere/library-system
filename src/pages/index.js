import {
  BookCheck,
  FolderOpen,
  LibraryBig,
  LockKeyhole,
  Users,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BookAlerts from "@/components/overdue-alerts";
import Link from "next/link";

import { getSession } from "next-auth/react";
import prisma from "@/lib/prisma";
import isAdmin from "@/lib/is-admin";
import dateDifference from "@/lib/date-difference";
import useDictionary from "@/lib/use-translation";
import { useEffect } from "react";

export default function Home({ user, isAdmin, booksStr }) {
  const books = JSON.parse(booksStr);

  const t = useDictionary("home");

  return (
    <div className="max-w-[600px] pt-8 pb-16">
      <h1 className="text-4xl">
        {t("welcome")}, {user.name ?? ""}
      </h1>
      <div className="flex justify-center w-full mt-6">
        <BookAlerts books={books} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full mt-12">
        <Card>
          <Link href="/catalog">
            <CardHeader>
              <FolderOpen />
              <CardTitle>{t("catalog.title")}</CardTitle>
              <CardDescription>{t("catalog.description")}</CardDescription>
            </CardHeader>
          </Link>
        </Card>
        <Card>
          <Link href="/books">
            <CardHeader>
              <LibraryBig />
              <CardTitle>{t("books.title")}</CardTitle>
              <CardDescription>{t("books.description")}</CardDescription>
            </CardHeader>
          </Link>
        </Card>
        {isAdmin && (
          <>
            <Card>
              <CardHeader className="pb-4">
                <Users />
                <CardTitle>
                  {t("users.title")}
                  <LockKeyhole className="inline h-3.5 w-3.5 ml-2" />
                </CardTitle>
                <CardDescription>{t("users.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/manage/users">
                  <Button className="w-full" variant="secondary" size="sm">
                    {t("users.button")}
                  </Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="h-full flex flex-col justify-between">
              <CardHeader className="pb-4">
                <BookCheck />
                <CardTitle>
                  {t("returns.title")}
                  <LockKeyhole className="inline h-3.5 w-3.5 ml-2" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Link href="/manage/returns">
                  <Button className="w-full" variant="secondary" size="sm">
                    {t("returns.button")}
                  </Button>
                </Link>
                <Link href="/catalog">
                  <Button className="w-full mt-2" variant="secondary" size="sm">
                    {t("returns.catalog")}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </>
        )}
      </div>
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

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
    include: {
      books: {
        where: {
          status: "RENTED",
        },
      },
    },
  });

  return {
    props: {
      user: session?.user,
      booksStr: JSON.stringify(
        user.books
          .map((book) => ({
            ...book,
            due: dateDifference(book.dueDate, Date.now()),
          }))
          .filter((book) => book.due <= 3)
      ),
      isAdmin: isAdmin(session.user.email),
    },
  };
}
