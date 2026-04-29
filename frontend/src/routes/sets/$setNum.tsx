import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sets/$setNum")({
  component: () => <div>Set detail page</div>,
});
