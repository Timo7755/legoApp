import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import api from "../lib/axios";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await api.post("/forgot-password", { email });
      setSuccess(res.data.message);
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-16">
      <div className="bg-white border border-gray-200 rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Forgot password
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Enter your email and we'll send you a reset link.
        </p>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-4">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 text-gray-900 font-medium py-2 rounded-lg text-sm"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <p className="text-sm text-gray-500 text-center mt-6">
          <a
            href="/login"
            className="text-yellow-600 hover:text-yellow-700 font-medium"
          >
            Back to login
          </a>
        </p>
      </div>
    </div>
  );
}
