import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/verified")({
  component: () => (
    <div className="max-w-sm mx-auto mt-16 text-center">
      <div className="bg-white border border-gray-200 rounded-2xl p-8">
        <div className="text-4xl mb-4">✓</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Email verified
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          Your email has been verified successfully. You can now use all
          features.
        </p>
        <a
          href="/"
          className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium px-6 py-2.5 rounded-xl text-sm inline-block"
        >
          Go to LegoApp
        </a>
        Go to LegoApp
      </div>
    </div>
  ),
});
