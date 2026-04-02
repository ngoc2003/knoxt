import { useState } from "react";
import { Send, Sparkles, Lightbulb, Calculator, FileText } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: string;
}

const initialMessages: Message[] = [
  {
    id: "1",
    type: "assistant",
    content:
      "Hello! I'm your AI Tax & Productivity Assistant. I can help you with tax questions, expense categorization, invoice generation, and productivity tips. How can I assist you today?",
    timestamp: "10:00 AM",
  },
];

const suggestedPrompts = [
  {
    icon: Calculator,
    text: "Calculate my tax liability",
    color: "bg-indigo-50 text-indigo-700",
  },
  {
    icon: FileText,
    text: "What expenses can I deduct?",
    color: "bg-purple-50 text-purple-700",
  },
  {
    icon: Lightbulb,
    text: "Tax saving tips for freelancers",
    color: "bg-orange-50 text-orange-700",
  },
];

export function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: getAIResponse(inputValue),
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  const getAIResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes("tax") || lowerQuery.includes("deduct")) {
      return `Based on your profile as a freelancer, here are some common tax deductions you can claim:

**Home Office Deduction**
- If you use part of your home exclusively for business, you can deduct a portion of your rent, utilities, and internet.

**Software & Tools**
- Adobe Creative Cloud, Figma, GitHub, and other professional software subscriptions are fully deductible.

**Equipment**
- Computers, monitors, cameras, and other equipment used for business can be depreciated or expensed under Section 179.

**Professional Development**
- Courses, conferences, and books related to your work are deductible.

**Business Travel**
- Meals (50%), lodging, and transportation for business trips.

Would you like me to help categorize your recent expenses?`;
    }

    if (lowerQuery.includes("calculate") || lowerQuery.includes("liability")) {
      return `Let me help you calculate your tax liability.

Based on your current income data:
- **Gross Income**: $24,580
- **Estimated Tax Rate**: 30%
- **Estimated Tax**: $7,374

**Quarterly Tax Breakdown**:
- Q1 2026: $1,843.50
- Q2 2026: $1,843.50 (upcoming)
- Q3 2026: $1,843.50
- Q4 2026: $1,843.50

Remember to set aside 30% of each invoice for taxes. Would you like me to set up automatic tax calculations?`;
    }

    if (lowerQuery.includes("tip") || lowerQuery.includes("save")) {
      return `Here are some tax-saving tips for freelancers:

**1. Maximize Retirement Contributions**
- Consider opening a SEP-IRA or Solo 401(k)
- Contributions are tax-deductible and can significantly reduce your liability

**2. Track EVERYTHING**
- Use Freelancer Notebook to record every business expense
- Even small purchases add up over the year

**3. Quarterly Estimated Taxes**
- Pay quarterly to avoid penalties
- I can help you calculate these based on your income

**4. Health Insurance Deduction**
- Self-employed health insurance premiums are fully deductible

**5. Home Office**
- The simplified method allows $5 per square foot (up to 300 sq ft)

Would you like personalized recommendations based on your income?`;
    }

    return `I understand you're asking about "${query}". I can help with:
    
- Tax calculations and quarterly estimates
- Expense categorization and deductions
- Invoice generation and tracking
- Productivity tips and task management
- Financial planning for freelancers

Could you provide more details about what you'd like to know?`;
  };

  const handlePromptClick = (prompt: string) => {
    setInputValue(prompt);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Header */}
      <div className="p-6 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              AI Assistant
            </h1>
            <p className="text-sm text-gray-600">
              Your personal tax & productivity advisor
            </p>
          </div>
          <Badge className="ml-auto bg-purple-100 text-purple-700">
            Powered by AI
          </Badge>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] ${
                  message.type === "user"
                    ? "bg-indigo-600 text-white"
                    : "bg-white border border-gray-200"
                } rounded-2xl px-4 py-3 shadow-sm`}
              >
                {message.type === "assistant" && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-purple-600" />
                    </div>
                    <span className="text-xs font-medium text-purple-600">
                      AI Assistant
                    </span>
                  </div>
                )}
                <div className="whitespace-pre-wrap text-sm">
                  {message.content}
                </div>
                <div
                  className={`text-xs mt-2 ${
                    message.type === "user"
                      ? "text-indigo-200"
                      : "text-gray-500"
                  }`}
                >
                  {message.timestamp}
                </div>
              </div>
            </div>
          ))}

          {/* Suggested Prompts */}
          {messages.length === 1 && (
            <div className="pt-8">
              <p className="text-sm text-gray-600 mb-3 text-center">
                Try asking me:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {suggestedPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePromptClick(prompt.text)}
                    className={`p-4 rounded-xl border-2 border-gray-200 hover:border-purple-300 transition-all hover:shadow-md text-left ${prompt.color}`}
                  >
                    <prompt.icon className="w-5 h-5 mb-2" />
                    <p className="text-sm font-medium">{prompt.text}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-3">
            <Input
              type="text"
              placeholder="Ask about tax deductions, expense tracking, or productivity tips..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleSendMessage();
              }}
              className="flex-1 bg-gray-50 border-gray-200"
            />
            <Button
              onClick={handleSendMessage}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            AI can make mistakes. Verify important information with a tax
            professional.
          </p>
        </div>
      </div>
    </div>
  );
}
