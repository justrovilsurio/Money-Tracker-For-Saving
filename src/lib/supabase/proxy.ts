import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

function createCsp(nonce: string, supabaseOrigin: string | null) {
  const isDevelopment = process.env.NODE_ENV === "development";
  const websocketOrigin = supabaseOrigin?.replace(/^https:/, "wss:");
  const connectSources = ["'self'", supabaseOrigin, websocketOrigin].filter(Boolean).join(" ");

  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDevelopment ? " 'unsafe-eval'" : ""}`,
    `style-src 'self' 'nonce-${nonce}' https://api.fontshare.com${isDevelopment ? " 'unsafe-inline'" : ""}`,
    "img-src 'self' data: blob:",
    "font-src 'self' https://cdn.fontshare.com",
    `connect-src ${connectSources}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(isDevelopment ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}

export async function updateSession(request: NextRequest) {
  const env = getSupabasePublicEnv();
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = createCsp(nonce, env?.origin ?? null);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  let response = NextResponse.next({ request: { headers: requestHeaders } });

  if (env) {
    const supabase = createServerClient(env.url, env.publishableKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          requestHeaders.set("cookie", request.cookies.toString());
          response = NextResponse.next({ request: { headers: requestHeaders } });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    });

    // Refreshes/verifies the cookie session. Sensitive pages still verify claims in their DAL.
    await supabase.auth.getClaims();
  }

  response.headers.set("Content-Security-Policy", csp);
  return response;
}
