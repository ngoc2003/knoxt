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
  const isAuthenticated = Boolean(localStorage.getItem("accessToken"));
  const loading = false;
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
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-[60] -translate-y-24 rounded-lg bg-white px-4 py-2 font-medium text-[#4124c7] shadow-lg transition-transform focus:translate-y-0"
      >
        Skip to main content
      </a>
      <LandingHeader {...primaryAction} />
      <main id="main-content">
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
