"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Backendless from "@/lib/backendless";
import Cookies from "js-cookie";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { signInSchema, SignInForm } from "@/lib/validator/signin.schema";
import { z as zod } from "zod";

type BackendlessUser = {
  objectId: string;
  "user-token": string;
  username?: string;
  email?: string;
};

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Partial<SignInForm>>({});
  const router = useRouter();

  const validateForm = () => {
    try {
      signInSchema.parse({ email, password });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof zod.ZodError) {
        const fieldErrors: Partial<SignInForm> = {};
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            fieldErrors[err.path[0] as keyof SignInForm] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const signIn = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors in the form.");
      return;
    }

    try {
      const user = (await Backendless.UserService.login(email, password, true)) as BackendlessUser;

      // Save session token, ownerId, and email in cookies
      Cookies.set("user-token", user["user-token"], { expires: 7, path: "/" });
      Cookies.set("ownerid", user.objectId, { expires: 7, path: "/" });
      Cookies.set("email", user.email || "", { expires: 7, path: "/" });

      toast.success("Login successful! Redirecting...", { autoClose: 2000 });
      setTimeout(() => router.push("/profile"), 2500);
    } catch (error) {
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
        <h2 className="text-3xl font-bold text-center gradient-text">Sign In</h2>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 mt-1 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 transition-all duration-300"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 mt-1 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 transition-all duration-300"
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </div>

        <button
          onClick={signIn}
          className="w-full mt-6 py-3 text-white font-semibold rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 hover:scale-105 transform transition-all duration-300"
        >
          Sign In
        </button>

        <div className="mt-4 text-center text-gray-600">
          Don't have an account?{" "}
          <button
            onClick={() => router.push("/auth/signup")}
            className="text-blue-500 font-semibold hover:underline"
          >
            Sign Up
          </button>
        </div>

        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      </div>
    </div>
  );
}
