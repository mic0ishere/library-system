import NextAuth from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import { newId } from "@/lib/id";

/**
 * @type {import("next-auth").AuthOptions}
 */
export default NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
      tenantId: process.env.AZURE_AD_TENANT_ID,
      profile: (profile) => {
        return {
          id: profile.oid,
          userId: newId("user"),
          name: profile.name,
          email: profile.email,
        };
      },
    }),
  ],
});
