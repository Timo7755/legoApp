import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/email/verify")({
  validateSearch: (search: Record<string, unknown>) => ({
    url: (search.url as string) ?? "",
  }),
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const { url } = Route.useSearch();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );

  useEffect(() => {
    if (!url) {
      setStatus("error");
      return;
    }

    const decodedUrl = decodeURIComponent(url);

    fetch(decodedUrl, {
      headers: { Accept: "application/json" },
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          if (data.token) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
          }
          setStatus("success");
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  }, [url]);

  if (status === "loading")
    return (
      <div className="max-w-sm mx-auto mt-16 text-center">
        <div className="bg-white border border-gray-200 rounded-2xl p-8">
          <p className="text-gray-500">Verifying your email...</p>
        </div>
      </div>
    );

  if (status === "success")
    return (
      <div className="max-w-sm mx-auto mt-16 text-center">
        <div className="bg-white border border-gray-200 rounded-2xl p-8">
          <div className="text-4xl mb-4">✓</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Email verified
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            You're now logged in. Welcome to LegoApp!
          </p>
          <a
            href="/"
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium px-6 py-2.5 rounded-xl text-sm inline-block"
          >
            Go to LegoApp
          </a>
        </div>
      </div>
    );

  return (
    <div className="max-w-sm mx-auto mt-16 text-center">
      <div className="bg-white border border-gray-200 rounded-2xl p-8">
        <div className="text-4xl mb-4">✗</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Verification failed
        </h1>
        <p className="text-gray-500 text-sm mb-6">The link may have expired.</p>
        <a
          href="/login"
          className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium px-6 py-2.5 rounded-xl text-sm inline-block"
        >
          Back to login
        </a>
      </div>
    </div>
  );
}
