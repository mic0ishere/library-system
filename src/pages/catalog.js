import {
  BookPlusIcon,
  FileSpreadsheetIcon,
  UploadCloudIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SWRConfig } from "swr";
import BooksCatalog from "@/components/books-catalog";
import AddNewBookModal from "@/components/add-new-book";

import { columns } from "@/components/catalog-columns";

import { getSession } from "next-auth/react";
import isAdmin from "@/lib/is-admin";
import prisma from "@/lib/prisma";
import useDictionary from "@/lib/use-translation";
import Link from "next/link";

export default function Catalog({ booksStr, isAdmin, adminProps }) {
  const { t, hasLoaded } = useDictionary("catalog");

  return (
    <div
      className={`w-full pt-8 pb-16 max-w-[900px] ${
        !hasLoaded && "text-transparent"
      }`}
    >
      {isAdmin ? (
        <>
          <h1 className="text-4xl">{t("admin.title")}</h1>
          <p className="mt-2 mb-4">{t("admin.description")}</p>
        </>
      ) : (
        <>
          <h1 className="text-4xl">{t("user.title")}</h1>
          <p className="mt-2 mb-8">{t("user.description")}</p>
        </>
      )}
      <SWRConfig
        value={{
          fallback: {
            "/api/catalog": JSON.parse(booksStr),
          },
        }}
      >
        {isAdmin && (
          <div className="mb-6 w-full flex flex-col sm:flex-row gap-2 md:gap-4">
            <AddNewBookModal>
              <Button variant="secondary" className="w-full">
                <BookPlusIcon className="mr-2 h-5 w-5" />
                {t("admin.addBook")}
              </Button>
            </AddNewBookModal>
            <Button variant="secondary" className="w-full" asChild>
              <Link href="/manage/import">
                <UploadCloudIcon className="mr-2 h-5 w-5" />
                {t("admin.importBook")}
              </Link>
            </Button>
            <Button variant="secondary" className="w-full" asChild>
              <Link href="/sample-books-import.csv" locale={false}>
                <FileSpreadsheetIcon className="mr-2 h-5 w-5" />
                {t("admin.downloadSample")}
              </Link>
            </Button>
          </div>
        )}
        <BooksCatalog
          columns={columns(isAdmin, adminProps && JSON.parse(adminProps))}
        />
      </SWRConfig>
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

  const books = await prisma.book.findMany();

  const admin = isAdmin(session.user.email);
  if (!admin) {
    return {
      props: {
        isAdmin: false,
        booksStr: JSON.stringify(books),
      },
    };
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
    },
  });

  return {
    props: {
      isAdmin: true,
      booksStr: JSON.stringify(books),
      adminProps: JSON.stringify({
        users: users.map((user) => ({ value: user.id, label: user.name })),
      }),
    },
  };
}
