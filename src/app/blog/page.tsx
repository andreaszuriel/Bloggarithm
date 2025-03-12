"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Head from "next/head";
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

const SORT_OPTIONS = {
  "new-old": "createdAt DESC",
  "old-new": "createdAt ASC",
  "a-z": "title ASC",
  "z-a": "title DESC",
} as const;

const PLACEHOLDER_IMAGE =
  "https://i.pinimg.com/736x/2a/86/a5/2a86a560f0559704310d98fc32bd3d32.jpg";

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
  const observerRef = useRef<HTMLDivElement | null>(null);

  // Load/save filters from localStorage
  useEffect(() => {
    setSearch(localStorage.getItem("blog_search") || "");
    setCategory(localStorage.getItem("blog_category") || "all");
    setSort((localStorage.getItem("blog_sort") as keyof typeof SORT_OPTIONS) || "new-old");
  }, []);

  useEffect(() => {
    localStorage.setItem("blog_search", search);
    localStorage.setItem("blog_category", category);
    localStorage.setItem("blog_sort", sort);
  }, [search, category, sort]);

  // Modified fetchUsers that returns the updated mapping immediately
  const fetchUsers = async (ownerIds: string[], currentMap: Record<string, string>) => {
    const uniqueIds = [...new Set(ownerIds)];
    const missingIds = uniqueIds.filter(id => !currentMap[id]);
    if (missingIds.length === 0) return currentMap;

    const query = Backendless.DataQueryBuilder.create()
      .setWhereClause(`objectId IN (${missingIds.map(id => `'${id}'`).join(", ")})`)
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

  const fetchPosts = useCallback(async (reset = false) => {
    if (loading) return;
    setLoading(true);

    try {
      const query = Backendless.DataQueryBuilder.create()
        .setPageSize(6)
        .setOffset(reset ? 0 : (page - 1) * 6)
        .setSortBy([SORT_OPTIONS[sort]]);

      const whereClause: string[] = [];
      if (search) whereClause.push(`title LIKE '%${search}%'`);
      if (category !== "all") whereClause.push(`category = '${category}'`);
      if (whereClause.length) query.setWhereClause(whereClause.join(" AND "));

      const data = await Backendless.Data.of("Post").find<Post>(query);
      const ownerIds = data.map(post => post.ownerId);
      // Get the updated mapping for these ownerIds
      const mapping = await fetchUsers(ownerIds, userMap);

      // Bypass the extra process by immediately setting the author from the mapping
      const enhancedPosts = data.map(post => ({
        ...post,
        author: { username: mapping[post.ownerId] || "Unknown" }
      }));

      setPosts(prev => {
        const newPosts = reset ? enhancedPosts : [...prev, ...enhancedPosts];
        // Remove duplicates if any
        return newPosts.filter(
          (post, index, self) =>
            self.findIndex(p => p.objectId === post.objectId) === index
        );
      });

      setHasMore(data.length === 6);
      if (reset) setPage(2);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setLoading(false);
    }
  }, [search, category, sort, page, loading, userMap]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry?.isIntersecting && hasMore && !loading && setPage(p => p + 1),
      { rootMargin: "200px" }
    );

    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [loading, hasMore]);

  useEffect(() => {
    fetchPosts(true);
  }, [search, category, sort]);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 mt-[3cm]">
      <Head>
        <title>Blog | All Posts</title>
        <meta name="description" content="Browse all blog posts." />
      </Head>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search posts..."
          className="p-2 border rounded-md flex-1 min-w-[180px]"
          onChange={debounce(e => setSearch(e.target.value), 300)}
          defaultValue={search}
        />

        <select
          className="p-2 border rounded-md"
          value={category}
          onChange={e => setCategory(e.target.value)}
        >
          {["all", "Tech", "Lifestyle"].map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>

        <select
          className="p-2 border rounded-md"
          value={sort}
          onChange={e => setSort(e.target.value as keyof typeof SORT_OPTIONS)}
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

      {/* Content */}
      <button
        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        onClick={() => router.push("/blog/create")}
      >
        Create New Post
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map(post => (
          <div
            key={post.objectId}
            className="bg-white border rounded-lg shadow hover:shadow-xl cursor-pointer"
            onClick={() => router.push(`/blog/${post.objectId}`)}
          >
            <img
              src={post.image || PLACEHOLDER_IMAGE}
              alt={post.title}
              className="w-full h-48 object-cover rounded-t-lg"
              loading="lazy"
              onError={e => (e.currentTarget.src = PLACEHOLDER_IMAGE)}
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
              <p className="text-sm text-gray-600 mb-1">
                by {post.author?.username || "Unknown"}
              </p>
              <p className="text-sm text-gray-500">
                {post.category} • {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div ref={observerRef} className="h-4" />
      {loading && <p className="text-center mt-4">Loading more posts...</p>}
    </div>
  );
}
