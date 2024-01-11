import BookAlerts from "@/components/book-alerts";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useSession } from "next-auth/react";

const books = [
  {
    title: "The Lord of the Rings",
    author: "J.R.R. Tolkien",
    isbn: "978-0618640157",
    due: -5,
  },
  {
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    isbn: "978-0547928227",
    due: -1,
  },
  {
    title: "The Lord of the Rings",
    author: "J.R.R. Tolkien",
    isbn: "978-0618640157",
    due: -5,
  },
  {
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    isbn: "978-0547928227",
    due: -1,
  },
];

// const books = [
//   {
//     title: "The Hobbit",
//     author: "J.R.R. Tolkien",
//     isbn: "978-0547928227",
//     due: 1,
//   },
// ];

// const books = [];

export default function Home() {
  const {
    data: { user },
  } = useSession();
  return (
    <TooltipProvider>
      <h1 className="text-4xl">Hello, {user.name}</h1>
      <div className="flex justify-center w-full max-w-[600px] mt-6">
        <BookAlerts books={books} />
      </div>
    </TooltipProvider>
  );
}
