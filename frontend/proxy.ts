import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL!;

function redirectToLogin(request: NextRequest, clearCookies = true) {
  const response = NextResponse.redirect(new URL("/auth/login", request.url));
  if (clearCookies) {
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
  }
  return response;
}

export async function proxy(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;
  if (accessToken) return NextResponse.next();

  const refreshToken = request.cookies.get("refreshToken")?.value;
  if (!refreshToken) return redirectToLogin(request);

  try {
    const refreshRes = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: "POST",
      headers: { cookie: `refreshToken=${refreshToken}` },
      cache: "no-store",
    });

    // Refresh token invalid/expired → real logout
    if (refreshRes.status === 401 || refreshRes.status === 403) {
      return redirectToLogin(request);
    }

    // Backend down, cold start, 500... → redirect, but keep the cookies
    if (!refreshRes.ok) {
      return redirectToLogin(request, false);
    }

    // Success → forward the new cookies to the browser
    const response = NextResponse.next();
    for (const setCookie of refreshRes.headers.getSetCookie()) {
      response.headers.append("set-cookie", setCookie);
    }
    return response;
  } catch {
    return redirectToLogin(request, false);
  }
}

export const config = {
  matcher: ["/admin/:path*", "/agent/:path*", "/client/:path*"],
};