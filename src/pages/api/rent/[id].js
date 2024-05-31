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

  const t = await getTranslate(req, "rent");

  const { id: bookId } = req.query;

  if (req.method === "POST") {
    if (
      process.env.NEXT_PUBLIC_DISABLEUSERBORROWING &&
      !isAdmin(session.user.email)
    ) {
      res.status(200).json({
        message: t("borrowingDisabled"),
        type: "error",
      });
      return;
    }

    const book = await prisma.book.findUnique({
      where: {
        id: bookId,
      },
    });

    if (!book || book.status !== "AVAILABLE") {
      res.status(200).json({
        message: t("bookNotAvailable"),
        type: "error",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        isBanned: true,
        books: {
          select: {
            status: true,
          },
        },
      },
    });

    if (user.isBanned) {
      res.status(200).json({
        message: t("userBanned"),
        type: "error",
      });
      return;
    }

    const rentedBooks = user.books.filter((book) => book.status === "RENTED");

    if (rentedBooks.length >= process.env.NEXT_PUBLIC_MAXRENTALS) {
      res.status(200).json({
        message: t("limitReached"),
        type: "error",
      });
      return;
    }

    const dueDate = new Date(
      new Date().setDate(
        new Date().getDate() + process.env.NEXT_PUBLIC_DEFAULTRENTALTIME
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
      message: t("successRented"),
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
        message: t("bookNotRentedByUser"),
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
      message: t("successReturn"),
      type: "success",
    });
  } else {
    res.status(405).end();
  }
}
