import type { ReactNode } from "react";

import useAuthInitializer from "../../hooks/useAuthInitializer";

interface AuthInitializerProps {
  children: ReactNode;
}

const AuthInitializer = ({
  children,
}: AuthInitializerProps) => {
  useAuthInitializer();

  return <>{children}</>;
};

export default AuthInitializer;