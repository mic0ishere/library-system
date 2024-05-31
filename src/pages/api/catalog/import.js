import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/lib/prisma";
import isAdmin from "@/lib/is-admin";
import Joi from "joi/lib";
import { bookSchema } from "@/lib/book-schema";
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

  const t = await getTranslate(req, "import");

  const { books } = req.body;

  if (req.method === "POST") {
    const validatedBooks = books.map((book) => {
      try {
        const validatedData = Joi.attempt(book, bookSchema);
        return validatedData;
      } catch (error) {
        console.error(error);
        return {
          error: error.message,
        };
      }
    });

    if (validatedBooks.some((book) => book.error)) {
      res.status(400).json({
        message: t("invalidDataProvided"),
        type: "error",
      });
      return;
    }

    try {
      await prisma.book.createMany({
        data: validatedBooks,
      });
    } catch (error) {
      res.status(500).json({
        message: t("errorAddingBooks"),
        type: "error",
      });
      return console.error(error);
    }

    res.status(201).json({
      message: t("success", {
        count: books.length,
      }),
      type: "success",
    });
  } else {
    res.status(405).end();
  }
}
