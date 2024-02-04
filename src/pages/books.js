import { getSession } from "next-auth/react";
import prisma from "@/lib/prisma";
import BooksReturns from "@/components/books-returns";
import { SWRConfig } from "swr";

export default function Books({ userStr }) {
  const user = JSON.parse(userStr);

  return (
    <div className="w-full pt-8 pb-16 max-w-[900px]">
      <h1 className="text-4xl">Your rented books</h1>
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
      books: true,
    },
  });

  return {
    props: {
      userStr: JSON.stringify(user),
    },
  };
}
