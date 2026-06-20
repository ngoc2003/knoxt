import { useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Loader2,
  CheckCircle2,
  User,
} from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import { Label } from "../../../shared/ui/label";
import LogoSquare from "../../../shared/components/LogoSquare";
import { useAuth } from "../context/AuthContext";

export function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (
    location.state as { from?: { pathname?: string; search?: string } }
  )?.from;
  const [searchParams] = useSearchParams();
  const invitedEmail = searchParams.get("email") || "";
  const invitationToken = searchParams.get("invitation") || undefined;
  const invitedProjectId = searchParams.get("project");

  const formik = useFormik({
    initialValues: {
      name: "",
      email: invitedEmail,
      password: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .min(2, "Name must be at least 2 characters")
        .required("Name is required"),
      email: Yup.string()
        .email("Please enter a valid email")
        .required("Email is required"),
      password: Yup.string()
        .min(8, "Password must be at least 8 characters")
        .required("Password is required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password")], "Passwords do not match")
        .required("Please confirm your password"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await register({
          name: values.name,
          email: values.email,
          password: values.password,
          invitationToken,
        });
        navigate(
          `${from?.pathname ?? (invitedProjectId ? `/projects/${invitedProjectId}` : "/dashboard")}${from?.search ?? ""}`,
          { replace: true },
        );
      } catch {
        // The Apollo error link shows the server-provided user message.
      } finally {
        setSubmitting(false);
      }
    },
  });

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: "", color: "" };
    if (password.length < 6)
      return { strength: 1, label: "Weak", color: "bg-red-500" };
    if (password.length < 8)
      return { strength: 2, label: "Fair", color: "bg-yellow-500" };
    if (password.length < 12)
      return { strength: 3, label: "Good", color: "bg-blue-500" };
    return { strength: 4, label: "Strong", color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength(formik.values.password);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <LogoSquare
          onClick={() => navigate("/")}
          className="w-24 h-24 mx-auto mb-8"
        />

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Create an account
            </h2>
            <p className="text-gray-600">Get started with Knoxt.io</p>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="name" className="text-gray-700 mb-2 block">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Ruby Swan"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`pl-10 h-12 rounded-lg border ${
                    formik.touched.name && formik.errors.name
                      ? "border-red-500 focus-visible:ring-red-500"
                      : "border-gray-300 focus-visible:ring-blue-500"
                  }`}
                />
              </div>
              {formik.touched.name && formik.errors.name && (
                <p className="text-red-500 text-sm mt-1.5">
                  {formik.errors.name}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="email" className="text-gray-700 mb-2 block">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`pl-10 h-12 rounded-lg border ${
                    formik.touched.email && formik.errors.email
                      ? "border-red-500 focus-visible:ring-red-500"
                      : "border-gray-300 focus-visible:ring-blue-500"
                  }`}
                />
              </div>
              {formik.touched.email && formik.errors.email && (
                <p className="text-red-500 text-sm mt-1.5">
                  {formik.errors.email}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-700 mb-2 block">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`pl-10 pr-10 h-12 rounded-lg border ${
                    formik.touched.password && formik.errors.password
                      ? "border-red-500 focus-visible:ring-red-500"
                      : "border-gray-300 focus-visible:ring-blue-500"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {formik.values.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1.5 flex-1 rounded-full ${
                          level <= passwordStrength.strength
                            ? passwordStrength.color
                            : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-600">
                    Password strength:{" "}
                    <span className="font-medium">
                      {passwordStrength.label}
                    </span>
                  </p>
                </div>
              )}

              {formik.touched.password && formik.errors.password && (
                <p className="text-red-500 text-sm mt-1.5">
                  {formik.errors.password}
                </p>
              )}
            </div>

            <div>
              <Label
                htmlFor="confirmPassword"
                className="text-gray-700 mb-2 block"
              >
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`pl-10 pr-10 h-12 rounded-lg border ${
                    formik.touched.confirmPassword &&
                    formik.errors.confirmPassword
                      ? "border-red-500 focus-visible:ring-red-500"
                      : formik.values.confirmPassword &&
                          formik.values.password ===
                            formik.values.confirmPassword
                        ? "border-green-500 focus-visible:ring-green-500"
                        : "border-gray-300 focus-visible:ring-blue-500"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {formik.touched.confirmPassword &&
                formik.errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1.5">
                    {formik.errors.confirmPassword}
                  </p>
                )}

              {!formik.errors.confirmPassword &&
                formik.values.confirmPassword &&
                formik.values.password === formik.values.confirmPassword && (
                  <p className="text-green-600 text-sm mt-1.5 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Passwords match
                  </p>
                )}
            </div>

            <Button
              type="submit"
              disabled={formik.isSubmitting}
              className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium disabled:bg-gray-300"
            >
              {formik.isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{" "}
              <Link
                to="/login"
                state={{ from }}
                className="text-blue-500 hover:text-blue-600 font-medium"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
