import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/collection")({
  beforeLoad: () => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw redirect({ to: "/login" });
    }
  },
  component: CollectionPage,
});

function CollectionPage() {
  return <div>Collection page</div>;
}
