import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  // Use getUser() instead of getSession() for security
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // If the user is trying to access admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // Handle /admin root path
    if (request.nextUrl.pathname === "/admin") {
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profile?.role === "admin") {
          return NextResponse.redirect(new URL("/admin/dashboard", request.url));
        }
      }
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    
    // Allow access to login and auth pages without authentication
    if (
      request.nextUrl.pathname.startsWith("/admin/login")
    ) {
      // If already logged in as admin, redirect to admin dashboard
      if (user) {
        // Check if user has admin role
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profile?.role === "admin") {
          return NextResponse.redirect(new URL("/admin/dashboard", request.url));
        }
      }
      return response;
    }

    // For all other admin routes, require authentication AND admin role
    if (!user || error) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    // Check if user has admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      // User is authenticated but not an admin
      // Redirect to home page or show unauthorized page
      return NextResponse.redirect(new URL("/home", request.url));
    }
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/|images/).*)",
  ],
};