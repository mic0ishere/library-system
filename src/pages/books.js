import { SWRConfig } from "swr";
import BooksReturns from "@/components/books-returns";

import { getSession } from "next-auth/react";
import prisma from "@/lib/prisma";

export default function Books({ userStr }) {
  const user = JSON.parse(userStr);

  return (
    <div
      className={`w-full pt-8 pb-16 ${
        user.books.length > 0 ? "max-w-[900px]" : "max-w-[600px]"
      }`}
    >
      <SWRConfig value={{ fallback: { "/api/catalog/my": user.books } }}>
        <BooksReturns />
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
      userStr: JSON.stringify(user),
    },
  };
}
