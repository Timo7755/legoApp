import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import api from "../lib/axios";

export const Route = createFileRoute("/profile")({
  beforeLoad: () => {
    const token = localStorage.getItem("token");
    if (!token) throw redirect({ to: "/login" });
  },
  component: ProfilePage,
});

function ProfilePage() {
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const profileMutation = useMutation({
    mutationFn: () => api.patch("/user", { name, email }),
    onSuccess: (res) => {
      localStorage.setItem("user", JSON.stringify(res.data));
      setProfileSuccess("Profile updated successfully.");
      setProfileError("");
    },
    onError: (err: any) => {
      setProfileError(err.response?.data?.message ?? "Something went wrong.");
      setProfileSuccess("");
    },
  });

  const passwordMutation = useMutation({
    mutationFn: () =>
      api.patch("/user/password", {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      }),
    onSuccess: () => {
      setPasswordSuccess("Password changed successfully.");
      setPasswordError("");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (err: any) => {
      setPasswordError(err.response?.data?.message ?? "Something went wrong.");
      setPasswordSuccess("");
    },
  });

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Profile settings
      </h1>

      {/* Account info */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Account info</h2>

        {profileSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-4">
            {profileSuccess}
          </div>
        )}
        {profileError && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
            {profileError}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <button
            onClick={() => profileMutation.mutate()}
            disabled={profileMutation.isPending}
            className="bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 text-gray-900 font-medium py-2 rounded-lg text-sm"
          >
            {profileMutation.isPending ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>

      {/* Change password */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Change password</h2>

        {passwordSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-4">
            {passwordSuccess}
          </div>
        )}
        {passwordError && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
            {passwordError}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Current password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              New password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Confirm new password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <button
            onClick={() => passwordMutation.mutate()}
            disabled={passwordMutation.isPending}
            className="bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white font-medium py-2 rounded-lg text-sm"
          >
            {passwordMutation.isPending ? "Changing..." : "Change password"}
          </button>
        </div>
      </div>
    </div>
  );
}
