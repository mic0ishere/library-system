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

  const t = await getTranslate("catalog");

  if (req.method === "GET") {
    const books = await prisma.book.findMany();
    res.status(200).json(books);
  } else if (req.method === "POST" && isAdmin(session.user.email)) {
    const data = req.body;
    let validatedData = null;

    try {
      validatedData = Joi.attempt(data, bookSchema);
    } catch (error) {
      res.status(400).json({
        message: t("invalidDataProvided"),
        type: "error",
      });
      return console.error(error);
    }

    try {
      await prisma.book.create({
        data: validatedData,
      });
    } catch (error) {
      res.status(500).json({
        message: t("errorAddingBook"),
        type: "error",
      });
      return console.error(error);
    }

    res.status(201).json({
      message: t("successAdd", {
        title: validatedData.title,
      }),
      type: "success",
    });
  } else {
    res.status(405).end();
  }
}
