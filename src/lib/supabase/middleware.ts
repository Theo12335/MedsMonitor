import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Protected routes - redirect to login if not authenticated
  const protectedRoutes = ["/dashboard", "/setup"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Check if user needs to complete setup and enforce role-based access
  if (user && pathname.startsWith("/dashboard")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("setup_completed, role")
      .eq("id", user.id)
      .single();

    // Redirect to setup if not completed
    if (profile && !profile.setup_completed) {
      const url = request.nextUrl.clone();
      url.pathname = "/setup";
      return NextResponse.redirect(url);
    }

    // Enforce role-based route protection
    if (profile) {
      const url = request.nextUrl.clone();

      // Caregivers cannot access admin routes
      if (profile.role === "caregiver" && pathname.startsWith("/dashboard/admin")) {
        url.pathname = "/dashboard/caregiver";
        return NextResponse.redirect(url);
      }

      // Admins cannot access caregiver routes (redirect to admin dashboard)
      if (profile.role === "admin" && pathname.startsWith("/dashboard/caregiver")) {
        url.pathname = "/dashboard/admin";
        return NextResponse.redirect(url);
      }
    }
  }

  // Redirect to dashboard if already logged in and trying to access login
  if (pathname === "/login" && user) {
    // Check if setup is complete
    const { data: profile } = await supabase
      .from("profiles")
      .select("setup_completed, role")
      .eq("id", user.id)
      .single();

    const url = request.nextUrl.clone();
    if (profile && !profile.setup_completed) {
      url.pathname = "/setup";
    } else if (profile?.role === "admin") {
      url.pathname = "/dashboard/admin";
    } else {
      url.pathname = "/dashboard/caregiver";
    }
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
