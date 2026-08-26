import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/rota-titan")({
  beforeLoad: () => {
    throw redirect({
      to: "/iniciantes",
    });
  },
  component: () => null,
});
