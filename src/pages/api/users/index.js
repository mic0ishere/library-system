import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/lib/prisma";
import isAdmin from "@/lib/is-admin";
import getTranslate from "@/lib/api-translation";

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

  const t = await getTranslate("users")

  if (req.method === "GET") {
    const { type } = req.query;

    if (type === "book") {
      const { bookId } = req.query;
      if (!bookId) {
        res.status(400).json({
          message: t("missingBookId"),
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
      res.status(400).json({
        message: t("invalidType"),
        type: "error",
      });
    }
  } else {
    res.status(405).end();
  }
}
