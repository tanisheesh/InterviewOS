import { clerkMiddleware } from "@clerk/nextjs/server";

// Auth is enforced per-layout via auth() from @clerk/nextjs/server.
// Middleware only initialises Clerk on every request.
export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
