import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (request.nextUrl.pathname === "/admin/login") return NextResponse.next();

    const authToken = request.cookies.get("authToken");
    const userRole = request.cookies.get("userRole");

    if (!authToken || !userRole || userRole.value !== "ADMIN")
      return NextResponse.redirect(new URL("/admin/login", request.url));

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(authToken.value, secret);

      return NextResponse.next();
    } catch (err) {
      console.error("JWT verification failed:", err);
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
