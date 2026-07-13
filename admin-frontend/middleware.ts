import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    // elle empêche l'utilisateur lambda de juste taper /admin dans l'URL sans être connecté
  const token = request.cookies.get("accessToken");

  if (!token) {
    console.log("❌ Pas de token, redirection vers /login");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  console.log("✅ Token présent, accès autorisé");
  return NextResponse.next(); //laisse passer vers la page demandée
}

export const config = {
  matcher: ["/admin/:path*"], //le middleware ne s'applique QUE sur les routes commençant par /admin

  // : signifie un paramètre (varie)
  // * signifie zéro ou plusieurs segments
};