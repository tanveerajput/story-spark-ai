import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Post } from "../../../models/post";
import { useGetLatestListsQuery } from "../../../redux/apis/post.api";
import LoadingAnimation from "../../loading/loading.component";
import SSProfile from "../../ui-component/ss-profile/ss-profile";

type SpotlightWriter = {
  author: Post["author"];
  storiesCount: number;
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  bookmarksCount: number;
  engagementScore: number;
  topPost: Post;
};

const TOP_WRITERS_LIMIT = 3;

const getBookmarkCount = (post: Post) => post.bookmarks?.length ?? 0;

const getPostEngagementScore = (post: Post) =>
  (post.likesCount ?? 0) * 3 +
  (post.commentsCount ?? 0) * 2 +
  getBookmarkCount(post) * 2 +
  (post.viewsCount ?? 0);

const getWriterEngagementScore = (writer: Omit<SpotlightWriter, "engagementScore">) =>
  writer.likesCount * 3 +
  writer.commentsCount * 2 +
  writer.bookmarksCount * 2 +
  writer.viewsCount +
  writer.storiesCount * 5;

const rankStyles = [
  {
    badge: "bg-amber-400 text-slate-950 shadow-amber-500/30",
    ring: "ring-amber-300/70 dark:ring-amber-400/40",
    label: "Community leader",
  },
  {
    badge: "bg-sky-400 text-slate-950 shadow-sky-500/30",
    ring: "ring-sky-300/70 dark:ring-sky-400/40",
    label: "Rising favorite",
  },
  {
    badge: "bg-violet-400 text-slate-950 shadow-violet-500/30",
    ring: "ring-violet-300/70 dark:ring-violet-400/40",
    label: "Reader pick",
  },
];

const formatMetric = (value: number) =>
  new Intl.NumberFormat("en", { notation: "compact" }).format(value);

const CommunitySpotlightComponent = () => {
  const { data, isLoading, isError, refetch } = useGetLatestListsQuery(undefined);
  const navigate = useNavigate();

  const topWriters = useMemo(() => {
    const writers = new Map<string, Omit<SpotlightWriter, "engagementScore">>();

    data?.posts?.forEach((post: Post) => {
      if (!post.author) return;

      const authorKey = post.author._id || post.author.email || post.author.name;
      const existingWriter = writers.get(authorKey);
      const postScore = getPostEngagementScore(post);

      if (!existingWriter) {
        writers.set(authorKey, {
          author: post.author,
          storiesCount: 1,
          likesCount: post.likesCount ?? 0,
          commentsCount: post.commentsCount ?? 0,
          viewsCount: post.viewsCount ?? 0,
          bookmarksCount: getBookmarkCount(post),
          topPost: post,
        });
        return;
      }

      existingWriter.storiesCount += 1;
      existingWriter.likesCount += post.likesCount ?? 0;
      existingWriter.commentsCount += post.commentsCount ?? 0;
      existingWriter.viewsCount += post.viewsCount ?? 0;
      existingWriter.bookmarksCount += getBookmarkCount(post);

      if (postScore > getPostEngagementScore(existingWriter.topPost)) {
        existingWriter.topPost = post;
      }
    });

    return Array.from(writers.values())
      .map((writer) => ({
        ...writer,
        engagementScore: getWriterEngagementScore(writer),
      }))
      .sort((a, b) => b.engagementScore - a.engagementScore)
      .slice(0, TOP_WRITERS_LIMIT);
  }, [data?.posts]);

  if (isLoading) return <LoadingAnimation />;

  if (isError) {
    return (
      <section className="px-5 py-10">
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-10 text-center text-red-400">
          <p className="mb-3 font-semibold">Failed to load spotlight stories.</p>
          <button onClick={() => refetch()} className="rounded bg-red-600 px-4 py-2 text-sm text-white">
            Try Again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="px-5 py-10 text-slate-900 dark:text-slate-100">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">Top 3 contributors</p>
          <h2 className="text-3xl font-bold">Community Spotlight</h2>
        </div>
      </div>

      {topWriters.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {topWriters.map((writer, index) => {
            const rank = index + 1;
            const style = rankStyles[index];
            return (
              <button
                key={writer.author._id || writer.author.email || writer.author.name}
                type="button"
                onClick={() => navigate(`/post/${writer.topPost._id}`)}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 text-left transition-all hover:border-blue-400 hover:shadow-2xl"
              >
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-full ring-2 ${style.ring}`}>
                      <SSProfile name={writer.author.name || "Unknown"} size="h-10 w-10" />
                    </div>
                    <div>
                      <p className="font-bold">{writer.author.name}</p>
                      <p className="text-xs text-slate-500">{style.label}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-black ${style.badge}`}>#{rank}</span>
                </div>
                <h3 className="font-semibold line-clamp-2">{writer.topPost.title}</h3>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-500">
                  <span>Score: {formatMetric(writer.engagementScore)}</span>
                  <span>Stories: {writer.storiesCount}</span>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="text-slate-500">No top contributors yet.</p>
      )}
    </section>
  );
};

export default CommunitySpotlightComponent;