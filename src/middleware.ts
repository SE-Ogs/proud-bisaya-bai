import { type NextRequest } from "next/server"
import { updateSession } from "@/utils/supabase/middleware"

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    "/((?!admin/api|_next/static|_next/image|admin/login|admin/auth|favicon.ico).*)",
  ],
}
