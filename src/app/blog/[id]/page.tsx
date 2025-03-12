"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Backendless from "@/lib/backendless";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import Image from "next/image";

interface User {
  objectId?: string;
  username: string;
}

interface Post {
  objectId: string;
  title: string;
  content: string;
  category: string;
  created: string;
  image?: string;
  username?: string;
  ownerId: string;
}

const categories = ["Technology", "Lifestyle", "Travel", "Food"];

// Declare global window properties for Swal inline functions
declare global {
  interface Window {
    handleFormat: (format: "bold" | "italic" | "underline") => void;
    handleCategory: (category: string) => void;
    handleFormatInfo: () => void;
    selectedCategory: string;
  }
}

export default function BlogDetail() {
  const router = useRouter();
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : null;
  const [post, setPost] = useState<Post | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        const data = (await Backendless.Data.of("post").findById(id)) as Post;
        if (data && data.ownerId) {
          const ownerData = (await Backendless.Data.of("users").findById(data.ownerId)) as User;
          data.username = ownerData.username;
        }
        setPost(data);

        const user = await Backendless.UserService.getCurrentUser();
        if (user) setCurrentUser(user as User);
      } catch (err) {
        console.error("Error fetching post:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const isOwner = currentUser && post && currentUser.objectId === post.ownerId;

  const handleDelete = async () => {
    if (!post) return;
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This post will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });
    if (result.isConfirmed) {
      try {
        await Backendless.Data.of("post").remove(post.objectId);
        toast.success("Post deleted successfully!");
        router.push("/blog");
      } catch (error) {
        console.error("Error deleting post:", error);
        toast.error("Failed to delete post!");
      }
    }
  };

  const applyFormatting = (
    textarea: HTMLTextAreaElement,
    format: "bold" | "italic" | "underline"
  ) => {
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
    }

    textarea.value =
      currentValue.substring(0, start) +
      formattedText +
      currentValue.substring(end);
    textarea.focus();
    textarea.setSelectionRange(start, start + formattedText.length);
  };

  const handleEdit = async () => {
    if (!post) return;

    const { value: formValues } = await Swal.fire({
      title: "Edit Post",
      html: `
        <div class="space-y-4 text-left">
          <div>
            <label class="block text-sm font-medium mb-2">Featured Image URL</label>
            <input id="swal-image" value="${post.image || ""}" 
              class="w-full p-2 border rounded-md mb-2" placeholder="https://example.com/image.jpg">
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-2">Title</label>
            <input id="swal-title" value="${post.title}" 
              class="w-full p-2 border rounded-md" required>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Content</label>
            <div class="flex gap-2 mb-2">
              <button type="button" onclick="handleFormat('bold')" 
                class="px-3 py-1 bg-blue-600 text-white rounded-md text-sm">Bold</button>
              <button type="button" onclick="handleFormat('italic')"
                class="px-3 py-1 bg-blue-600 text-white rounded-md text-sm">Italic</button>
              <button type="button" onclick="handleFormat('underline')"
                class="px-3 py-1 bg-blue-600 text-white rounded-md text-sm">Underline</button>
              <button type="button" onclick="handleFormatInfo()"
                class="px-3 py-1 bg-gray-300 text-gray-800 rounded-md text-sm">Formatting Info</button>
            </div>
            <textarea id="swal-content" class="w-full p-2 border rounded-md h-40">${post.content}</textarea>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Category</label>
            <div class="grid grid-cols-2 gap-2">
              ${categories
                .map(
                  (cat) => `
                <button type="button" onclick="handleCategory('${cat}')" 
                  class="p-2 rounded-md text-sm ${
                    cat === post.category
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }">${cat}</button>
              `
                )
                .join("")}
            </div>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Save Changes",
      didOpen: () => {
        window.selectedCategory = post.category;

        window.handleFormat = (format: "bold" | "italic" | "underline") => {
          const textarea = document.getElementById("swal-content") as HTMLTextAreaElement;
          applyFormatting(textarea, format);
        };

        window.handleCategory = (category: string) => {
          window.selectedCategory = category;
          document
            .querySelectorAll<HTMLButtonElement>("#swal2-html-container button")
            .forEach((btn) => {
              btn.classList.toggle("bg-blue-600", btn.textContent === category);
              btn.classList.toggle("text-white", btn.textContent === category);
            });
        };

        window.handleFormatInfo = () => {
          Swal.fire({
            title: "Text Formatting Instructions",
            html: `
              <p><strong>Italic:</strong> *italic text*</p>
              <p><strong>Bold:</strong> **bold text**</p>
              <p><strong>Underline:</strong> &lt;u&gt;underlined text&lt;/u&gt;</p>
              <hr/>
              <p>Bullet Lists: Start with - or *</p>
              <p>Numbered Lists: Start with 1.</p>
            `,
            icon: "info",
          });
        };
      },
      preConfirm: () => {
        const title = (document.getElementById("swal-title") as HTMLInputElement)
          .value;
        const content = (document.getElementById("swal-content") as HTMLTextAreaElement)
          .value;
        const image = (document.getElementById("swal-image") as HTMLInputElement)
          .value;
        const category = window.selectedCategory || post.category;

        if (!title || !content || !category) {
          Swal.showValidationMessage("Please fill in all required fields");
          return false;
        }

        return { title, content, category, image };
      },
    });

    if (formValues) {
      try {
        const updatedPost = { ...post, ...formValues };
        await Backendless.Data.of("post").save(updatedPost);
        setPost(updatedPost);
        toast.success("Post updated successfully!");
      } catch (error) {
        console.error("Error updating post:", error);
        toast.error("Failed to update post!");
      }
    }
  };

  if (!id) return <p className="text-center text-red-500">Invalid Post ID.</p>;
  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (!post) return <p className="text-center text-red-500">Post not found.</p>;

  return (
    <div className="container mx-auto px-4 py-6" style={{ marginTop: "3cm" }}>
      <button
        onClick={() => router.push("/blog")}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md mb-4"
      >
        ← Back
      </button>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-4xl font-bold mb-2">{post.title}</h1>
        <p className="text-gray-500 text-sm mb-2">
          By{" "}
          <span className="text-blue-500 font-semibold">
            {post.username || "Unknown"}
          </span>{" "}
          • {new Date(post.created).toLocaleDateString()} • {post.category}
        </p>

        {post.image ? (
          <Image
            src={post.image}
            alt="Post Banner"
            width={800}
            height={288}
            className="w-full h-72 object-cover rounded-lg mb-4"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-72 bg-gray-200 flex items-center justify-center text-gray-500 rounded-lg mb-4">
            No Image
          </div>
        )}

        <div className="text-gray-600 space-y-4">
          {post.content.split("\n").map((paragraph, index) => (
            <p key={index} dangerouslySetInnerHTML={{ __html: paragraph }} />
          ))}
        </div>
      </div>

      {isOwner && (
        <div className="mt-6 flex gap-4">
          <button
            onClick={handleEdit}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
