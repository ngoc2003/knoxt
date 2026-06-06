import { cn } from "../ui/utils";

const LogoSquare = ({
  onClick,
  className,
}: {
  onClick?: () => void;
  className?: string;
}) => {
  return (
    <img
      src="/logo-square.png"
      alt="Taskio Logo"
      className={cn("w-12 h-12", className)}
      onClick={onClick}
    />
  );
};

export default LogoSquare;
