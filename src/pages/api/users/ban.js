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

  if (!isAdmin(session.user.email)) {
    res.status(403).end();
    return;
  }

  const t = await getTranslate(req, "ban");

  if (req.method === "PATCH") {
    const { userId } = req.query;
    if (!userId) {
      res.status(400).json({
        message: t("missingUserId"),
        type: "error",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: {
        userId,
      },
    });

    if (!user) {
      res.status(404).json({
        message: t("userNotFound"),
        type: "error",
      });
      return;
    }

    await prisma.user.update({
      where: {
        userId,
      },
      data: {
        isBanned: !user.isBanned,
      },
    });

    res.status(200).json({
      message: t(user.isBanned ? "userUnbanned" : "userBanned"),
      type: "success",
    });
  } else {
    res.status(405).end();
  }
}
