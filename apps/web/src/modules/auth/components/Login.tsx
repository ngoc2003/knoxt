import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import { Label } from "../../../shared/ui/label";
import { Checkbox } from "../../../shared/ui/checkbox";
import LogoSquare from "../../../shared/components/LogoSquare";
import { useAuth } from "../context/AuthContext";

export function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (
    location.state as { from?: { pathname?: string; search?: string } }
  )?.from;

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Please enter a valid email")
        .required("Email is required"),
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await login({
          email: values.email,
          password: values.password,
        });
        navigate(`${from?.pathname ?? "/dashboard"}${from?.search ?? ""}`, {
          replace: true,
        });
      } catch {
        // The Apollo error link shows the server-provided user message.
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen bg-blue-50/50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <LogoSquare
          onClick={() => navigate("/")}
          className="w-24 h-24 mx-auto mb-8"
        />

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Welcome back
            </h2>
            <p className="text-gray-600">Login to your account</p>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-5">
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
                  placeholder="Enter your password"
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
              {formik.touched.password && formik.errors.password && (
                <p className="text-red-500 text-sm mt-1.5">
                  {formik.errors.password}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="rememberMe"
                  checked={formik.values.rememberMe}
                  onCheckedChange={(checked) =>
                    formik.setFieldValue("rememberMe", checked)
                  }
                />
                <label
                  htmlFor="rememberMe"
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  Remember me
                </label>
              </div>
              <Link
                to="/forgot-password"
                className="text-sm text-blue-500 hover:text-blue-600 font-medium"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={formik.isSubmitting}
              className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium disabled:bg-gray-300"
            >
              {formik.isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Don't have an account?{" "}
              <Link
                to="/register"
                state={{ from }}
                className="text-blue-500 hover:text-blue-600 font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
