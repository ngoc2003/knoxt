import { cn } from "../ui/utils";

const LogoSquare = ({
  onClick,
  className,
  alt = "Knoxt.io",
}: {
  onClick?: () => void;
  className?: string;
  alt?: string;
}) => {
  return (
    <img
      src="/logo-square.webp"
      alt={alt}
      width="256"
      height="256"
      className={cn("w-12 h-12", className)}
      onClick={onClick}
    />
  );
};

export default LogoSquare;
