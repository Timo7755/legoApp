import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import api from "../lib/axios";

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: (search.token as string) ?? "",
    email: (search.email as string) ?? "",
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { token, email } = Route.useSearch();
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/reset-password", {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      setSuccess(res.data.message);
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (success)
    return (
      <div className="max-w-sm mx-auto mt-16 text-center">
        <div className="bg-white border border-gray-200 rounded-2xl p-8">
          <div className="text-4xl mb-4">✓</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Password reset
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            Your password has been reset successfully.
          </p>
          <a
            href="/login"
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium px-6 py-2.5 rounded-xl text-sm inline-block"
          >
            Log in
          </a>
        </div>
      </div>
    );

  return (
    <div className="max-w-sm mx-auto mt-16">
      <div className="bg-white border border-gray-200 rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Reset password
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Enter your new password below.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              New password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Confirm password
            </label>
            <input
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 text-gray-900 font-medium py-2 rounded-lg text-sm"
          >
            {loading ? "Resetting..." : "Reset password"}
          </button>
        </form>
      </div>
    </div>
  );
}
