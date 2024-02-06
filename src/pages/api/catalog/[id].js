import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/lib/prisma";
import isAdmin from "@/lib/is-admin";
import Joi from "joi/lib";
import { bookSchema } from "@/lib/book-schema";

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

  const { id: bookId } = req.query;
  const data = req.body;

  const book = await prisma.book
    .findUnique({
      where: {
        id: bookId,
      },
    })
    .catch((error) => {
      res.status(500).json({
        message:
          "Error occured while fetching book from the catalog. Please try again later.",
        type: "error",
      });
      return console.error(error);
    });

  if (!book) {
    res.status(404).json({
      message: "Book not found in the catalog",
      type: "error",
    });
    return;
  }

  if (req.method === "PUT") {
    try {
      Joi.assert(data, bookSchema);
    } catch (error) {
      res.status(400).json({
        message:
          "Invalid data provided. Please check information and try again.",
        type: "error",
      });
      return console.error(error);
    }

    try {
      await prisma.book.update({
        where: {
          id: bookId,
        },
        data,
      });
    } catch (error) {
      res.status(500).json({
        message:
          "Error occured while updating book in the catalog. Please try again later.",
        type: "error",
      });
      return console.error(error);
    }

    res.status(200).json({
      message: `Updated ${data.title} in the catalog`,
      type: "success",
    });
  } else if (req.method === "DELETE") {
    try {
      await prisma.book.delete({
        where: {
          id: bookId,
        },
      });
    } catch (error) {
      res.status(500).json({
        message:
          "Error occured while deleting book from the catalog. Please try again later.",
        type: "error",
      });
      return console.error(error);
    }

    res.status(200).json({
      message: `Deleted ${book.title} from the catalog`,
      type: "success",
    });
  } else {
    res.status(405).end();
  }
}
