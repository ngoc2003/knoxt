import { BookOpen, FolderKanban, Search, Share2 } from "lucide-react";

export const features = [
  {
    title: "Project knowledge",
    description:
      "Keep requirements, research, meeting notes, and documentation with the project they belong to.",
    icon: FolderKanban,
    accent: "bg-[#f1edff] text-[#4f2fdf]",
  },
  {
    title: "Structured notes",
    description:
      "Build a clear document tree with Markdown, rich text, tags, attachments, and autosave.",
    icon: BookOpen,
    accent: "bg-amber-50 text-amber-600",
  },
  {
    title: "Fast discovery",
    description:
      "Search titles and content to recover important context long after a decision was made.",
    icon: Search,
    accent: "bg-emerald-50 text-emerald-600",
  },
  {
    title: "Controlled sharing",
    description:
      "Invite project members or share selected knowledge through a read-only public link.",
    icon: Share2,
    accent: "bg-[#f1edff] text-[#6847ed]",
  },
];

export const steps = [
  {
    number: "01",
    title: "Create a project",
    description: "Give every initiative a dedicated home for its context.",
  },
  {
    number: "02",
    title: "Capture knowledge",
    description: "Write notes and organize documentation as the project grows.",
  },
  {
    number: "03",
    title: "Find and share",
    description: "Search the full history and share only what people need.",
  },
];

export const plans = [
  {
    name: "Personal",
    price: "Free",
    description: "For individuals building a reliable project memory.",
    features: [
      "Up to 3 active projects",
      "Nested notes and Markdown",
      "Search and public links",
    ],
  },
  {
    name: "Team",
    price: "$1",
    cadence: "per member / month",
    description: "For teams that need shared context and clear permissions.",
    features: [
      "Unlimited projects",
      "Project members and roles",
      "Version history and attachments",
      "Priority support",
    ],
    featured: true,
  },
  {
    name: "Organization",
    price: "Custom",
    description: "For agencies and organizations with broader knowledge needs.",
    features: [
      "Everything in Team",
      "Organization-wide administration",
      "Custom retention and onboarding",
      "Dedicated support",
    ],
  },
];
