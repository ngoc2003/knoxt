import { ComponentProps, FormEvent, useState } from "react";
import {
  ArrowRight,
  Check,
  Mail,
  MessageSquareText,
  Send,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router";
import { toast } from "sonner";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";
import { features, plans, steps } from "../data/landing";
import { PrimaryActionProps } from "../types/landing";
import { AnimatedEyebrow, ScrollReveal, SectionHeading } from "./LandingMotion";
import { ProductPreview, SharingPreview } from "./LandingPreviews";

type ActionSectionProps = Pick<
  PrimaryActionProps,
  | "href"
  | "label"
  | "loading"
  | "isAuthenticated"
  | "isTransitioning"
  | "linkProps"
>;

export function HeroSection(props: ActionSectionProps) {
  return (
    <section className="relative isolate overflow-hidden px-5 pb-20 pt-32 sm:px-8 sm:pt-40 lg:pb-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[720px] bg-[radial-gradient(circle_at_20%_20%,rgba(79,47,223,0.18),transparent_34%),radial-gradient(circle_at_85%_15%,rgba(183,168,250,0.26),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[720px] bg-[radial-gradient(circle,rgba(79,47,223,0.28)_1.5px,transparent_1.5px)] bg-[size:24px_24px] [mask-image:linear-gradient(to_bottom,black_15%,transparent_90%)]" />

      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-4xl text-center">
          <Badge className="mb-6 rounded-full border border-[#d9d0ff] bg-white/80 px-3 py-1.5 text-[#4124c7] shadow-sm hover:bg-white">
            <Sparkles className="mr-1.5 size-3.5" />
            Documentation-first project workspace
          </Badge>
          <h1 className="text-balance text-5xl font-semibold tracking-[-0.045em] text-slate-950 sm:text-6xl lg:text-7xl">
            Your project history,
            <span className="block bg-gradient-to-r from-[#3d20bd] via-[#4f2fdf] to-[#7458ef] bg-clip-text text-transparent">
              finally easy to find.
            </span>
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-balance text-lg leading-8 text-slate-600 sm:text-xl">
            Keep requirements, notes, decisions, and documentation together so
            context survives beyond the next meeting.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <PrimaryButton {...props} />
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-xl border-slate-300 bg-white/80 px-6"
            >
              <a href="#features">Explore features</a>
            </Button>
          </div>
          {!props.isAuthenticated && !props.loading && (
            <p className="mt-4 text-sm text-slate-500">
              Create a workspace in minutes. No setup ceremony.
            </p>
          )}
        </div>
        <ProductPreview />
      </div>
    </section>
  );
}

export function FeaturesSection() {
  return (
    <section id="features" className="bg-white px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="One source of truth"
          title="Everything important stays with the project"
          description="A focused knowledge hub for teams that need durable context without another complicated workflow tool."
        />
        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {features.map(({ title, description, icon: Icon, accent }, index) => (
            <ScrollReveal key={title} className="h-full" delay={index * 0.08}>
              <Card className="group h-full border-slate-200 bg-white p-7 shadow-none transition-all hover:-translate-y-1 hover:border-[#d9d0ff] hover:shadow-xl hover:shadow-[#e8e2ff]/70">
                <div
                  className={`mb-6 flex size-11 items-center justify-center rounded-xl ${accent}`}
                >
                  <Icon className="size-5" />
                </div>
                <h3 className="text-xl font-semibold tracking-tight text-slate-950">
                  {title}
                </h3>
                <p className="mt-3 max-w-lg text-sm leading-6 text-slate-600">
                  {description}
                </p>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WorkflowSection() {
  return (
    <section id="workflow" className="px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Simple by design"
          title="From scattered context to shared knowledge"
          description="Start small, preserve what matters, and let the knowledge structure grow with the project."
        />
        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {steps.map((step, index) => (
            <ScrollReveal
              key={step.number}
              className="h-full"
              delay={index * 0.1}
            >
              <div className="relative h-full rounded-2xl border border-slate-200 bg-white p-7">
                <span className="text-sm font-semibold text-[#4f2fdf]">
                  {step.number}
                </span>
                <h3 className="mt-8 text-xl font-semibold tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {step.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SharingSection() {
  return (
    <section
      id="sharing"
      className="bg-gradient-to-br from-[#18083f] via-[#271064] to-[#4f2fdf] px-5 py-24 text-white sm:px-8"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
        <ScrollReveal>
          <AnimatedEyebrow dark>Share with confidence</AnimatedEyebrow>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
            The right context for the right people.
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
            Invite collaborators with project roles or create a read-only public
            link for a selected document.
          </p>
          <div className="mt-8 space-y-4">
            {[
              "Project roles for viewers, editors, and admins",
              "Read-only links that can be revoked",
              "Nested documents shared with their context",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <span className="flex size-6 items-center justify-center rounded-full bg-[#8d75f2]/20 text-[#d9d0ff]">
                  <Check className="size-3.5" />
                </span>
                <span className="text-sm text-slate-200">{item}</span>
              </div>
            ))}
          </div>
        </ScrollReveal>
        <ScrollReveal delay={0.14}>
          <SharingPreview />
        </ScrollReveal>
      </div>
    </section>
  );
}

export function PricingSection(props: ActionSectionProps) {
  return (
    <section id="pricing" className="bg-white px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Simple pricing"
          title="Start small. Grow when your knowledge does."
          description="Choose a plan based on how many people need to preserve and share project context."
        />
        <div className="mt-14 grid items-stretch gap-5 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <ScrollReveal
              key={plan.name}
              className="h-full"
              delay={index * 0.1}
            >
              <Card
                className={`relative flex h-full flex-col rounded-2xl p-7 shadow-none ${
                  plan.featured
                    ? "border-[#6847ed] bg-gradient-to-br from-[#4f2fdf] to-[#271064] text-white shadow-xl shadow-[#d9d0ff]"
                    : "border-slate-200 bg-white"
                }`}
              >
                {plan.featured && (
                  <Badge className="absolute -top-3 left-7 bg-[#4f2fdf] text-white hover:bg-[#4f2fdf]">
                    Best for growing teams
                  </Badge>
                )}
                <div>
                  <h3 className="text-xl font-semibold">{plan.name}</h3>
                  <p
                    className={`mt-3 min-h-12 text-sm leading-6 ${
                      plan.featured ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    {plan.description}
                  </p>
                </div>
                <div className="mt-7">
                  <span className="text-4xl font-semibold tracking-tight">
                    {plan.price}
                  </span>
                  {plan.cadence && (
                    <span className="ml-2 text-xs text-slate-400">
                      {plan.cadence}
                    </span>
                  )}
                </div>
                <PlanFeatures plan={plan} />
                {plan.name === "Organization" ? (
                  <Button
                    asChild
                    variant="outline"
                    className="h-11 rounded-xl border-slate-300"
                  >
                    <a href="#contact">Talk to us</a>
                  </Button>
                ) : (
                  <PrimaryButton
                    {...props}
                    label={
                      props.isAuthenticated ? "Open workspace" : "Get started"
                    }
                    size="default"
                    className={`h-11 rounded-xl ${
                      plan.featured
                        ? "bg-white text-[#4124c7] hover:bg-[#f1edff]"
                        : "bg-[#4f2fdf] text-white hover:bg-[#4124c7]"
                    }`}
                  />
                )}
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function PlanFeatures({ plan }: { plan: (typeof plans)[number] }) {
  return (
    <ul className="my-8 flex-1 space-y-3">
      {plan.features.map((feature) => (
        <li
          key={feature}
          className={`flex items-center gap-3 text-sm ${
            plan.featured ? "text-slate-200" : "text-slate-700"
          }`}
        >
          <span
            className={`flex size-5 shrink-0 items-center justify-center rounded-full ${
              plan.featured
                ? "bg-[#8d75f2]/20 text-[#eeeaff]"
                : "bg-emerald-50 text-emerald-600"
            }`}
          >
            <Check className="size-3" />
          </span>
          {feature}
        </li>
      ))}
    </ul>
  );
}

export function ContactSection() {
  const [contactTopic, setContactTopic] = useState("product");
  const [contactSent, setContactSent] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.currentTarget.reset();
    setContactTopic("product");
    setContactSent(true);
    toast.success("Thanks! Your message has been received.");
  };

  return (
    <section id="contact" className="px-5 py-24 sm:px-8">
      <ScrollReveal className="mx-auto grid max-w-7xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="bg-gradient-to-br from-[#18083f] via-[#271064] to-[#4f2fdf] p-8 text-white sm:p-10 lg:p-12">
          <AnimatedEyebrow dark>Let&apos;s talk</AnimatedEyebrow>
          <h2 className="mt-6 text-4xl font-semibold tracking-[-0.035em]">
            Tell us what your team needs to remember.
          </h2>
          <p className="mt-5 text-sm leading-7 text-slate-300">
            Ask about the product, team rollout, or how Taskio can fit your
            project knowledge workflow.
          </p>
          <div className="mt-10 space-y-5">
            <ContactDetail icon={Mail}>hello@taskio.app</ContactDetail>
            <ContactDetail icon={MessageSquareText}>
              Product questions, team rollout, and partnerships
            </ContactDetail>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5 p-8 sm:p-10 lg:p-12">
          <div className="grid gap-5 sm:grid-cols-2">
            <ContactInput
              id="contact-name"
              name="name"
              label="Name"
              placeholder="Your name"
              onChange={() => setContactSent(false)}
            />
            <ContactInput
              id="contact-email"
              name="email"
              type="email"
              label="Work email"
              placeholder="you@company.com"
              onChange={() => setContactSent(false)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-topic">How can we help?</Label>
            <Select value={contactTopic} onValueChange={setContactTopic}>
              <SelectTrigger id="contact-topic" aria-label="How can we help?">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="product">Product question</SelectItem>
                <SelectItem value="team">Team rollout</SelectItem>
                <SelectItem value="partnership">Partnership</SelectItem>
                <SelectItem value="other">Something else</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-message">Message</Label>
            <Textarea
              id="contact-message"
              name="message"
              required
              minLength={10}
              placeholder="Tell us about your team and what you are trying to improve..."
              onChange={() => setContactSent(false)}
            />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p
              role="status"
              className={`text-sm ${
                contactSent ? "text-emerald-600" : "text-slate-500"
              }`}
            >
              {contactSent
                ? "Message received. We will get back to you soon."
                : "We usually reply within two business days."}
            </p>
            <Button
              type="submit"
              className="h-11 rounded-xl bg-[#4f2fdf] px-5 text-white hover:bg-[#4124c7]"
            >
              Send message
              <Send className="ml-2 size-4" />
            </Button>
          </div>
        </form>
      </ScrollReveal>
    </section>
  );
}

export function FinalCtaSection(props: ActionSectionProps) {
  return (
    <section className="px-5 py-24 sm:px-8">
      <ScrollReveal className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-br from-[#3d20bd] via-[#4f2fdf] to-[#7458ef] px-6 py-14 text-center text-white shadow-2xl shadow-[#d9d0ff] sm:px-12">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.22)_1.5px,transparent_1.5px)] bg-[size:20px_20px]"
        />
        <h2 className="relative text-3xl font-semibold tracking-tight sm:text-4xl">
          Build a project memory that lasts.
        </h2>
        <p className="relative mx-auto mt-4 max-w-xl text-[#f7f5ff]">
          Give your team one place to capture, organize, find, and share project
          knowledge.
        </p>
        <PrimaryButton
          {...props}
          className="relative mt-8 h-12 rounded-xl bg-white px-6 text-[#4124c7] hover:bg-[#f1edff]"
        />
      </ScrollReveal>
    </section>
  );
}

function PrimaryButton({
  href,
  label,
  loading,
  isTransitioning,
  linkProps,
  size = "lg",
  className = "h-12 rounded-xl bg-[#4f2fdf] px-6 text-white shadow-lg shadow-[#d9d0ff] hover:bg-[#4124c7]",
}: ActionSectionProps & {
  className?: string;
  size?: ComponentProps<typeof Button>["size"];
}) {
  return (
    <Button
      asChild={!loading}
      disabled={loading || isTransitioning}
      size={size}
      className={className}
    >
      {loading ? (
        <span>Checking session...</span>
      ) : (
        <Link to={href} {...linkProps}>
          {label}
          <ArrowRight className="ml-2 size-4" />
        </Link>
      )}
    </Button>
  );
}

function ContactDetail({
  icon: Icon,
  children,
}: {
  icon: typeof Mail;
  children: string;
}) {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-200">
      <span className="flex size-9 items-center justify-center rounded-lg bg-white/10">
        <Icon className="size-4 text-[#d9d0ff]" />
      </span>
      {children}
    </div>
  );
}

function ContactInput({
  label,
  ...props
}: ComponentProps<typeof Input> & { label: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={props.id}>{label}</Label>
      <Input required {...props} />
    </div>
  );
}
