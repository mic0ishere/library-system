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
        message:
          "Invalid data provided. Please check information and try again.",
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
        message:
          "Error occured while adding book to the catalog. Please try again later.",
        type: "error",
      });
      return console.error(error);
    }

    res.status(201).json({
      message: `Added ${data.title} to the catalog`,
      type: "success",
    });
  } else {
    res.status(405).end();
  }
}
