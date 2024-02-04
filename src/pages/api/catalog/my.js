import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    res.status(401).end();
    return;
  }

  if (req.method === "GET") {
    const books = await prisma.book.findMany({
      where: {
        rentedBy: {
          email: session.user.email,
        },
      },
    });

    res.status(200).json(books);
  } else {
    res.status(405).end();
  }
}