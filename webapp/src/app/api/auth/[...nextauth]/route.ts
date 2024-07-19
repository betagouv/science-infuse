import NextAuth from "next-auth"
import { PrismaClient } from "@prisma/client"
import { authOptions } from "./authOptions";

const prisma = new PrismaClient()


const handler = NextAuth(authOptions)

export const GET = handler;
export const POST = handler;