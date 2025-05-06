import { NextResponse, NextRequest } from "next/server";
import { getUserAction } from "./lib/authism/server/actions/auth";

export default async function middleware(req: NextRequest) {
  const user = await getUserAction();
  if (user?.role === "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  return NextResponse.next();
}

export const config = {
    matcher: '/',
}