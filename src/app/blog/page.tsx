"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Head from "next/head";
import Image from "next/image";
import Backendless from "@/lib/backendless";
import debounce from "lodash.debounce";

interface Post {
  objectId: string;
  title: string;
  category: string;
  image: string;
  createdAt: string;
  ownerId: string;
  author?: {
    username: string;
  };
}

interface User {
  objectId: string;
  username: string;
}

/**
 * Sort options for posts.
 */
const SORT_OPTIONS = {
  "new-old": "createdAt DESC",
  "old-new": "createdAt ASC",
  "a-z": "title ASC",
  "z-a": "title DESC",
} as const;

const PLACEHOLDER_IMAGE =
  "https://i.pinimg.com/736x/2a/86/a5/2a86a560f0559704310d98fc32bd3d32.jpg";

/**
 * Helper function to limit posts per user.
 * Assumes that the posts are sorted appropriately (e.g., newest first).
 */
const limitPostsPerUser = (posts: Post[], limit = 3): Post[] => {
  const countMap: Record<string, number> = {};
  const result: Post[] = [];
  for (const post of posts) {
    if (!countMap[post.ownerId]) {
      countMap[post.ownerId] = 0;
    }
    if (countMap[post.ownerId] < limit) {
      result.push(post);
      countMap[post.ownerId]++;
    }
  }
  return result;
};

export default function BlogPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [userMap, setUserMap] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<keyof typeof SORT_OPTIONS>("new-old");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  // Memoize the debounced function so it is not recreated on every render
  const debouncedSetSearch = useCallback(
    debounce((value: string) => {
      setSearch(value);
    }, 300),
    []
  );

  // Load and save filters from localStorage
  useEffect(() => {
    setSearch(localStorage.getItem("blog_search") || "");
    setCategory(localStorage.getItem("blog_category") || "all");
    setSort(
      (localStorage.getItem("blog_sort") as keyof typeof SORT_OPTIONS) ||
        "new-old"
    );
  }, []);

  useEffect(() => {
    localStorage.setItem("blog_search", search);
    localStorage.setItem("blog_category", category);
    localStorage.setItem("blog_sort", sort);
  }, [search, category, sort]);

  // Function to fetch user data based on ownerIds
  const fetchUsers = async (
    ownerIds: string[],
    currentMap: Record<string, string>
  ) => {
    const uniqueIds = [...new Set(ownerIds)];
    const missingIds = uniqueIds.filter((id) => !currentMap[id]);
    if (missingIds.length === 0) return currentMap;

    const query = Backendless.DataQueryBuilder.create()
      .setWhereClause(
        `objectId IN (${missingIds.map((id) => `'${id}'`).join(", ")})`
      )
      .setPageSize(100);

    try {
      const users = await Backendless.Data.of("Users").find<User>(query);
      const newMapping = users.reduce((acc, user) => {
        acc[user.objectId] = user.username;
        return acc;
      }, {} as Record<string, string>);
      const updatedMapping = { ...currentMap, ...newMapping };
      setUserMap(updatedMapping);
      return updatedMapping;
    } catch (error) {
      console.error("Error fetching users:", error);
      return currentMap;
    }
  };

  // Function to fetch new posts when filters change (reset)
  const fetchPostsReset = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const query = Backendless.DataQueryBuilder.create()
        .setPageSize(6)
        .setOffset(0)
        .setSortBy([SORT_OPTIONS[sort]]);

      const whereClause: string[] = [];
      if (search) whereClause.push(`title LIKE '%${search}%'`);
      if (category !== "all") whereClause.push(`category = '${category}'`);
      if (whereClause.length) query.setWhereClause(whereClause.join(" AND "));

      const data = await Backendless.Data.of("Post").find<Post>(query);
      const ownerIds = data.map((post) => post.ownerId);
      const mapping = await fetchUsers(ownerIds, userMap);
      const enhancedPosts = data.map((post) => ({
        ...post,
        author: { username: mapping[post.ownerId] || "Unknown" },
      }));
      // Limit to a maximum of 3 posts per user
      const filteredPosts = limitPostsPerUser(enhancedPosts);
      setPosts(filteredPosts);
      setHasMore(data.length === 6);
      setPage(2);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setLoading(false);
    }
  }, [search, category, sort, userMap, loading]);

  // Function to fetch additional posts (load more)
  const fetchMorePosts = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const query = Backendless.DataQueryBuilder.create()
        .setPageSize(6)
        .setOffset((page - 1) * 6)
        .setSortBy([SORT_OPTIONS[sort]]);

      const whereClause: string[] = [];
      if (search) whereClause.push(`title LIKE '%${search}%'`);
      if (category !== "all") whereClause.push(`category = '${category}'`);
      if (whereClause.length) query.setWhereClause(whereClause.join(" AND "));

      const data = await Backendless.Data.of("Post").find<Post>(query);
      const ownerIds = data.map((post) => post.ownerId);
      const mapping = await fetchUsers(ownerIds, userMap);
      const enhancedPosts = data.map((post) => ({
        ...post,
        author: { username: mapping[post.ownerId] || "Unknown" },
      }));
      setPosts((prev) => {
        // Combine old and new posts, then limit to a maximum of 3 posts per user
        const combined = [...prev, ...enhancedPosts];
        return limitPostsPerUser(combined);
      });
      setHasMore(data.length === 6);
      setPage((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setLoading(false);
    }
  }, [search, category, sort, page, userMap, loading]);

  // Call fetchPostsReset when filters change
  useEffect(() => {
    fetchPostsReset();
  }, [search, category, sort, fetchPostsReset]);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 mt-[3cm]">
      <Head>
        <title>Blog | All Posts</title>
        <meta name="description" content="Browse all blog posts." />
      </Head>

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search posts..."
          className="p-2 border rounded-md flex-1 min-w-[180px]"
          onChange={(e) => debouncedSetSearch(e.target.value)}
          defaultValue={search}
        />

        <select
          className="p-2 border rounded-md"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {["all", "Tech", "Lifestyle"].map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>

        <select
          className="p-2 border rounded-md"
          value={sort}
          onChange={(e) =>
            setSort(e.target.value as keyof typeof SORT_OPTIONS)
          }
        >
          {Object.entries(SORT_OPTIONS).map(([key, val]) => (
            <option key={key} value={key}>
              {val.split(" ")[1]}
            </option>
          ))}
        </select>

        <button
          className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          onClick={() => {
            setSearch("");
            setCategory("all");
            setSort("new-old");
          }}
        >
          Clear Filters
        </button>
      </div>

      {/* Button to create a new post */}
      <button
        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        onClick={() => router.push("/blog/create")}
      >
        Create New Post
      </button>

      {/* Display list of posts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <div
            key={post.objectId}
            className="bg-white border rounded-lg shadow hover:shadow-xl cursor-pointer"
            onClick={() => router.push(`/blog/${post.objectId}`)}
          >
            <div className="relative w-full h-48 rounded-t-lg">
              <Image
                src={post.image || PLACEHOLDER_IMAGE}
                alt={post.title}
                fill
                className="object-cover rounded-t-lg"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
              <p className="text-sm text-gray-600 mb-1">
                by {post.author?.username || "Unknown"}
              </p>
              <p className="text-sm text-gray-500">
                {post.category} •{" "}
                {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && !loading && (
        <div className="flex justify-center mt-4">
          <button
            onClick={fetchMorePosts}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Load More
          </button>
        </div>
      )}

      {loading && <p className="text-center mt-4">Loading more posts...</p>}
    </div>
  );
}
