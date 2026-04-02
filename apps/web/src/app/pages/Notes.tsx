import { useState } from "react";
import {
  FileText,
  Plus,
  Search,
  Tag,
  Bold,
  Italic,
  List,
  Link2,
  Image,
  Paperclip,
  Calendar,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";

interface Note {
  id: string;
  title: string;
  preview: string;
  tags: string[];
  date: string;
  content: string;
}

const notes: Note[] = [
  {
    id: "1",
    title: "Client Meeting Notes - Acme Corp",
    preview: "Discussed project timeline and deliverables...",
    tags: ["client", "meeting"],
    date: "Apr 2, 2026",
    content: `# Client Meeting Notes - Acme Corp

## Attendees
- John Doe (Me)
- Sarah Johnson (Acme Corp)
- Mike Chen (Acme Corp)

## Discussion Points
- Project timeline: 6 weeks
- Budget: $15,000
- Deliverables: Landing page, Dashboard, Mobile app

## Action Items
- [ ] Send proposal by Friday
- [ ] Schedule design review
- [ ] Prepare mockups

## Next Steps
Follow up next week with design concepts.`,
  },
  {
    id: "2",
    title: "Tax Deduction Ideas for 2026",
    preview: "Home office, software subscriptions, equipment...",
    tags: ["tax", "finance"],
    date: "Apr 1, 2026",
    content: `# Tax Deduction Ideas for 2026

## Home Office
- Percentage of rent/mortgage
- Utilities
- Internet

## Software & Tools
- Adobe Creative Cloud
- Figma Professional
- GitHub Pro

## Equipment
- New MacBook Pro
- Monitor
- Desk and chair`,
  },
  {
    id: "3",
    title: "Project Ideas",
    preview: "Side projects and potential client work...",
    tags: ["ideas", "projects"],
    date: "Mar 30, 2026",
    content: "# Project Ideas\n\nBrainstorming for Q2 2026...",
  },
];

const allTags = ["client", "meeting", "tax", "finance", "ideas", "projects", "personal"];

export function Notes() {
  const [selectedNote, setSelectedNote] = useState(notes[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      searchQuery === "" ||
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.preview.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.some((tag) => note.tags.includes(tag));

    return matchesSearch && matchesTags;
  });

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Left Panel - Notes List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Notes</h2>
            <Button
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-gray-50 border-gray-200"
            />
          </div>

          {/* Tags Filter */}
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "secondary"}
                className={`cursor-pointer text-xs ${
                  selectedTags.includes(tag)
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => toggleTag(tag)}
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => setSelectedNote(note)}
              className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedNote.id === note.id ? "bg-indigo-50" : ""
              }`}
            >
              <div className="flex items-start gap-2 mb-2">
                <FileText className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                  {note.title}
                </h3>
              </div>
              <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                {note.preview}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {note.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-xs bg-gray-100 text-gray-600"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                <span className="text-xs text-gray-500">{note.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Panel - Editor */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Editor Toolbar */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Input
              type="text"
              value={selectedNote.title}
              className="text-lg font-semibold border-none shadow-none focus-visible:ring-0"
              readOnly
            />
          </div>

          {/* Formatting Toolbar */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm">
              <Bold className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Italic className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <List className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Link2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Image className="w-4 h-4" />
            </Button>
            <div className="ml-auto flex gap-2">
              <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                <Calendar className="w-3 h-3 mr-1" />
                {selectedNote.date}
              </Badge>
            </div>
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            <Textarea
              value={selectedNote.content}
              className="min-h-[500px] border-none shadow-none p-0 resize-none focus-visible:ring-0 font-mono text-sm"
              readOnly
            />
          </div>
        </div>

        {/* Attachments Section */}
        <div className="border-t border-gray-200 p-4">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Paperclip className="w-4 h-4" />
              Attachments
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { name: "proposal.pdf", size: "2.4 MB" },
                { name: "mockup.fig", size: "1.8 MB" },
                { name: "contract.pdf", size: "890 KB" },
              ].map((file, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 cursor-pointer transition-colors"
                >
                  <FileText className="w-6 h-6 text-gray-400 mb-2" />
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">{file.size}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
