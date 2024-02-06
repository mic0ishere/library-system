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
      select: {
        books: {
          select: {
            status: true,
          },
        },
      },
    });

    const rentedBooks = user.books.filter((book) => book.status === "RENTED");

    if (rentedBooks.length >= process.env.NEXT_PUBLIC_MAXDEPOSITS) {
      res.status(200).json({
        message: `You have reached the maximum number of rented books. Please return a book to rent another one.`,
        type: "error",
      });
      return;
    }

    const dueDate = new Date(
      new Date().setDate(
        new Date().getDate() + process.env.NEXT_PUBLIC_DEFAULTDEPOSITTIME
      )
    );

    const rentedAt = new Date();

    await prisma.book.update({
      where: {
        id: bookId,
      },
      data: {
        status: "RENTED",
        rentedAt: rentedAt,
        dueDate: dueDate,
        rentedBy: {
          connect: {
            email: session.user.email,
          },
        },
        rentals: {
          create: {
            rentedAt: rentedAt,
            dueDate: dueDate,
            user: {
              connect: {
                email: session.user.email,
              },
            },
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
        rentals: true,
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

    const returnedAt = new Date();

    await prisma.book.update({
      where: {
        id: bookId,
      },
      data: {
        status: "BACK_SOON",
        returnedAt: returnedAt,
        rentals: {
          update: {
            where: {
              unique_rental: {
                bookId: book.id,
                userId: book.rentedBy.id,
                rentedAt: book.rentedAt,
              },
            },
            data: {
              returnedAt: returnedAt,
            },
          },
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
