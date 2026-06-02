import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Post } from "../../../models/post";
import { useGetLatestListsQuery } from "../../../redux/apis/post.api";
import LoadingAnimation from "../../loading/loading.component";

const INITIAL_VISIBLE_COUNT = 6;

const LatestPostsComponent = () => {
  const { data, isLoading, isError, refetch } = useGetLatestListsQuery(undefined);
  const navigate = useNavigate();
<<<<<<< HEAD
=======
  const [showAllPosts, setShowAllPosts] = useState(false);
>>>>>>> e32052672baa705d7f5929f0f6d4afddd09e38dc
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);

  useEffect(() => {
    setShowAllPosts(false);
  }, [data?.posts]);

  if (isLoading) return <LoadingAnimation />;

  if (isError) {
    return (
      <section className="mb-12 text-slate-900 dark:text-slate-100">
        <h2 className="mb-6 text-2xl font-bold">Latest Posts</h2>
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-5 text-center text-red-600">
          <p className="mb-3 font-semibold">Failed to load posts.</p>
          <button onClick={() => refetch()} className="rounded bg-red-600 px-4 py-2 text-sm text-white">Try Again</button>
        </div>
      </section>
    );
  }

<<<<<<< HEAD
  return (
    <section className="text-slate-900 dark:text-slate-100">
      <h2 className="text-2xl font-bold mb-6">Latest Posts</h2>
      <div className="space-y-4">
        {data?.posts?.map((post: Post) => (
          <div key={post._id} className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#252b3d]/40 shadow-sm">
            <button
              onClick={() => setExpandedPostId(expandedPostId === post._id ? null : post._id)}
              className="w-full flex items-center justify-between p-4 text-left font-bold"
            >
              <span className="text-lg md:text-xl pr-4">{post.title}</span>
              <span>{expandedPostId === post._id ? "▼" : "▶"}</span>
            </button>

            <div className={`transition-all duration-300 overflow-hidden ${expandedPostId === post._id ? "max-h-[500px] border-t border-slate-200 dark:border-slate-700" : "max-h-0"}`}>
              <div className="p-5 bg-slate-50 dark:bg-[#1e2330]/30">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  {post.content ? `${post.content.slice(0, 300)}...` : "No content."}
                </p>
                <div className="flex justify-end">
                  <button
                    onClick={() => navigate(`/post/${post._id}`)}
                    className="rounded-md bg-indigo-600 px-4 py-2 text-xs font-semibold text-white"
                  >
                    Read Full Story
                  </button>
                </div>
              </div>
            </div>
=======
  const seenIds = new Set<string>();
  const uniquePosts = (data?.posts ?? []).filter((post: Post) => {
    if (!post?._id || seenIds.has(post._id)) return false;
    seenIds.add(post._id);
    return true;
  });

  const shouldShowLoadMore = uniquePosts.length > INITIAL_VISIBLE_COUNT;
  const visiblePosts =
    showAllPosts || !shouldShowLoadMore
      ? uniquePosts
      : uniquePosts.slice(0, INITIAL_VISIBLE_COUNT);

  const toggleAccordion = (postId: string) => {
    setExpandedPostId((prevId) => (prevId === postId ? null : postId));
  };

  return (
    <section className="text-slate-100">
      <h2 className="mb-6 text-2xl font-bold">Latest Posts</h2>
      <div className="space-y-3">
        {visiblePosts.length > 0 ? (
          visiblePosts.map((post: Post) => {
            const isExpanded = expandedPostId === post._id;

            return (
              <div
                key={post._id}
                className="motion-card-subtle story-panel rounded-lg overflow-hidden border border-slate-700/30 bg-[#252b3d]/40 transition-all duration-200"
              >
                <button
                  onClick={() => toggleAccordion(post._id)}
                  className="w-full flex items-center justify-between p-4 text-left font-bold text-slate-100 hover:bg-slate-700/20 transition-colors"
                >
                  <span className="text-lg md:text-xl pr-4">{post.title}</span>
                  <span className="text-slate-400 font-mono text-sm transition-transform duration-200 select-none">
                    {isExpanded ? "▼" : "▶"}
                  </span>
                </button>

                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isExpanded ? "max-h-[500px] border-t border-slate-700/30" : "max-h-0"
                  }`}
                >
                  <div className="p-5 bg-[#1e2330]/30">
                    <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-4 whitespace-pre-wrap">
                      {post.content || "No preview content available."}
                    </p>

                    <div className="flex justify-end">
                      <button
                        onClick={() => navigate(`/post/${post._id}`)}
                        className="rounded-md bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500 shadow-sm"
                      >
                        Read Full Story
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/20 px-4 py-5 text-slate-500 dark:text-slate-400">
            Posts are not available.
>>>>>>> e32052672baa705d7f5929f0f6d4afddd09e38dc
          </div>
        ))}
      </div>
      {shouldShowLoadMore && !showAllPosts && (
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setShowAllPosts(true)}
            className="motion-cta cursor-pointer rounded-lg border border-slate-300/70 bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm hover:bg-white dark:border-white/15 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
          >
            Load More
          </button>
        </div>
      )}
    </section>
  );
};

export default LatestPostsComponent;