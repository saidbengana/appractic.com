import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create a new ratelimiter that allows 10 requests per 10 seconds
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});

// Enhance the auth middleware with additional security features
export default authMiddleware({
  publicRoutes: ["/"],
  async beforeAuth(req: NextRequest) {
    // Rate limiting
    const ip = req.ip ?? "127.0.0.1";
    const { success, pending, limit, reset, remaining } = await ratelimit.limit(
      `ratelimit_${ip}`
    );

    if (!success) {
      return new NextResponse("Too Many Requests", {
        status: 429,
        headers: {
          "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
        },
      });
    }

    // Add security headers
    const response = NextResponse.next();
    
    // Security Headers
    response.headers.set("X-DNS-Prefetch-Control", "on");
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
    response.headers.set("X-Frame-Options", "SAMEORIGIN");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "origin-when-cross-origin");
    response.headers.set(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' clerk.appractic.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' clerk.appractic.com *.clerk.accounts.dev;"
    );
    
    // CORS Headers
    if (req.method === "OPTIONS") {
      response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
      response.headers.set("Access-Control-Max-Age", "86400");
    }
    
    // Allow specific origins
    const allowedOrigins = [
      "https://appractic.com",
      "https://app.appractic.com",
      process.env.NEXT_PUBLIC_APP_URL,
    ].filter(Boolean);
    
    const origin = req.headers.get("origin");
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Credentials", "true");
    }

    return response;
  },
  
  async afterAuth(auth, req) {
    if (!auth.userId && !auth.isPublicRoute) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
  },
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
