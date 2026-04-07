import { useNavigate } from "react-router";
import { useCallback } from "react";

export function useAnimatedNavigate() {
  const navigate = useNavigate();

  return useCallback(
    (to: string | number, options?: { replace?: boolean }) => {
      if (typeof to === "number") {
        if (document.startViewTransition) {
          document.documentElement.classList.add("back-navigation");
          const transition = document.startViewTransition(() => {
            navigate(to);
          });
          transition.finished.then(() => {
            document.documentElement.classList.remove("back-navigation");
          });
        } else {
          navigate(to);
        }
        return;
      }

      if (!document.startViewTransition) {
        navigate(to, options);
        return;
      }

      document.startViewTransition(() => {
        navigate(to, options);
      });
    },
    [navigate],
  );
}
