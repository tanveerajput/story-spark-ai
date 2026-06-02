import React, { useState, useEffect, useRef, useMemo } from "react";
import StoriesViewComponent, { IStories } from "./stories.view.component";
import RecentPromptsPanel from "./RecentPromptsPanel";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getUserInfo, isLoggedIn } from "../../services/auth.service";
import { getRequestLimit, getWordCount, prompts } from "./stories.utils";
import {
  useGenerateFreeModelMutation,
  useGenerateModelMutation,
} from "../../redux/apis/ai.model.api";
import toast, { Toaster } from "react-hot-toast";
import { SubmitHandler, useForm } from "react-hook-form";
import { useGetProfileInfoQuery } from "../../redux/apis/user.api";
import { getErrorMessage } from "../../error/error.message";
import useKeyboardShortcuts from "../../hooks/useKeyboardShortcuts";
import { useRecentPrompts } from "../../hooks/useRecentPrompts";
import StoryGeneratingAnimation from "../loading/story-generating-animation.component";

const soundtrackMap: Record<string, string> = {
  "🧙 Fantasy": "/audio/fantasy.mp3",
  "😱 Horror": "/audio/horror.mp3",
  "💕 Romance": "/audio/romance.mp3",
  "🎭 Drama": "/audio/drama.mp3",
  "😂 Comedy": "/audio/comedy.mp3",
  "🚀 Sci-Fi": "/audio/sci-fi.mp3",
  "🔍 Mystery": "/audio/mystery.mp3",
  "🌟 Adventure": "/audio/adventure.mp3"
};

type Inputs = { prompt: string };
const MAX_PROMPT_LENGTH = 2000;
const WARN_THRESHOLD = 0.85;

const LANGUAGES = [
  { code: "en", name: "English" }, { code: "hi", name: "Hindi" },
  { code: "es", name: "Spanish" }, { code: "fr", name: "French" },
  { code: "pt", name: "Portuguese" }, { code: "de", name: "German" },
  { code: "ja", name: "Japanese" }, { code: "ko", name: "Korean" },
];

const GENRES = [
  { value: "🎭 Drama", icon: "🎭", name: "Drama" },
  { value: "😂 Comedy", icon: "😂", name: "Comedy" },
  { value: "😱 Horror", icon: "😱", name: "Horror" },
  { value: "💕 Romance", icon: "💕", name: "Romance" },
  { value: "🚀 Sci-Fi", icon: "🚀", name: "Sci-Fi" },
  { value: "🧙 Fantasy", icon: "🧙", name: "Fantasy" },
  { value: "🔍 Mystery", icon: "🔍", name: "Mystery" },
  { value: "🌟 Adventure", icon: "🌟", name: "Adventure" },
] as const;

const TONES = [
  { label: "Dark", emoji: "🌑", activeClass: "bg-gray-700 text-gray-100 border-gray-500 shadow-gray-700/40", inactiveClass: "bg-white/5 text-gray-400 border-transparent hover:bg-white/10 hover:text-gray-200" },
  { label: "Whimsical", emoji: "🌈", activeClass: "bg-sky-500/20 text-sky-300 border-sky-500/60 shadow-sky-500/20", inactiveClass: "bg-white/5 text-gray-400 border-transparent hover:bg-white/10 hover:text-gray-200" },
  { label: "Dramatic", emoji: "🎬", activeClass: "bg-red-500/20 text-red-300 border-red-500/60 shadow-red-500/20", inactiveClass: "bg-white/5 text-gray-400 border-transparent hover:bg-white/10 hover:text-gray-200" },
  { label: "Humorous", emoji: "😄", activeClass: "bg-yellow-500/20 text-yellow-300 border-yellow-500/60 shadow-yellow-500/20", inactiveClass: "bg-white/5 text-gray-400 border-transparent hover:bg-white/10 hover:text-gray-200" },
] as const;

type ToneLabel = (typeof TONES)[number]["label"];

const TonePicker: React.FC<{ selected: ToneLabel | ""; onChange: (tone: ToneLabel | "") => void }> = ({ selected, onChange }) => (
  <div className="flex flex-wrap gap-2 mb-3">
    <span className="w-full text-xs text-gray-400 mb-1">🎭 Tone:</span>
    {TONES.map((tone) => {
      const isActive = selected === tone.label;
      return (
        <button
          key={tone.label}
          type="button"
          onClick={() => onChange(isActive ? "" : tone.label)}
          className={`px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200 ${isActive ? `${tone.activeClass} shadow-md scale-105` : tone.inactiveClass}`}
        >
          {tone.emoji} {tone.label}
        </button>
      );
    })}
  </div>
);

const StoriesComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { register, handleSubmit, reset, setValue } = useForm<Inputs>();

  const draft = useMemo(() => {
    try {
      const saved = localStorage.getItem("story_spark_draft");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }, []);

  const [stories, setStories] = useState<IStories[]>(
    draft?.stories?.length ? draft.stories : [{ uuid: "test-1", title: "The Wizard's Journey", content: "Merlin walked through the forest...", tag: "Fantasy", imageURL: "https://via.placeholder.com/400x300" }]
  );

  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchFilter, setSearchFilter] = useState<string>("all");

  const filteredStories = useMemo(() => {
    if (!searchQuery.trim()) return stories;
    const query = searchQuery.toLowerCase();
    return stories.filter((story) => {
      switch (searchFilter) {
        case "title": return story.title?.toLowerCase().includes(query);
        case "content": return story.content?.toLowerCase().includes(query);
        case "genre": return story.tag?.toLowerCase().includes(query);
        case "all":
        default: return (story.title?.toLowerCase().includes(query) || story.content?.toLowerCase().includes(query) || story.tag?.toLowerCase().includes(query));
      }
    });
  }, [stories, searchQuery, searchFilter]);

  const { data } = useGetProfileInfoQuery(undefined);
  const userRole = getUserInfo();
  const login = isLoggedIn();
  const [generateModel] = useGenerateModelMutation();
  const [generateFreeModel] = useGenerateFreeModelMutation();

  const [selectedPrompt, setSelectedPrompt] = useState<string>("");
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string>("🧙 Fantasy");
  const [selectedLength, setSelectedLength] = useState<string>("medium");
  const [selectedTone, setSelectedTone] = useState<ToneLabel | "">("");
  const [textareaValue, setTextareaValue] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("English");
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const languageDropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const activeGenerationRef = useRef<{ abort: () => void } | null>(null);
  const isGenerationInProgressRef = useRef(false);
  const [guestRequestCount, setGuestRequestCount] = useState<number>(0);
  const [showLimitModal, setShowLimitModal] = useState<boolean>(false);
  const [isRecentPromptsOpen, setIsRecentPromptsOpen] = useState<boolean>(false);
  const { recentPrompts, addPrompt, removePrompt, clearAll } = useRecentPrompts();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const playSoundtrack = (genre: string) => {
    const soundtrack = soundtrackMap[genre];
    if (!soundtrack) return;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    const audio = new Audio(soundtrack);
    audio.loop = true;
    audio.volume = 0.3;
    audio.play().catch(err => console.log("Audio playback failed:", err));
    audioRef.current = audio;
  };

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    if (isGenerationInProgressRef.current) return;

    if (!login && guestRequestCount >= 3) {
      setShowLimitModal(true);
      return;
    }

    if (!data.prompt.trim()) return toast.error("Please enter a prompt to generate a story.");
    if (getWordCount(data.prompt) < 10) return toast.error("Please enter a prompt with at least 10 words.");

    isGenerationInProgressRef.current = true;
    setLoading(true);

    try {
      const payload = {
        prompt: selectedGenre ? `[Genre: ${selectedGenre}] ${data.prompt}` : data.prompt,
        wordLength: selectedLength === "short" ? 175 : selectedLength === "long" ? 800 : 450,
        language: selectedLanguage,
        tone: selectedTone || undefined,
      };
      const generationRequest = login ? generateModel(payload) : generateFreeModel(payload);
      activeGenerationRef.current = generationRequest as any;
      const res = await generationRequest.unwrap();

      if (res) {
        toast.success(res.message);
        addPrompt(data.prompt);
        setStories(res.data as IStories[]);
        setTextareaValue("");
        setValue("prompt", "");
        if (!login) {
          const newCount = guestRequestCount + 1;
          setGuestRequestCount(newCount);
        }
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      activeGenerationRef.current = null;
      isGenerationInProgressRef.current = false;
      setLoading(false);
    }
  };

  const isOverLimit = textareaValue.length >= MAX_PROMPT_LENGTH;
  const isNearLimit = textareaValue.length >= MAX_PROMPT_LENGTH * WARN_THRESHOLD;

  useKeyboardShortcuts({
    onOpenHelp: () => setShowHelpModal(true),
    onCloseHelp: () => setShowHelpModal(false),
    onGenerate: () => {
      const form = document.getElementById("story-form") as HTMLFormElement;
      if (form) form.requestSubmit();
    },
    onPublish: () => document.getElementById("publish-story-btn")?.click(),
    focusPrompt: () => inputRef.current?.focus(),
    hasStory: stories.length > 0,
  });

  return (
    <div className="min-h-screen bg-white text-slate-900 transition-colors duration-300 dark:bg-[#0b1329] dark:text-white pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header Logic */}
        <div className="py-6 flex justify-between items-center">
          <Link to="/">
            <div className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded text-sm dark:bg-white/10 dark:hover:bg-white/20">
              <i className="fa-solid fa-left-long"></i> Back
            </div>
          </Link>

          <div className="text-right">
            <button className="bg-gray-100 px-4 py-2 rounded text-sm dark:bg-white/10">
              <span className="text-gray-500">Per Month</span> {getRequestLimit(userRole?.subscriptionType as string)}
              <Link to="/pricing" className="ml-2 pl-2 border-l border-gray-300 text-indigo-500 font-semibold">Upgrade</Link>
            </button>
            <p className="text-xs text-gray-500 mt-2">Requests: {login ? data?.requestsThisMonth ?? 0 : guestRequestCount}</p>
          </div>
        </div>

        {/* Main Interface */}
        <div className="mt-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-center mb-10">
            ✨ Turn Your Ideas Into <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">Amazing Stories</span> ✨
          </h1>

          <div className="max-w-4xl mx-auto bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-gray-200 dark:border-white/10">
            <form id="story-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">

              {/* Controls */}
              <div className="flex flex-wrap gap-2">
                {GENRES.map((g) => (
                  <button
                    key={g.value} type="button"
                    onClick={() => { setSelectedGenre(g.value); playSoundtrack(g.value); }}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${selectedGenre === g.value ? "bg-indigo-500 text-white" : "bg-white/5 text-gray-500 hover:bg-white/10"}`}
                  >
                    {g.icon} {g.name}
                  </button>
                ))}
              </div>

              <TonePicker selected={selectedTone} onChange={setSelectedTone} />

              {/* Textarea */}
              <div className="relative">
                <textarea
                  {...register("prompt")}
                  ref={(e) => { register("prompt").ref(e); inputRef.current = e; }}
                  value={textareaValue}
                  onChange={(e) => setTextareaValue(e.target.value)}
                  maxLength={MAX_PROMPT_LENGTH}
                  className={`w-full h-40 bg-transparent border-none outline-none resize-none text-lg p-4 focus:ring-0 ${isOverLimit ? 'ring-1 ring-red-500' : ''}`}
                  placeholder="Every great story begins with a single idea. What's yours?"
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); e.currentTarget.closest("form")?.requestSubmit(); } }}
                />

                <div className="absolute bottom-4 right-4 flex items-center gap-4">
                  <span className={`text-xs ${isOverLimit ? 'text-red-500' : 'text-gray-400'}`}>
                    {textareaValue.length} / {MAX_PROMPT_LENGTH}
                  </span>
                  <button type="submit" disabled={loading || isOverLimit} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50 transition">
                    {loading ? "Generating..." : "Generate"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {loading && <StoryGeneratingAnimation onCancel={() => activeGenerationRef.current?.abort()} />}

        <StoriesViewComponent
          stories={filteredStories}
          isLogin={login}
          setStories={setStories}
          onPublishSuccess={() => setTextareaValue("")}
          isLoading={loading}
        />

      </div>
      <Toaster position="top-right" />
    </div>
  );
};

export default StoriesComponent;