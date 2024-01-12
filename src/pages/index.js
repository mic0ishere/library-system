import BookAlerts from "@/components/book-alerts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  BookCheck,
  ExternalLink,
  FolderOpen,
  LibraryBig,
  LockKeyhole,
  Users,
} from "lucide-react";
import { getSession, useSession } from "next-auth/react";
import Link from "next/link";

// const books = [
//   {
//     title: "The Lord of the Rings",
//     author: "J.R.R. Tolkien",
//     isbn: "978-0618640157",
//     due: -5,
//   },
//   {
//     title: "The Hobbit",
//     author: "J.R.R. Tolkien",
//     isbn: "978-0547928227",
//     due: -1,
//   },
//   {
//     title: "The Lord of the Rings",
//     author: "J.R.R. Tolkien",
//     isbn: "978-0618640157",
//     due: -5,
//   },
//   {
//     title: "The Hobbit",
//     author: "J.R.R. Tolkien",
//     isbn: "978-0547928227",
//     due: -1,
//   },
// ];

const books = [
  {
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    isbn: "978-0547928227",
    due: 1,
  },
];

// const books = [];

export default function Home({ user, isAdmin }) {
  return (
    <div className="pt-8 pb-16">
      <h1 className="text-4xl">Hello, {user.name ?? ""}</h1>
      <div className="flex justify-center w-full max-w-[600px] mt-6">
        <BookAlerts books={books} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-[600px] mt-12">
        <Card>
          <Link href="/catalog">
            <CardHeader>
              <FolderOpen />
              <CardTitle>Catalog</CardTitle>
              <CardDescription>
                Browse and search through books from our collection and borrow
                one to read today.
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>
        <Card>
          <Link href="/books">
            <CardHeader>
              <LibraryBig />
              <CardTitle>My books</CardTitle>
              <CardDescription>
                View and manage the books you have borrowed from our library and
                renew them if you need more time.
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>
        {isAdmin && (
          <>
            <Card>
              <Link
                href="/users"
                className="h-full flex flex-col justify-between"
              >
                <CardHeader>
                  <Users />
                  <CardTitle>Manage users</CardTitle>
                  <CardDescription>
                    View, search and manage the users of our library.
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <LockKeyhole className="h-4 w-4 mr-1" /> Admin Only
                </CardFooter>
              </Link>
            </Card>
            <Card className="h-full flex flex-col justify-between">
              <CardHeader className="pb-2">
                <BookCheck />
                <CardTitle>Book management</CardTitle>
              </CardHeader>
              <CardContent>
                <Link href="/catalog/status">
                  <Button className="w-full" variant="outline" size="sm">
                    Extensions and returns
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
                <Link href="/catalog/manage">
                  <Button className="w-full mt-2" variant="outline" size="sm">
                    Add and remove books
                    <ExternalLink className="h-4 w-4 ml-1" />
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

  return {
    props: {
      user: session?.user,
      isAdmin: process.env.ADMINS.includes(session.user.email.toLowerCase()),
    },
  };
}
