import { useState } from "react";
import { CalendarDays, Plus } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";

export function ProjectMemoryQuickCapture({
  onQuickRecap,
  onQuickDecision,
  onQuickRequirement,
}: {
  onQuickRecap: (input: {
    title: string;
    summary: string;
    actions: string[];
  }) => void;
  onQuickDecision: (title: string) => void;
  onQuickRequirement: (title: string) => void;
}) {
  const [recapTitle, setRecapTitle] = useState("");
  const [recapSummary, setRecapSummary] = useState("");
  const [recapActions, setRecapActions] = useState("");
  const [decision, setDecision] = useState("");
  const [requirement, setRequirement] = useState("");

  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,1fr)]">
      <form
        className="space-y-3 rounded-lg border p-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (!recapTitle.trim()) return;
          onQuickRecap({
            title: recapTitle.trim(),
            summary: recapSummary.trim(),
            actions: recapActions
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean),
          });
          setRecapTitle("");
          setRecapSummary("");
          setRecapActions("");
        }}
      >
        <div className="flex items-center gap-2 text-sm font-medium">
          <CalendarDays className="size-4" />
          New recap
        </div>
        <Input
          placeholder="Meeting title"
          value={recapTitle}
          onChange={(event) => setRecapTitle(event.target.value)}
        />
        <Textarea
          placeholder="Summary"
          value={recapSummary}
          onChange={(event) => setRecapSummary(event.target.value)}
        />
        <Textarea
          placeholder="Actions, one per line"
          value={recapActions}
          onChange={(event) => setRecapActions(event.target.value)}
        />
        <Button type="submit">Save recap</Button>
      </form>

      <div className="space-y-3">
        <QuickLine
          label="Decision"
          placeholder="Use Stripe for payment integration"
          value={decision}
          onChange={setDecision}
          onSubmit={(value) => {
            onQuickDecision(value);
            setDecision("");
          }}
        />
        <QuickLine
          label="Requirement"
          placeholder="Export invoice as PDF"
          value={requirement}
          onChange={setRequirement}
          onSubmit={(value) => {
            onQuickRequirement(value);
            setRequirement("");
          }}
        />
      </div>
    </div>
  );
}

function QuickLine({
  label,
  placeholder,
  value,
  onChange,
  onSubmit,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
}) {
  return (
    <form
      className="rounded-lg border p-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (!value.trim()) return;
        onSubmit(value.trim());
      }}
    >
      <label className="text-sm font-medium">{label}</label>
      <div className="mt-2 flex gap-2">
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <Button type="submit" size="icon">
          <Plus className="size-4" />
        </Button>
      </div>
    </form>
  );
}
