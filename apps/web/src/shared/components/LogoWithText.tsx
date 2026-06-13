import { Link } from "react-router";
import { usePageTransitionLink } from "./PageTransitionProvider";
import LogoSquare from "./LogoSquare";

const LogoWithText = () => {
  const { linkProps } = usePageTransitionLink("/");

  return (
    <Link
      to="/"
      {...linkProps}
      aria-label="Knoxt.io home"
      className="flex items-center gap-2.5 px-4 py-3"
    >
      <LogoSquare alt="" className="size-10 rounded-lg" />
      <span className="text-xl font-semibold tracking-tight text-slate-950">
        Knoxt.io
      </span>
    </Link>
  );
};

export default LogoWithText;
