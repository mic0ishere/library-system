import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    res.status(401).end();
    return;
  }

  const { id: bookId } = req.query;

  if (req.method === "POST") {
    const book = await prisma.book.findUnique({
      where: {
        id: bookId,
      },
    });

    if (!book || book.status !== "AVAILABLE") {
      res.status(200).json({
        message:
          "Book is not available for rent at the moment. Please try again later.",
        type: "error",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      include: {
        books: true,
      },
    });

    if (user.books.length >= process.env.NEXT_PUBLIC_MAXDEPOSITS) {
      res.status(200).json({
        message: `You have reached the maximum number of rented books. Please return a book to rent another one.`,
        type: "error",
      });
      return;
    }

    await prisma.book.update({
      where: {
        id: bookId,
      },
      data: {
        status: "RENTED",
        dueDate: new Date(
          new Date().setDate(
            new Date().getDate() + process.env.NEXT_PUBLIC_DEFAULTDEPOSITTIME
          )
        ),
        rentedBy: {
          connect: {
            email: session.user.email,
          },
        },
      },
    });

    res.status(200).json({
      message: "Book has been rented successfully",
      type: "success",
    });
  } else if (req.method === "DELETE") {
    const book = await prisma.book.findUnique({
      where: {
        id: bookId,
      },
      include: {
        rentedBy: true,
      },
    });

    if (
      !book ||
      book.status !== "RENTED" ||
      book.rentedBy.email !== session.user.email
    ) {
      res.status(200).json({
        message:
          "Book is not connected to your account. Please try again later.",
        type: "error",
      });
      return;
    }

    await prisma.book.update({
      where: {
        id: bookId,
      },
      data: {
        status: "BACK_SOON",
        returnedAt: new Date(),
        previousRenterId: book.rentedBy.id,
        rentedBy: {
          disconnect: true,
        },
      },
    });

    res.status(200).json({
      message: "Book has been returned successfully",
      type: "success",
    });
  } else {
    res.status(405).end();
  }
}
