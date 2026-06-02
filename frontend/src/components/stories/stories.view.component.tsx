import React, { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import jsPDF from "jspdf";

import { getShortenedText, ITopicData, topicsData, getWordCount, SELECTED_TOPIC_CLASSES } from "./stories.utils";
import { useCreatePostMutation, useDeletePostMutation } from "../../redux/apis/post.api";
import { useGetProfileInfoQuery } from "../../redux/apis/user.api";
import { setStory } from "../../redux/slices/storySlice";
import {
  useGenerateAlternateEndingsMutation,
  useGenerateFreeAlternateEndingsMutation,
} from "../../redux/apis/ai.model.api";

import StoryWorldMap from "../story-map/StoryWorldMap";
import BookmarkButton from "../BookmarkButton";
import logo from "../../assets/logoNew.png";
import StoryGeneratingAnimation from "../loading/story-generating-animation.component";
import AudioPlayer, { type AudioPlayerHandle, type NarrationPlaybackState } from "../AudioPlayer";
import ContinueStoryButton from "../story/ContinueStoryButton";
import StoryTradingCard from "../cards/StoryTradingCard";
import CardCollection from "../cards/CardCollection";
import StoryCoverImage from "./StoryCoverImage";
import ImageFallback from "../ImageFallback";
import { Post } from "../../models/post";

// ─── Main Interfaces ─────────────────────────────────────────────────────────

export interface IStories {
  uuid: string;
  title: string;
  content: string;
  tag: string;
  imageURL: string;
  language?: string;
  enhancedPrompt?: string;
}

interface IRelatedStoriesComponentProps {
  posts: Post[];
  currentPostId: string;

  // Props added below to prevent "undefined" crashes based on your snippet
  selectedStory?: IStories | null;
  stories?: IStories[];
  handelStorySelection?: (story: IStories) => void;
  handleCopyStory?: () => void;
  isCopied?: boolean;
  handleExportPDF?: () => void;
  handleExportMarkdown?: () => void;
  handleShareStory?: (platform: string) => void;
  setShowWorldMap?: (show: boolean) => void;
  setShowRemix?: (show: boolean) => void;
  loading?: boolean;
  handelPublishStory?: () => void;
  sentenceSegments?: any[];
  isNarrationActive?: boolean;
  narrationWordIndex?: number;
  audioPlayerRef?: React.RefObject<AudioPlayerHandle>;
  setNarrationWordIndex?: (index: number) => void;
  setNarrationState?: (state: NarrationPlaybackState) => void;
}

const RelatedStoriesComponent: React.FC<IRelatedStoriesComponentProps> = ({
  posts,
  currentPostId,
  selectedStory,
  stories,
  handelStorySelection = () => { },
  handleCopyStory = () => { },
  isCopied = false,
  handleExportPDF = () => { },
  handleExportMarkdown = () => { },
  handleShareStory = () => { },
  setShowWorldMap = () => { },
  setShowRemix = () => { },
  loading = false,
  handelPublishStory = () => { },
  sentenceSegments = [],
  isNarrationActive = false,
  narrationWordIndex = 0,
  audioPlayerRef,
  setNarrationWordIndex = () => { },
  setNarrationState = () => { },
}) => {
  const navigate = useNavigate();
  const filteredPosts = posts?.filter((post) => post._id !== currentPostId) || [];

  return (
    <div className="mt-16 px-4 sm:px-6 lg:px-8 max-w-8xl mx-auto pb-10">
      <style>
        {`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up {
            animation: fadeInUp 0.6s ease-out forwards;
          }
        `}
      </style>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in-up">

        {/* ─── Main Story View ─── */}
        {selectedStory && (
          <div className="col-span-1 lg:col-span-8 flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-blue-400 mb-2">
                  {selectedStory.title}
                </h1>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-full bg-purple-900/60 text-purple-300 border border-purple-700/50 py-1 px-3 text-xs font-semibold">
                    🎭 {selectedStory.tag}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-blue-900/60 text-blue-300 border border-blue-700/50 py-1 px-3 text-xs font-semibold">
                    🌐 {selectedStory.language || "English"}
                  </span>
                </div>
              </div>
              <div className="flex justify-start sm:justify-end">
                <div className="flex -space-x-5">
                  {stories && stories.length > 0 && (
                    stories.map((story) => (
                      <button
                        key={story.uuid}
                        className={`relative w-16 h-16 rounded-full border-2 ${selectedStory.uuid === story.uuid
                            ? "border-blue-500 scale-110"
                            : "border-white"
                          } hover:scale-110 transition-transform duration-200 focus:outline-none`}
                        onClick={() => handelStorySelection(story)}
                      >
                        <ImageFallback
                          src={story.imageURL}
                          alt={story.title}
                          className="w-full h-full object-cover rounded-full"
                        />
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute bottom-[-50px] left-[-50px] w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <h3 className="text-xl font-bold text-slate-200 relative z-10">
                  Generated Story
                </h3>
                <div className="flex flex-wrap items-center gap-2 relative z-10">
                  <button
                    type="button"
                    className="rounded-lg px-4 py-2 bg-slate-700 text-slate-200 font-semibold cursor-pointer hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleCopyStory}
                  >
                    {isCopied ? "✓ Copied" : "📋 Copy"}
                  </button>
                  <button
                    type="button"
                    className="rounded-lg px-4 py-2 bg-purple-700 text-slate-200 font-semibold cursor-pointer hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleExportPDF}
                  >
                    📄 Export PDF
                  </button>
                  <button
                    type="button"
                    className="rounded-lg px-4 py-2 bg-indigo-700 text-slate-200 font-semibold cursor-pointer hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleExportMarkdown}
                  >
                    ⬇️ Export Markdown
                  </button>
                  <button type="button" className="rounded-lg px-4 py-2 bg-pink-600 text-slate-200 font-semibold cursor-pointer hover:bg-pink-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" onClick={() => handleShareStory("twitter")}>
                    🐦 Share
                  </button>
                  <button type="button" className="rounded-lg px-4 py-2 bg-violet-700 text-slate-200 font-semibold cursor-pointer hover:bg-violet-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" onClick={() => setShowWorldMap(true)}>
                    🗺️ World Map
                  </button>
                  <button type="button" className="rounded-lg px-4 py-2 bg-fuchsia-700 text-slate-200 font-semibold cursor-pointer hover:bg-fuchsia-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" onClick={() => setShowRemix(true)}>
                    🔀 Remix
                  </button>
                  <button
                    type="button"
                    id="publish-story-btn"
                    className={`rounded-lg px-5 py-2 font-semibold flex items-center space-x-2 cursor-pointer bg-blue-600 text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${loading ? "" : "hover:bg-blue-500 hover:shadow-lg active:scale-95"
                      }`}
                    onClick={handelPublishStory}
                    disabled={loading}
                  >
                    {loading ? "Publishing..." : "Publish"}
                  </button>
                </div>
              </div>

              {selectedStory.enhancedPrompt && (
                <div className="mb-6 p-4 bg-indigo-900/30 border border-indigo-700/50 rounded-xl relative z-10">
                  <h4 className="text-sm font-semibold text-indigo-300 mb-2 flex items-center gap-2">
                    <i className="fas fa-wand-magic-sparkles"></i> AI Enhanced Prompt
                  </h4>
                  <p className="text-slate-300 text-sm italic break-words whitespace-pre-wrap">{selectedStory.enhancedPrompt}</p>
                </div>
              )}

              <div id="story-content" className="prose prose-invert max-w-none text-slate-300 leading-relaxed tracking-wide relative z-10">
                <p className="break-words whitespace-pre-wrap">
                  {sentenceSegments.length > 0 ? (
                    sentenceSegments.map((segment) => {
                      const isActiveSentence =
                        isNarrationActive &&
                        narrationWordIndex >= segment.startWordIndex &&
                        narrationWordIndex <= segment.endWordIndex;

                      const rawParts = segment.text.split(/(\s+)/);
                      let wordOffset = 0;

                      return (
                        <span
                          key={segment.id}
                          className={isActiveSentence ? "transition-colors duration-300 text-slate-100" : undefined}
                        >
                          {rawParts.map((part: string, partIdx: number) => {
                            if (part === "") return null;
                            if (/^\s+$/.test(part)) return part;

                            const absoluteWordIndex = segment.startWordIndex + wordOffset;
                            wordOffset++;

                            const isActiveWord = isNarrationActive && narrationWordIndex === absoluteWordIndex;

                            return isActiveWord ? (
                              <span key={partIdx} className="bg-indigo-500/20 text-indigo-300 rounded px-0.5 transition-all duration-150">
                                {part}
                              </span>
                            ) : (
                              <span key={partIdx}>{part}</span>
                            );
                          })}
                        </span>
                      );
                    })
                  ) : (
                    (() => {
                      const rawParts = selectedStory.content.split(/(\s+)/);
                      let wordOffset = 0;
                      return rawParts.map((part, partIdx) => {
                        if (part === "") return null;
                        if (/^\s+$/.test(part)) return part;

                        const absoluteWordIndex = wordOffset;
                        wordOffset++;
                        const isActiveWord = isNarrationActive && narrationWordIndex === absoluteWordIndex;

                        return isActiveWord ? (
                          <span key={partIdx} className="bg-indigo-500/20 text-indigo-300 rounded px-0.5 transition-all duration-150">
                            {part}
                          </span>
                        ) : (
                          <span key={partIdx}>{part}</span>
                        );
                      });
                    })()
                  )}
                </p>
              </div>

              {/* Notice how the AudioPlayer now correctly has a closing tag "/>" */}
              <div className="relative z-10 mt-6">
                <AudioPlayer
                  ref={audioPlayerRef}
                  text={selectedStory.content}
                  title={selectedStory.title}
                  onWordIndexChange={setNarrationWordIndex}
                  onPlaybackStateChange={setNarrationState}
                />
              </div>
            </div>
          </div>
        )}

        {/* ─── Related Stories Grid ─── */}
        <div className="col-span-1 lg:col-span-4 flex flex-col mt-12 lg:mt-0">
          <h3 className="text-xl font-bold text-slate-200 mb-6">Related Stories</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post: Post) => (
                <div
                  onClick={() => navigate(`/post/${post._id}`)}
                  key={post._id}
                  className="cursor-pointer bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden group flex flex-col h-full"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={post.imageURL}
                      alt="Related Story"
                      className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-60 pointer-events-none"></div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-slate-200 truncate">{post.title}</h4>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-500 py-8">No related stories found.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default RelatedStoriesComponent;