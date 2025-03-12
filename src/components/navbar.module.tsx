"use client";

import { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Link from "next/link";
import Image from "next/image";
import Backendless from "@/lib/backendless";

export default function Navbar() {
  const [cookies, setCookie, removeCookie] = useCookies([
    "user-token",
    "ownerid",
    "email",
    "username",
  ]);
  const router = useRouter();
  const isLoggedIn = Boolean(cookies["user-token"]);
  const [localUsername, setLocalUsername] = useState(cookies.username || "");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isLoggedIn && !localUsername) {
      const fetchUser = async () => {
        try {
          const currentUser = await Backendless.UserService.getCurrentUser();
          if (currentUser && currentUser.username) {
            setLocalUsername(currentUser.username);
            const expiresDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            setCookie("username", currentUser.username, { expires: expiresDate, path: "/" });
          }
        } catch (error) {
          console.error("Failed to fetch current user:", error);
        }
      };
      fetchUser();
    }
  }, [isLoggedIn, localUsername, setCookie]);

  const handleSignOut = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out from your account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, Sign Out",
    }).then((result) => {
      if (result.isConfirmed) {
        removeCookie("user-token", { path: "/" });
        removeCookie("username", { path: "/" });
        removeCookie("ownerid", { path: "/" });
        removeCookie("email", { path: "/" });
        router.push("/auth/signin");
        setIsOpen(false);
      }
    });
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md shadow-sm">
      <div className="container mx-auto flex items-center justify-between p-4">
        {/* Logo / Home link */}
        <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center">
          <div className="relative w-24 sm:w-28 md:w-32 lg:w-40 h-10">
            <Image src="/logo.png" alt="Logo" fill className="object-contain" />
          </div>
        </Link>

        {/* Desktop Menu: visible on medium screens and above */}
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/blog" className="text-gray-600 hover:text-blue-500">
            Blog
          </Link>
          {isLoggedIn ? (
            <>
              <Link
                href="/profile"
                className="text-gray-800 font-medium hover:text-blue-500"
              >
                Hello, @{localUsername || "User"}
              </Link>
              <button
                onClick={handleSignOut}
                className="bg-red-500 text-white px-5 py-2 rounded-full hover:bg-red-600 transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className="bg-blue-500 text-white px-5 py-2 rounded-full hover:bg-blue-600"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="bg-green-500 text-white px-5 py-2 rounded-full hover:bg-green-600"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button: visible on small screens */}
        <button
          onClick={toggleMenu}
          className="md:hidden p-2 text-gray-600 hover:text-blue-500 transition-colors"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg">
            <div className="container mx-auto px-4 py-6 space-y-6">
              <Link href="/" className="block" onClick={() => setIsOpen(false)}>
                Home
              </Link>
              <Link
                href="/blog"
                className="block text-gray-600 hover:text-blue-500"
                onClick={() => setIsOpen(false)}
              >
                Blog
              </Link>
              {isLoggedIn ? (
                <>
                  <Link
                    href="/profile"
                    className="block text-gray-800 font-medium hover:text-blue-500"
                    onClick={() => setIsOpen(false)}
                  >
                    Hello, @{localUsername || "User"}
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full bg-red-500 text-white px-5 py-2 rounded-full hover:bg-red-600 transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    className="block bg-blue-500 text-white px-5 py-2 rounded-full text-center hover:bg-blue-600"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="block bg-green-500 text-white px-5 py-2 rounded-full text-center hover:bg-green-600"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
