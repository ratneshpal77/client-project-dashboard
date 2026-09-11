import {
  useEffect,
} from "react";

import {
  useSelector,
} from "react-redux";

import type {
  RootState,
} from "../../store/auth.store";

import {
  connectSocket,
  disconnectSocket,
} from "../../services/socket";

const SocketManager = () => {
  const accessToken =
    useSelector(
      (state: RootState) =>
        state.auth.accessToken,
    );

  const isAuthenticated =
    useSelector(
      (state: RootState) =>
        state.auth.isAuthenticated,
    );

  useEffect(() => {
    if (
      !isAuthenticated ||
      !accessToken
    ) {
      disconnectSocket();
      return;
    }

    connectSocket(accessToken);

    return () => {
      disconnectSocket();
    };
  }, [
    accessToken,
    isAuthenticated,
  ]);

  return null;
};

export default SocketManager;