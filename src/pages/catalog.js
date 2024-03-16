import { BookPlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SWRConfig } from "swr";
import BooksCatalog from "@/components/books-catalog";
import AddNewBookModal from "@/components/add-new-book";

import { columns } from "@/components/catalog-columns";

import { getSession } from "next-auth/react";
import isAdmin from "@/lib/is-admin";
import prisma from "@/lib/prisma";
import useDictionary from "@/lib/use-translation";

export default function Catalog({ booksStr, isAdmin, adminProps }) {
  const t = useDictionary("catalog");

  return (
    <div className="w-full pt-8 pb-16 max-w-[900px]">
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
          <AddNewBookModal>
            <Button
              variant="secondary"
              className="mb-8 w-full sm:w-auto min-w-[250px]"
            >
              <BookPlusIcon className="mr-2 h-5 w-5" />
              {t("admin.addBook")}
            </Button>
          </AddNewBookModal>
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
