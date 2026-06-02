import { useState } from "react";
import { useGetLatestListsQuery } from "../../../redux/apis/post.api";
import { Post } from "../../../models/post";
import LoadingAnimation from "../../loading/loading.component";
import { useNavigate } from "react-router-dom";

const LatestPostsComponent = () => {
  const { data, isLoading, isError, refetch } = useGetLatestListsQuery(undefined);
  const navigate = useNavigate();
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);

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
          </div>
        ))}
      </div>
    </section>
  );
};

export default LatestPostsComponent;