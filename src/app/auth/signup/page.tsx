"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Backendless from "@/lib/backendless";
import Cookies from "js-cookie";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { z as zod } from "zod";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

// Schema validation for Sign Up
const signUpSchema = zod
  .object({
    firstname: zod.string().min(1, "First name is required"),
    lastname: zod.string().min(1, "Last name is required"),
    username: zod.string().min(3, "Username must be at least 3 characters"),
    email: zod.string().email("Invalid email"),
    password: zod.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: zod.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Type for the user returned by Backendless
type BackendlessUser = {
  objectId: string;
  username?: string;
  email?: string;
  "user-token"?: string;
};

export default function SignUp() {
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    try {
      signUpSchema.parse(form);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof zod.ZodError) {
        const fieldErrors: Partial<Record<string, string>> = {};
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            fieldErrors[err.path[0]] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const signUp = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors in the form.");
      return;
    }

    try {
      // Send registration data to Backendless
      await Backendless.UserService.register({
        firstname: form.firstname,
        lastname: form.lastname,
        username: form.username,
        email: form.email,
        password: form.password,
      });

      toast.success("Sign-up successful! Logging in...", { autoClose: 2000 });

      // Log in the user after successful registration
      const loginUser = (await Backendless.UserService.login(form.email, form.password, true)) as BackendlessUser;

      // Save session token, ownerId, email, and username in cookies
      if (loginUser["user-token"]) {
        Cookies.set("user-token", loginUser["user-token"], { expires: 7, path: "/" });
      } else {
        throw new Error("User token not received from server");
      }
      Cookies.set("ownerid", loginUser.objectId, { expires: 7, path: "/" });
      Cookies.set("email", loginUser.email || "", { expires: 7, path: "/" });
      Cookies.set("username", loginUser.username || "", { expires: 7, path: "/" });

      setTimeout(() => router.push("/profile"), 2500);
    } catch (error) {
      console.error("Sign Up Error:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unknown error occurred");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl p-8 bg-white shadow-lg rounded-lg">
        <h2 className="text-3xl font-bold text-center gradient-text">Sign Up</h2>

        <div className="mt-6 space-y-4">
          {["firstname", "lastname", "username", "email"].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 capitalize">
                {field.replace("ConfirmPassword", "Confirm Password")}
              </label>
              <input
                type="text"
                name={field}
                placeholder={`Enter your ${field}`}
                value={form[field as keyof typeof form]}
                onChange={handleChange}
                className="w-full p-3 mt-1 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 transition-all duration-300"
              />
              {errors[field] && <p className="text-red-500 text-sm mt-1">{errors[field]}</p>}
            </div>
          ))}

          {/* Password inputs with toggle visibility */}
          {["password", "confirmPassword"].map((field) => (
            <div key={field} className="relative">
              <label className="block text-sm font-medium text-gray-700 capitalize">
                {field === "confirmPassword" ? "Confirm Password" : "Password"}
              </label>
              <div className="relative">
                <input
                  type={field === "password" ? (showPassword ? "text" : "password") : showConfirmPassword ? "text" : "password"}
                  name={field}
                  placeholder={`Enter your ${field}`}
                  value={form[field as keyof typeof form]}
                  onChange={handleChange}
                  className="w-full p-3 mt-1 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 transition-all duration-300 pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                  onClick={() =>
                    field === "password"
                      ? setShowPassword(!showPassword)
                      : setShowConfirmPassword(!showConfirmPassword)
                  }
                >
                  {field === "password" ? (
                    showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />
                  ) : showConfirmPassword ? (
                    <AiOutlineEyeInvisible size={20} />
                  ) : (
                    <AiOutlineEye size={20} />
                  )}
                </button>
              </div>
              {errors[field] && <p className="text-red-500 text-sm mt-1">{errors[field]}</p>}
            </div>
          ))}
        </div>

        <button
          onClick={signUp}
          className="w-full mt-6 py-3 text-white font-semibold rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 hover:scale-105 transform transition-all duration-300"
        >
          Sign Up
        </button>

        <div className="mt-4 text-center text-gray-600">
          I already have an account.{" "}
          <button
            onClick={() => router.push("/auth/signin")}
            className="text-blue-500 font-semibold hover:underline"
          >
            Sign In
          </button>
        </div>

        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      </div>
    </div>
  );
}
