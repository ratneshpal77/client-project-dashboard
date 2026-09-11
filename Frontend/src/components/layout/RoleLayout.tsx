import type { ReactNode } from "react";
import { useSelector } from "react-redux";

import AppLayout from "./AppLayout";
import type { RootState } from "../../store/auth.store";

interface RoleLayoutProps {
  children: ReactNode;
}

const RoleLayout = ({ children }: RoleLayoutProps) => {
  const user = useSelector(
    (state: RootState) => state.auth.user,
  );

  if (!user) {
    return null;
  }

  return (
    <AppLayout role={user.role}>
      {children}
    </AppLayout>
  );
};

export default RoleLayout;