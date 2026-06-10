import { Link } from "react-router";
import { BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";

export function AIAssistant() {
  return (
    <div className="flex min-h-full items-center justify-center p-6">
      <Card className="max-w-xl border border-gray-200 bg-white p-8 text-center">
        <div className="mx-auto mb-5 flex size-12 items-center justify-center rounded-xl bg-indigo-50">
          <Sparkles className="size-6 text-indigo-600" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Project knowledge assistant
        </h1>
        <p className="mt-3 text-sm leading-6 text-gray-600">
          AI search and project summaries will be built on top of your notes,
          documentation, decisions, and requirements in a later phase.
        </p>
        <Button
          asChild
          className="mt-6 bg-indigo-600 text-white hover:bg-indigo-700"
        >
          <Link to="/notes">
            <BookOpen className="mr-2 size-4" />
            Open notes
          </Link>
        </Button>
      </Card>
    </div>
  );
}
