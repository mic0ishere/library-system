import { SWRConfig } from "swr";
import prisma from "@/lib/prisma";

import BooksCatalog from "@/components/books-catalog";

export default function Catalog({ booksStr }) {
  return (
    <div className="w-full pt-8 pb-16 max-w-[900px]">
      <h1 className="text-4xl">Browse our catalog</h1>
      <p className="mt-2 mb-8">
        Our collection includes a wide range of books from various genres and
        authors. You can search for a specific book or browse through our
        collection to find something new to read.
      </p>
      <SWRConfig
        value={{
          fallback: {
            "/api/catalog": JSON.parse(booksStr),
          },
        }}
      >
        <BooksCatalog />
      </SWRConfig>
    </div>
  );
}

export async function getServerSideProps(context) {
  const books = await prisma.book.findMany();

  return {
    props: {
      booksStr: JSON.stringify(books),
    },
  };
}
