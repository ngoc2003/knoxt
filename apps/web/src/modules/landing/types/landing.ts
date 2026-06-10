import { ComponentProps } from "react";
import { Link } from "react-router";

export type PrimaryActionProps = {
  href: string;
  label: string;
  loading: boolean;
  isAuthenticated: boolean;
  isTransitioning: boolean;
  linkProps: Omit<ComponentProps<typeof Link>, "to">;
};
