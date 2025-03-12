"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import Backendless from "@/lib/backendless";
import Link from "next/link";
import Image from "next/image";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { AiOutlineEdit } from "react-icons/ai";

// Define a type for user data from Backendless.
interface UserData {
  objectId: string;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  image?: string;
}

interface Post {
  objectId: string;
  title: string;
  image: string;
  category: string;
  created: string;
  ownerId: string;
  author?: {
    username: string;
  };
}

// For the raw data returned from Backendless.
interface RawPost {
  objectId?: string;
  title?: string;
  image?: string;
  category?: string;
  created?: string;
  ownerId?: string;
  author?: { username?: string } | Array<{ username?: string }> | null;
}

// Define a simple interface for the query builder used by Backendless.
interface QueryBuilder {
  setWhereClause(clause: string): void;
  setRelated(relations: string[]): void;
  sortByClause?: string;
  pageSize?: number;
}

export default function Profile() {
  const [user, setUser] = useState<UserData | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [accordionTitles, setAccordionTitles] = useState<
    { objectId: string; title: string }[]
  >([]);
  const [accordionOpen, setAccordionOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Get banner URL from cookies or use default
  const bannerUrl = Cookies.get("banner-url") || "/default-banner.jpg";

  // Function to edit the banner (saved in cookies)
  const handleEditBanner = async () => {
    const { value: imageUrl } = await Swal.fire({
      title: "Enter Banner Image URL",
      input: "url",
      inputLabel: "Banner Image URL",
      inputPlaceholder: "Enter the image URL here",
      showCancelButton: true,
      confirmButtonText: "OK",
    });

    if (imageUrl) {
      Cookies.set("banner-url", imageUrl, { expires: 7, path: "/" });
      await Swal.fire("Success", "Banner updated successfully!", "success");
      toast.success("Banner updated successfully!");
      router.refresh();
    }
  };

  // Function to edit profile details
  const handleEditProfile = async () => {
    const { value: formValues } = await Swal.fire({
      title: "Edit Profile",
      html:
        `<input id="swal-input1" class="swal2-input" placeholder="Username" value="${
          user?.username || ""
        }">` +
        `<input id="swal-input2" class="swal2-input" placeholder="First Name" value="${
          user?.firstname || ""
        }">` +
        `<input id="swal-input3" class="swal2-input" placeholder="Last Name" value="${
          user?.lastname || ""
        }">` +
        `<input id="swal-input4" class="swal2-input" placeholder="Profile Image URL" value="${
          user?.image || ""
        }">`,
      focusConfirm: false,
      preConfirm: () => {
        return {
          username: (document.getElementById("swal-input1") as HTMLInputElement)
            .value,
          firstname: (document.getElementById("swal-input2") as HTMLInputElement)
            .value,
          lastname: (document.getElementById("swal-input3") as HTMLInputElement)
            .value,
          image: (document.getElementById("swal-input4") as HTMLInputElement)
            .value,
        };
      },
      showCancelButton: true,
      confirmButtonText: "Save",
    });

    if (formValues) {
      try {
        const updatedUser = { ...user, ...formValues };
        await Backendless.UserService.update(updatedUser);
        setUser(updatedUser);
        await Swal.fire("Success", "Profile updated successfully!", "success");
        toast.success("Profile updated successfully!");
      } catch {
        console.error("Failed to update profile");
        toast.error("Failed to update profile!");
      }
    }
  };

  useEffect(() => {
    const checkUserSessionAndFetchPosts = async () => {
      try {
        let currentUser = await Backendless.UserService.getCurrentUser();

        // If currentUser is not found, check token manually.
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
          Cookies.remove("user-token");
          router.push("/auth/signin");
          return;
        }

        // Explicitly cast the returned user object via unknown.
        setUser((currentUser as unknown) as UserData);

        // Query for the latest 6 posts sorted by created date descending.
        const latestQuery = Backendless.DataQueryBuilder.create() as QueryBuilder;
        latestQuery.setWhereClause(`ownerId = '${(currentUser as unknown as UserData).objectId}'`);
        latestQuery.sortByClause = "created DESC";
        latestQuery.pageSize = 6;
        latestQuery.setRelated(["author"]);
        const latestPosts = (await Backendless.Data.of("post").find(latestQuery)) as RawPost[];

        const formattedLatestPosts: Post[] = await Promise.all(
          latestPosts.map(async (post: RawPost) => {
            let username = "Unknown";
            if (post.author) {
              const authorObj = Array.isArray(post.author) ? post.author[0] : post.author;
              username = authorObj?.username || "Unknown";
            }
            // If username is still unknown, fetch user data using ownerId.
            if (username === "Unknown" && post.ownerId) {
              try {
                const userData = (await Backendless.Data.of("users").findById(post.ownerId)) as UserData;
                username = userData.username;
              } catch {
                username = "Unknown";
              }
            }
            return {
              objectId: post.objectId || "",
              title: post.title || "Untitled",
              image: post.image || "/default-post.png",
              category: post.category || "",
              created: post.created || "",
              ownerId: post.ownerId || "",
              author: { username },
            };
          })
        );

        setPosts(formattedLatestPosts);

        // Query for all posts (for accordion) sorted by title alphabetically.
        const titleQuery = Backendless.DataQueryBuilder.create() as QueryBuilder;
        titleQuery.setWhereClause(`ownerId = '${(currentUser as unknown as UserData).objectId}'`);
        titleQuery.sortByClause = "title ASC";
        const allPosts = (await Backendless.Data.of("post").find(titleQuery)) as RawPost[];

        const formattedTitles: { objectId: string; title: string }[] = allPosts.map(
          (post: RawPost) => ({
            objectId: post.objectId || "",
            title: post.title || "Untitled",
          })
        );

        setAccordionTitles(formattedTitles);
      } catch (err) {
        console.error(err);
        setError("Error fetching posts");
      } finally {
        setLoading(false);
      }
    };

    checkUserSessionAndFetchPosts();
  }, [router]);

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  // Prevent rendering if user is not set (after attempted redirect)
  if (!user) return null;

  return (
    <div className="p-4 md:p-8 max-w-screen-xl mx-auto">
      {/* Banner Section */}
      <div className="relative mb-10 mt-20 h-60 sm:h-80 md:h-96">
        <Image
          src={bannerUrl}
          alt="Banner"
          fill
          className="object-cover rounded-lg shadow-lg"
          sizes="(max-width: 768px) 100vw, 80vw"
        />
        <button
          onClick={handleEditBanner}
          className="absolute bottom-4 left-4 bg-white p-2 rounded-full shadow-lg hover:bg-gray-200"
        >
          <AiOutlineEdit size={24} className="text-gray-700" />
        </button>
      </div>

      {/* Profile Header */}
      <div className="relative -mt-16 mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between bg-white shadow-lg rounded-lg p-4 md:p-6">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24">
              <Image
                src={user.image || "/default-user.png"}
                alt={user.username}
                fill
                className="rounded-full object-cover"
              />
            </div>
            <div>
              <p className="font-bold text-xl">{user.username}</p>
              <p className="text-lg">
                {user.firstname} {user.lastname}
              </p>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row items-center gap-2">
            <button
              onClick={handleEditProfile}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition w-full sm:w-auto"
            >
              Edit Profile
            </button>
            <Link href="/blog/create" className="w-full sm:w-auto">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                Write Now
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Accordion for Post Titles */}
      <div className="mb-6">
        <button
          onClick={() => setAccordionOpen(!accordionOpen)}
          className="w-full text-left px-4 py-2 bg-gray-200 rounded-md focus:outline-none"
        >
          {accordionOpen ? "Hide Post Titles" : "Show Post Titles"}
        </button>
        {accordionOpen && (
          <div className="mt-2 border rounded-md p-4 bg-gray-50">
            <ul className="list-disc list-inside">
              {accordionTitles.map((item) => (
                <li key={item.objectId} className="text-sm">
                  {item.title}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Cards for 6 Latest Posts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.length > 0 ? (
          posts.map((post) => (
            <Link key={post.objectId} href={`/blog/${post.objectId}`}>
              <div className="bg-gray-100 border rounded-lg overflow-hidden shadow hover:shadow-lg transition cursor-pointer">
                <div className="relative w-full h-48">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold">{post.title}</h3>
                  <p className="text-sm text-gray-600">
                    by {post.author?.username || "Unknown"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {post.category} -{" "}
                    {new Date(post.created).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-gray-500">No posts found.</p>
        )}
      </div>
    </div>
  );
}
