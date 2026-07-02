import { createBrowserClient, type CookieOptions } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const rememberSessionCookieName = "nect_remember_session";
const persistentCookieMaxAge = 400 * 24 * 60 * 60;

type BrowserClientOptions = {
  rememberSession?: boolean;
};

function parseDocumentCookies() {
  if (typeof document === "undefined") {
    return [];
  }

  return document.cookie
    .split(";")
    .map((cookie) => cookie.trim())
    .filter(Boolean)
    .map((cookie) => {
      const separatorIndex = cookie.indexOf("=");
      const name = separatorIndex >= 0 ? cookie.slice(0, separatorIndex) : cookie;
      const value = separatorIndex >= 0 ? cookie.slice(separatorIndex + 1) : "";

      return {
        name: decodeURIComponent(name),
        value: decodeURIComponent(value),
      };
    });
}

function serializeDocumentCookie(name: string, value: string, options: CookieOptions) {
  const parts = [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`];

  if (options.maxAge !== undefined) {
    parts.push(`Max-Age=${Math.floor(options.maxAge)}`);
  }

  if (options.expires) {
    parts.push(`Expires=${options.expires.toUTCString()}`);
  }

  if (options.domain) {
    parts.push(`Domain=${options.domain}`);
  }

  if (options.path) {
    parts.push(`Path=${options.path}`);
  }

  if (options.sameSite) {
    parts.push(`SameSite=${String(options.sameSite)}`);
  }

  if (options.secure) {
    parts.push("Secure");
  }

  return parts.join("; ");
}

function getCookieOptionsForSession(value: string, options: CookieOptions, rememberSession: boolean) {
  if (rememberSession || !value) {
    return options;
  }

  const sessionCookieOptions = { ...options };
  delete sessionCookieOptions.maxAge;
  delete sessionCookieOptions.expires;

  return sessionCookieOptions;
}

function readRememberSessionPreference() {
  return parseDocumentCookies().find((cookie) => cookie.name === rememberSessionCookieName)?.value !== "false";
}

function writeRememberSessionPreference(rememberSession: boolean) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = serializeDocumentCookie(rememberSessionCookieName, String(rememberSession), {
    path: "/",
    sameSite: "lax",
    ...(rememberSession ? { maxAge: persistentCookieMaxAge } : {}),
  });
}

export const createClient = (options: BrowserClientOptions = {}) => {
  if (options.rememberSession !== undefined) {
    writeRememberSessionPreference(options.rememberSession);
  }

  const rememberSession = options.rememberSession ?? readRememberSessionPreference();
  const useDefaultClient = options.rememberSession === undefined && rememberSession;

  return createBrowserClient(supabaseUrl!, supabaseKey!, {
    isSingleton: useDefaultClient,
    cookies: useDefaultClient
      ? undefined
      : {
          getAll() {
            return parseDocumentCookies();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              document.cookie = serializeDocumentCookie(
                name,
                value,
                getCookieOptionsForSession(value, options, rememberSession),
              );
            });
          },
        },
  });
};
