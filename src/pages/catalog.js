import { BookPlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SWRConfig } from "swr";
import BooksCatalog from "@/components/books-catalog";
import AddNewBookModal from "@/components/add-new-book";

import { columns } from "@/components/catalog-columns";

import { getSession } from "next-auth/react";
import isAdmin from "@/lib/is-admin";
import prisma from "@/lib/prisma";

export default function Catalog({ booksStr, isAdmin, adminProps }) {
  return (
    <div className="w-full pt-8 pb-16 max-w-[900px]">
      {isAdmin ? (
        <>
          <h1 className="text-4xl">Welcome to the catalog!</h1>
          <p className="mt-2 mb-4">
            You can edit book information, control their status or delete them
            from the catalog using the menu on the right side of each book. If
            you want to add a new book, just click the button below.
          </p>
        </>
      ) : (
        <>
          <h1 className="text-4xl">Browse our catalog</h1>
          <p className="mt-2 mb-8">
            Our collection includes a wide range of books from various genres
            and authors. You can search for a specific book or browse through
            our collection to find something new to read.
          </p>
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
              Add a new book
            </Button>
          </AddNewBookModal>
        )}
        <BooksCatalog columns={columns(isAdmin, JSON.parse(adminProps))} />
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
