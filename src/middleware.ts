import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";

// Protected route prefixes — any path starting with these requires auth
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/deployments",
  "/tickets",
  "/environments",
  "/activity",
  "/reports",
  "/settings",
];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!req.auth;

  // Check if the path requires auth
  const requiresAuth = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (requiresAuth && !isAuthenticated) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect logged-in users away from login page
  if (pathname === "/login" && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Redirect root to dashboard or login
  if (pathname === "/") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  // Match all paths except static assets and Next.js internals
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
