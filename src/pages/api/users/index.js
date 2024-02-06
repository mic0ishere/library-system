import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/lib/prisma";
import isAdmin from "@/lib/is-admin";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    res.status(401).end();
    return;
  }

  if (!isAdmin(session.user.email)) {
    res.status(403).end();
    return;
  }

  if (req.method === "GET") {
    const { type, bookId = null } = req.query;

    if (type === "book") {
      if (!bookId) {
        res.status(400).json({
          message: "Book ID is required.",
          type: "error",
        });
        return;
      }

      const bookUsers = await prisma.book.findFirst({
        where: {
          id: bookId,
        },
        include: {
          rentals: {
            include: {
              user: true,
            },
          },
        },
      });

      res.status(200).json(bookUsers);
    } else {
      const users = await prisma.user.findMany({});

      res.status(200).json(users);
    }
  } else {
    res.status(405).end();
  }
}
