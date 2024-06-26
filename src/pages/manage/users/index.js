import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLinkIcon, SearchIcon } from "lucide-react";
import Link from "next/link";

import { useState } from "react";
import { useRouter } from "next/router";
import { getSession } from "next-auth/react";
import isAdmin from "@/lib/is-admin";
import prisma from "@/lib/prisma";
import dateDifference from "@/lib/date-difference";
import formatEmail from "@/lib/format-email";
import useDictionary from "@/lib/use-translation";
import PageTitle from "@/components/page-title";

export default function ManageUsers({ usersStr }) {
  const users = JSON.parse(usersStr);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const { t } = useDictionary("manage-users");

  return (
    <div className="w-full pt-8 pb-16 max-w-[900px]">
      <PageTitle>{t("pageTitle")}</PageTitle>
      <h1 className="text-4xl">{t("title")}</h1>
      <p className="mt-2 mb-4">{t("description")}</p>
      {users.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-neutral-500">{t("noUsers")}</p>
        </div>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <div className="w-full sm:w-1/2 sm:px-1.5 mx-auto">
          <PopoverTrigger asChild>
            <Button
              variant="secondary"
              size="full"
              role="combobox"
              aria-controls="user-select"
              aria-expanded={open}
            >
              {t("search")}
              <SearchIcon className="ml-2 h-4 w-4 opacity-70" />
            </Button>
          </PopoverTrigger>
        </div>
        <PopoverContent className="p-0">
          <Command>
            <CommandInput placeholder={`${t("search")}...`} />
            <CommandEmpty>{t("noFound")}</CommandEmpty>
            <CommandGroup>
              {users.map((user) => (
                <CommandItem
                  key={user.userId}
                  className="cursor-pointer"
                  onSelect={() => {
                    setOpen(false);
                    router.push(`/manage/users/${user.userId}`);
                  }}
                >
                  {user.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full mt-2">
        {users.length > 0 &&
          users.map(formatEmail).map((user) => (
            <Card
              key={user.userId}
              className="h-full flex flex-col justify-between"
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">{user.name}</CardTitle>
                <CardDescription className="break-normal text-xs">
                  {user.parsedEmail}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 w-full items-center justify-center">
                  <div>
                    <h1 className="text-2xl font-bold">{user.books.length}</h1>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {t("rentedBooks")}
                    </p>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">
                      {
                        user.books.filter(
                          (b) => dateDifference(Date.now(), b.dueDate) > 0
                        ).length
                      }
                    </h1>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {t("overdueBooks")}
                    </p>
                  </div>
                </div>
                <Link href={`/manage/users/${user.userId}`}>
                  <Button className="w-full mt-2" variant="outline" size="sm">
                    {t("viewUser")}{" "}
                    <ExternalLinkIcon className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}

export async function getServerSideProps({ req, res }) {
  const session = await getSession({ req });

  if (!session || !isAdmin(session?.user?.email)) {
    return {
      notFound: true,
    };
  }

  const users = await prisma.user.findMany({
    select: {
      userId: true,
      email: true,
      name: true,
      books: {
        where: {
          status: "RENTED",
        },
        select: {
          id: true,
          dueDate: true,
        },
      },
    },
  });

  return {
    props: {
      usersStr: JSON.stringify(users ?? []),
    },
  };
}
