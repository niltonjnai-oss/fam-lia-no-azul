import type { ReactNode } from "react";

interface PageTitleProps {
  children: ReactNode;
}

export function PageTitle({ children }: PageTitleProps) {
  return (
    <h1 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">
      {children}
    </h1>
  );
}
