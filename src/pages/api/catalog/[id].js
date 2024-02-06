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
      include: {
        rentals: true,
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

  if (req.method === "PATCH") {
    const { status, userId = null } = data;

    if (book.status === status) {
      res.status(200).json({
        message: `Book is already ${status}`,
        type: "error",
      });
      return;
    }

    try {
      if (
        ["AVAILABLE", "NOT_AVAILABLE"].includes(status) &&
        book.status === "RENTED"
      ) {
        const previousRental = book.rentals[book.rentals.length - 1];

        const returnedAt = new Date();
        await prisma.book.update({
          where: {
            id: bookId,
          },
          data: {
            status,
            returnedAt,
            rentals: {
              update: {
                where: {
                  unique_rental: {
                    bookId: book.id,
                    userId: previousRental.userId,
                    rentedAt: previousRental.rentedAt,
                  },
                },
                data: {
                  returnedAt: returnedAt,
                },
              },
            },
          },
        });
      } else if (status === "BACK_SOON") {
        const previousRental = book.rentals[book.rentals.length - 1];
        if (!previousRental) {
          res.status(400).json({
            message: "No previous rental found",
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
            rentedAt: previousRental.rentedAt,
            dueDate: previousRental.dueDate,
            returnedAt: previousRental.returnedAt || returnedAt,
            rentedBy: {
              connect: {
                id: previousRental.userId,
              },
            },
            rentals: {
              update: {
                where: {
                  unique_rental: {
                    bookId: book.id,
                    userId: previousRental.userId,
                    rentedAt: previousRental.rentedAt,
                  },
                },
                data: {
                  returnedAt: previousRental.returnedAt || returnedAt,
                },
              },
            },
          },
        });
      } else if (status === "RENTED") {
        if (!userId) {
          res.status(400).json({
            message: "User ID is required to change status",
            type: "error",
          });
          return;
        }

        const user = await prisma.user.findUnique({
          where: {
            id: userId,
          },
        });

        if (!user) {
          res.status(404).json({
            message: "User not found",
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
            returnedAt: null,
            rentedBy: { connect: { id: userId } },
            rentals: {
              create: {
                rentedAt: rentedAt,
                dueDate: dueDate,
                user: {
                  connect: {
                    id: userId,
                  },
                },
              },
            },
          },
        });
      } else {
        await prisma.book.update({
          where: {
            id: bookId,
          },
          data: {
            status,
            rentedAt: null,
            dueDate: null,
            returnedAt: null,
            rentedBy: {
              disconnect: true,
            },
          },
        });
      }
    } catch (error) {
      res.status(500).json({
        message:
          "Error occured while updating book status in the catalog. Please try again later.",
        type: "error",
      });
      return console.error(error);
    }

    res.status(200).json({
      message: `Updated status of ${book.title} in the catalog`,
      type: "success",
    });
  } else if (req.method === "PUT") {
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
