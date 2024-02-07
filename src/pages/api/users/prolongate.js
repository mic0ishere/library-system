import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/lib/prisma";
import isAdmin from "@/lib/is-admin";
import dateDifference from "@/lib/date-difference";

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

  if (req.method === "PATCH") {
    const { bookId } = req.query;
    if (!bookId) {
      res.status(400).json({
        message: "Book ID is required.",
        type: "error",
      });
      return;
    }

    const book = await prisma.book.findUnique({
      where: {
        id: bookId,
      },
      select: {
        dueDate: true,
        rentals: {
          select: {
            userId: true,
            rentedAt: true,
          },
        },
      },
    });

    if (!book) {
      res.status(404).json({
        message: "Book not found.",
        type: "error",
      });
      return;
    }

    const previousRental = book.rentals[book.rentals.length - 1];
    const newDueDate = new Date(
      new Date(book.dueDate).getTime() +
        1000 * 60 * 60 * 24 * process.env.NEXT_PUBLIC_PROLONGATIONTIME
    );

    await prisma.book.update({
      where: {
        id: bookId,
      },
      data: {
        dueDate: newDueDate,
        rentals: {
          update: {
            where: {
              unique_rental: {
                bookId: bookId,
                userId: previousRental.userId,
                rentedAt: previousRental.rentedAt,
              },
            },
            data: {
              dueDate: newDueDate,
            },
          },
        },
      },
    });

    res.status(200).json({
      message: "Book has been prolonged successfully.",
      type: "success",
      data: {
        newDueDate,
      },
    });
  } else {
    res.status(405).end();
  }
}
