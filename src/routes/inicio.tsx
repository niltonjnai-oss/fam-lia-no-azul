// A landing page mudou de /inicio para a raiz (/). Este redirect preserva
// links antigos (anúncios, emails, favoritos).

import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/inicio")({
  beforeLoad: () => {
    throw redirect({ to: "/", replace: true });
  },
});
