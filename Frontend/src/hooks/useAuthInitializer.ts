import { useEffect } from "react";
import { useDispatch } from "react-redux";

import {
  meApi,
  refreshApi,
} from "../api/auth.api";

import {
  clearAuth,
  setAccessToken,
  setCredentials,
  setLoading,
} from "../store/auth.store";

const useAuthInitializer = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    let isMounted = true;

    const initializeAuth =
      async (): Promise<void> => {
        try {
          // ==================================================
          // GET NEW ACCESS TOKEN
          // Refresh token is stored in HttpOnly cookie
          // ==================================================

          const refreshResponse =
            await refreshApi();

          if (!isMounted) {
            return;
          }

          const accessToken =
            refreshResponse.data.accessToken;

          if (!accessToken) {
            throw new Error(
              "Access token was not returned",
            );
          }

          // ==================================================
          // IMPORTANT
          // Save access token in Redux BEFORE /auth/me
          // ==================================================

          dispatch(
            setAccessToken(accessToken),
          );

          // ==================================================
          // GET CURRENT USER
          // Axios interceptor will automatically attach
          // the access token from Redux
          // ==================================================

          const meResponse =
            await meApi();

          if (!isMounted) {
            return;
          }

          // ==================================================
          // SAVE COMPLETE AUTH STATE
          // ==================================================

          dispatch(
            setCredentials({
              accessToken,
              user:
                meResponse.data.user,
            }),
          );
        } catch (error) {
          console.error(
            "Auth initialization failed:",
            error,
          );

          if (!isMounted) {
            return;
          }

          dispatch(clearAuth());
        } finally {
          if (isMounted) {
            dispatch(
              setLoading(false),
            );
          }
        }
      };

    void initializeAuth();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);
};

export default useAuthInitializer;