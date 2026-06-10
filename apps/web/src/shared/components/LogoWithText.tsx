import LogoSquare from "./LogoSquare";

const LogoWithText = () => {
  return (
    <div className="flex items-center gap-2.5 px-4 py-3">
      <LogoSquare alt="" className="size-10 rounded-lg" />
      <span className="text-xl font-semibold tracking-tight text-slate-950">
        Knoxt.io
      </span>
    </div>
  );
};

export default LogoWithText;
