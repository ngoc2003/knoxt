import { useAuth } from "@/modules/auth/context/AuthContext";
import { usePageTransitionLink } from "@/shared/components/PageTransitionProvider";
import { LandingFooter, LandingHeader } from "./components/LandingChrome";
import {
  ContactSection,
  FeaturesSection,
  FinalCtaSection,
  HeroSection,
  PricingSection,
  SharingSection,
  WorkflowSection,
} from "./components/LandingSections";

export function Landing() {
  const { isAuthenticated, loading } = useAuth();
  const { isTransitioning, linkProps } = usePageTransitionLink(
    "/dashboard",
    isAuthenticated,
  );
  const primaryAction = {
    href: isAuthenticated ? "/dashboard" : "/register",
    label: isAuthenticated ? "Open workspace" : "Start for free",
    loading,
    isAuthenticated,
    isTransitioning,
    linkProps,
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#fbfcff] text-slate-950">
      <LandingHeader {...primaryAction} />
      <main>
        <HeroSection {...primaryAction} />
        <FeaturesSection />
        <WorkflowSection />
        <SharingSection />
        <PricingSection {...primaryAction} />
        <ContactSection />
        <FinalCtaSection {...primaryAction} />
      </main>
      <LandingFooter />
    </div>
  );
}
