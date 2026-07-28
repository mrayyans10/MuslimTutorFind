import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const protectedPrefixes = ["/dashboard", "/tutor", "/admin"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isProtected = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (isProtected && !req.auth) {
    const signInUrl = new URL("/sign-in", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/tutor/:path*", "/admin/:path*"],
};
