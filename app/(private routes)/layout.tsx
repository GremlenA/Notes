import { ReactNode } from "react";

interface PrivateLayoutProps {
  children: ReactNode;
}

export default function PrivateLayout({ children }: PrivateLayoutProps) {
  // Захист маршрутів вже працює в middleware.ts та AuthProvider.
  // Тут ми просто рендеримо контент приватної зони.
  return <>{children}</>;
}