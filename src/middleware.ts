import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Enhance the auth middleware with additional security features
export default authMiddleware({
  publicRoutes: ["/"],
  async beforeAuth(req: NextRequest) {
    // Add security headers
    const headers = new Headers();
    headers.set("X-DNS-Prefetch-Control", "on");
    headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
    headers.set("X-Frame-Options", "SAMEORIGIN");
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("Referrer-Policy", "origin-when-cross-origin");
    headers.set("X-XSS-Protection", "1; mode=block");

    // Block potentially harmful requests
    const url = req.nextUrl;
    if (url.pathname.startsWith("/.env")) {
      return new NextResponse(null, { status: 404 });
    }

    const response = NextResponse.next();
    // Apply security headers
    headers.forEach((value, key) => {
      response.headers.set(key, value);
    });

    return response;
  },

  async afterAuth(auth, req) {
    if (!auth.userId && !auth.isPublicRoute) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  },
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
