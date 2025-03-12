"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Backendless from "@/lib/backendless";
import Swal from "sweetalert2";
import Cookies from "js-cookie";

interface Post {
  objectId?: string;
  title: string;
  content: string;
  category: string;
  imageUrl?: string;
}

export default function CreateBlogPage() {
  const [formData, setFormData] = useState<Post>({
    title: "",
    content: "",
    category: "",
    imageUrl: "",
  });

  const router = useRouter();
  const categories = ["Technology", "Lifestyle", "Travel", "Food"];
  const contentRef = useRef<HTMLTextAreaElement>(null);

  // Protect the page: only signed-in users can access it
  useEffect(() => {
    const checkUserSession = async () => {
      let currentUser = await Backendless.UserService.getCurrentUser();

      if (!currentUser) {
        const userToken = Cookies.get("user-token");
        if (userToken) {
          const isValid = await Backendless.UserService.isValidLogin();
          if (isValid) {
            currentUser = await Backendless.UserService.getCurrentUser();
          }
        }
      }

      if (!currentUser) {
        Cookies.remove("user-token"); // Remove token if session is invalid
        router.push("/auth/signin");
      }
    };

    checkUserSession();
  }, [router]);

  // Function to apply formatting to the selected text in the content textarea
  const applyFormatting = (format: "bold" | "italic" | "underline") => {
    if (contentRef.current) {
      const textarea = contentRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentValue = textarea.value;
      const selectedText = currentValue.substring(start, end);

      let formattedText = selectedText;
      switch (format) {
        case "bold":
          formattedText = `**${selectedText}**`;
          break;
        case "italic":
          formattedText = `*${selectedText}*`;
          break;
        case "underline":
          formattedText = `<u>${selectedText}</u>`;
          break;
        default:
          break;
      }
      const newValue = currentValue.substring(0, start) + formattedText + currentValue.substring(end);
      setFormData({ ...formData, content: newValue });
      // reset cursor position:
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start, start + formattedText.length);
      }, 0);
    }
  };

  // Function to show text formatting instructions
  const showFormattingInfo = () => {
    Swal.fire({
      title: "Text Formatting Instructions",
      html: `
        <p><strong>Italic:</strong> Use one asterisk → <code>*italic text*</code></p>
        <p><strong>Bold:</strong> Use two asterisks → <code>**bold text**</code></p>
        <p><strong>Underline:</strong> Use HTML → <code>&lt;u&gt;underlined text&lt;/u&gt;</code></p>
        <hr/>
        <p><strong>Lists:</strong></p>
        <p>Bullet Points: Start with - or *</p>
        <p>Numbered List: Start with 1.</p>
        <hr/>
        <p><strong>Paragraphs & Line Breaks:</strong></p>
        <p>New Paragraph: Press Enter twice</p>
        <p>Line Break: Use <code>&lt;br/&gt;</code></p>
      `,
      icon: "info",
      confirmButtonText: "Got it!",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that a category is selected
    if (!formData.category) {
      Swal.fire("Oops!", "Please select a category.", "warning");
      return;
    }

    try {
      const postData = {
        ...formData,
        createdAt: formData.objectId ? undefined : new Date(),
        updatedAt: new Date(),
      };

      await Backendless.Data.of("post").save<Post>(postData);

      Swal.fire({
        icon: "success",
        title: formData.objectId ? "Post Updated!" : "Post Created!",
        showConfirmButton: false,
        timer: 1500,
      });

      // Redirect to "/profile" after submission
      router.push("/profile");
    } catch (error) {
      Swal.fire("Error!", "Failed to save post.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {/* Container with responsive max-width classes */}
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
          {formData.objectId ? "✏️ Edit Your Post" : "🖋️ Create a New Blog"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image URL (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Featured Image URL (Optional)
            </label>
            <input
              type="url"
              placeholder="https://example.com/image.jpg"
              className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-400 transition-all"
              value={formData.imageUrl || ""}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Post Title
            </label>
            <input
              type="text"
              placeholder="Amazing blog title"
              className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-400 transition-all"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          {/* Formatting Toolbar */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => applyFormatting("bold")}
              className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm"
            >
              Bold
            </button>
            <button
              type="button"
              onClick={() => applyFormatting("italic")}
              className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm"
            >
              Italic
            </button>
            <button
              type="button"
              onClick={() => applyFormatting("underline")}
              className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm"
            >
              Underline
            </button>
            <button
              type="button"
              onClick={showFormattingInfo}
              className="px-3 py-1 bg-gray-300 text-gray-800 rounded-md text-sm"
            >
              Formatting Info
            </button>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Post Content
            </label>
            <textarea
              ref={contentRef}
              placeholder="Write your amazing content here..."
              className="w-full p-3 border border-gray-300 rounded-xl shadow-sm h-40 focus:ring-2 focus:ring-blue-400 transition-all"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
            />
          </div>

          {/* Categories (Mandatory) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat })}
                  className={`p-3 rounded-xl text-sm font-medium transition-all ${
                    formData.category === cat
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200"
          >
            {formData.objectId ? "Update Post" : "Publish Post 🚀"}
          </button>
        </form>
      </div>
    </div>
  );
}
