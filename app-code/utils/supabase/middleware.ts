import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

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
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
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

  // IMPORTANT: Do NOT write any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake can avoid sessions from
  // being refreshed.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If request is for /admin path but user is not logged in, redirect to login page:
  if (!user && request.nextUrl.pathname.startsWith('/admin') && request.nextUrl.pathname !== '/admin/login') {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    return NextResponse.redirect(url);
  }

  // If user is already logged in and tries to access /admin/login, redirect to /admin:
  if (user && request.nextUrl.pathname === '/admin/login') {
    const url = request.nextUrl.clone();
    url.pathname = '/admin';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
