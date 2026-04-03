import { Link } from "react-router";
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Clock,
  Shield,
  Zap,
  BarChart3,
  FileText,
  Wallet,
  Star,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import LogoSquare from "../components/LogoSquare";

export function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LogoSquare />

              <span className="text-xl font-bold text-gray-900">Taskio</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                How it Works
              </a>
              <a
                href="#pricing"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Pricing
              </a>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" className="text-gray-700">
                  Sign In
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-indigo-100 text-indigo-700 px-4 py-1">
              <Sparkles className="w-3 h-3 mr-1" />
              AI-Powered Freelancer Assistant
            </Badge>

            <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Manage Your Freelance Business with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Confidence
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              Taskio combines productivity tools, tax management, and AI
              assistance to help freelancers stay organized, save on taxes, and
              grow their business.
            </p>

            <div className="flex items-center justify-center gap-4">
              <Link to="/dashboard">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white text-lg px-8 py-6">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>

            <p className="text-sm text-gray-500 mt-6">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>

          {/* Hero Image/Dashboard Preview */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10"></div>
            <div className="rounded-2xl overflow-hidden shadow-2xl border-8 border-gray-100">
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=700&fit=crop"
                alt="Dashboard Preview"
                className="w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold mb-2">10K+</p>
              <p className="text-gray-400">Active Freelancers</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">$2.5M+</p>
              <p className="text-gray-400">Tax Savings</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">50K+</p>
              <p className="text-gray-400">Tasks Completed</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">4.9/5</p>
              <p className="text-gray-400">User Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-100 text-purple-700">
              Features
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              All-in-one platform designed specifically for freelancers and solo
              entrepreneurs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="p-8 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Smart Project Management
              </h3>
              <p className="text-gray-600 mb-4">
                Drag-and-drop Kanban boards, time tracking, and priority
                management to keep your projects on track.
              </p>
              <Link
                to="/projects"
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
              >
                Explore Projects →
              </Link>
            </Card>

            {/* Feature 2 */}
            <Card className="p-8 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-6">
                <Wallet className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Automated Tax Management
              </h3>
              <p className="text-gray-600 mb-4">
                Automatically calculate and set aside taxes from every invoice.
                Never worry about quarterly payments again.
              </p>
              <Link
                to="/finance"
                className="text-green-600 hover:text-green-700 text-sm font-medium"
              >
                View Finance →
              </Link>
            </Card>

            {/* Feature 3 */}
            <Card className="p-8 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                AI Tax Assistant
              </h3>
              <p className="text-gray-600 mb-4">
                Get instant answers about deductions, tax strategies, and
                financial planning from our AI advisor.
              </p>
              <Link
                to="/ai-assistant"
                className="text-purple-600 hover:text-purple-700 text-sm font-medium"
              >
                Try AI Assistant →
              </Link>
            </Card>

            {/* Feature 4 */}
            <Card className="p-8 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center mb-6">
                <FileText className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Smart Notebook
              </h3>
              <p className="text-gray-600 mb-4">
                Organize meeting notes, client feedback, and ideas with tags,
                search, and markdown support.
              </p>
              <Link
                to="/notes"
                className="text-orange-600 hover:text-orange-700 text-sm font-medium"
              >
                Open Notes →
              </Link>
            </Card>

            {/* Feature 5 */}
            <Card className="p-8 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-6">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Time Tracking
              </h3>
              <p className="text-gray-600 mb-4">
                Track billable hours on tasks and projects. Generate accurate
                invoices based on your time.
              </p>
              <a
                href="#"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Learn More →
              </a>
            </Card>

            {/* Feature 6 */}
            <Card className="p-8 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Financial Insights
              </h3>
              <p className="text-gray-600 mb-4">
                Beautiful dashboards showing income trends, expense breakdowns,
                and tax projections.
              </p>
              <Link
                to="/dashboard"
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                View Dashboard →
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-indigo-100 text-indigo-700">
              How It Works
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Get Started in Minutes
            </h2>
            <p className="text-xl text-gray-600">
              Simple setup, powerful results
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Create Your Account
              </h3>
              <p className="text-gray-600">
                Sign up in seconds and set your tax preferences. No credit card
                required for the trial.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Add Your Projects
              </h3>
              <p className="text-gray-600">
                Import existing projects or start fresh. Add tasks, track time,
                and organize your work.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Watch Your Business Grow
              </h3>
              <p className="text-gray-600">
                Track income, save on taxes, and get AI-powered insights to
                optimize your freelance business.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-green-100 text-green-700">
                Tax Savings
              </Badge>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Save Thousands on Your Taxes
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Our intelligent tax system automatically identifies deductions,
                calculates quarterly payments, and helps you maximize
                savings—all while keeping you compliant.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Automatic Deduction Tracking
                    </h4>
                    <p className="text-gray-600">
                      Every expense is categorized and tracked for maximum
                      deductions
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Quarterly Tax Reminders
                    </h4>
                    <p className="text-gray-600">
                      Never miss a deadline with smart reminders and
                      calculations
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      AI Tax Advisor
                    </h4>
                    <p className="text-gray-600">
                      Get personalized tax strategies from our AI assistant
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
                <img
                  src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop"
                  alt="Tax Management"
                  className="w-full"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">
                  Average Tax Savings
                </p>
                <p className="text-3xl font-bold text-green-600">$3,200/year</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-yellow-100 text-yellow-700">
              Testimonials
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Loved by Freelancers
            </h2>
            <p className="text-xl text-gray-600">
              See what our community has to say
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Graphic Designer",
                content:
                  "Taskio transformed how I manage my freelance business. The tax features alone have saved me thousands!",
                rating: 5,
              },
              {
                name: "Michael Chen",
                role: "Web Developer",
                content:
                  "The Kanban board and time tracking are perfect. I'm more organized than ever, and tax season is no longer stressful.",
                rating: 5,
              },
              {
                name: "Emily Rodriguez",
                role: "Content Writer",
                content:
                  "The AI assistant is incredible. It's like having a tax advisor and productivity coach in one app!",
                rating: 5,
              },
            ].map((testimonial, idx) => (
              <Card
                key={idx}
                className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-6">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-indigo-600 font-semibold">
                      {testimonial.name[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-indigo-100 text-indigo-700">
              Pricing
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that fits your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <Card className="p-8 bg-white border-2 border-gray-200 rounded-xl">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Starter</h3>
              <p className="text-gray-600 mb-6">Perfect for getting started</p>
              <p className="text-4xl font-bold text-gray-900 mb-6">Free</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Up to 5 projects</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Basic tax tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Note taking</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full border-gray-300">
                Get Started
              </Button>
            </Card>

            {/* Pro Plan */}
            <Card className="p-8 bg-indigo-600 text-white border-2 border-indigo-600 rounded-xl relative">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900">
                Most Popular
              </Badge>
              <h3 className="text-xl font-bold mb-2">Professional</h3>
              <p className="text-indigo-100 mb-6">For serious freelancers</p>
              <p className="text-4xl font-bold mb-1">
                $19
                <span className="text-lg font-normal">/month</span>
              </p>
              <p className="text-indigo-200 text-sm mb-6">
                Billed annually ($228/year)
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-indigo-200" />
                  <span>Unlimited projects</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-indigo-200" />
                  <span>Advanced tax management</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-indigo-200" />
                  <span>AI Tax Assistant</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-indigo-200" />
                  <span>Time tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-indigo-200" />
                  <span>Priority support</span>
                </li>
              </ul>
              <Button className="w-full bg-white text-indigo-600 hover:bg-gray-100">
                Start Free Trial
              </Button>
            </Card>

            {/* Enterprise Plan */}
            <Card className="p-8 bg-white border-2 border-gray-200 rounded-xl">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Enterprise
              </h3>
              <p className="text-gray-600 mb-6">For teams and agencies</p>
              <p className="text-4xl font-bold text-gray-900 mb-6">Custom</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Everything in Pro</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Team collaboration</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Custom integrations</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Dedicated support</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full border-gray-300">
                Contact Sales
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Freelance Business?
          </h2>
          <p className="text-xl text-indigo-100 mb-10">
            Join thousands of freelancers who are saving time, reducing taxes,
            and growing their income with Taskio.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/dashboard">
              <Button className="bg-white text-indigo-600 hover:bg-gray-100 text-lg px-8 py-6">
                Start Your Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white/10 text-lg px-8 py-6"
            >
              Schedule a Demo
            </Button>
          </div>
          <p className="text-indigo-200 mt-6">
            14-day free trial • No credit card required • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <LogoSquare />

                <span className="text-lg font-bold text-white">Taskio</span>
              </div>
              <p className="text-sm">
                The all-in-one productivity and tax platform for freelancers.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Security
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Roadmap
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-sm text-center">
            <p>&copy; 2026 Taskio. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
