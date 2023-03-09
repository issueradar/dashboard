// import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /examples (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    '/((?!api/|_next/|_static/|examples/|[\\w-]+\\.\\w+).*)',
  ],
};

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;

  // Get hostname of request (e.g. demo.issueradar.com, demo.localhost:3000)
  const hostname = req.headers.get('host') || 'demo.issueradar.com';

  // Get the pathname of the request (e.g. /, /about, /blog/first-post)
  const path = url.pathname;

  /*  Do note that we'll still need to add "*.issueradar.vercel.app" as a wildcard domain on our Vercel dashboard. */
  // Returns `app` or `subdomain`
  const currentHost =
    process.env.NODE_ENV === 'production' && process.env.VERCEL === '1'
      ? hostname
          .replace(`.issueradar.com`, '')
          .replace(`.issueradar.vercel.app`, '')
      : hostname.replace(`.localhost:3000`, '');

  // rewrites for app pages
  if (currentHost === 'app') {
    if (
      url.pathname === '/login' &&
      (req.cookies.get('next-auth.session-token') ||
        req.cookies.get('__Secure-next-auth.session-token'))
    ) {
      url.pathname = '/';
      return NextResponse.redirect(url);
    }

    url.pathname = `/app${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // rewrite root application to `/home` folder
  if (
    ['localhost:3000', 'issueradar.vercel.app', 'issueradar.com'].includes(
      hostname,
    )
  ) {
    return NextResponse.rewrite(new URL(`/home${path}`, req.url));
  }

  // rewrite everything else to `/_projects/[project] dynamic route
  return NextResponse.rewrite(
    new URL(`/_projects/${currentHost}${path}`, req.url),
  );
}
