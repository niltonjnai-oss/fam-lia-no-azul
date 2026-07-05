import type { ReactNode } from "react";

interface PageTitleProps {
  children: ReactNode;
}

export function PageTitle({ children }: PageTitleProps) {
  return (
    <h1 className="t-h1 text-primary">
      {children}
    </h1>
  );
}
