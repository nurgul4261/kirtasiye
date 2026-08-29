import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    console.log(
      "ScrollToTop tetiklendi:",
      pathname,
      "mevcut scrollY:",
      window.scrollY,
    );
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
