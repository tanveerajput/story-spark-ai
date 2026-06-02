<<<<<<< HEAD
import { useState } from "react";
import { Link } from "react-router-dom";
import { isLoggedIn } from "../../../services/auth.service";
import { useToggleFollowMutation } from "../../../redux/apis/user.api";
import ImageFallback from "../../ImageFallback";
=======
﻿import React, { useState } from "react";
import { Link } from "react-router-dom";
import { isLoggedIn } from "../../../services/auth.service";
import { useToggleFollowMutation } from "../../../redux/apis/user.api";
>>>>>>> e32052672baa705d7f5929f0f6d4afddd09e38dc

const RecommendedWritersComponent = () => {
  const recommendedWriters = [
    { id: "roni-sarkar-id", name: "Roni Sarkar", role: "AI Writer", image: "https://avatars.githubusercontent.com/u/76697055?v=4" },
    { id: "sarah-lee-id", name: "Sarah Lee", role: "Content Creator", image: "https://i.pravatar.cc/150?img=5" },
    { id: "john-doe-id", name: "John Doe", role: "Story Writer", image: "https://i.pravatar.cc/150?img=8" },
  ];

  const [following, setFollowing] = useState<number[]>([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [toggleFollowMutation, { isLoading }] = useToggleFollowMutation();

  const toggleFollow = async (index: number, authorId: string) => {
    if (!isLoggedIn()) {
      setShowLoginModal(true);
      return;
    }
    try {
      await toggleFollowMutation({ userId: authorId }).unwrap();
      setFollowing(prev => prev.includes(index) ? prev.filter(id => id !== index) : [...prev, index]);
    } catch (error) {
      console.error("Failed to toggle follow:", error);
    }
  };

  return (
    <>
      <section className="bg-blue-50 dark:bg-blue-500/10 rounded-lg shadow-sm border border-blue-100 dark:border-transparent p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-gray-300 mb-4">Recommended Writers</h3>
        <div className="space-y-4">
          {recommendedWriters.map((writer, index) => (
            <div key={writer.id} className="flex items-center justify-between">
              <div className="flex items-center">
<<<<<<< HEAD
                <ImageFallback
=======
                <img
                  className="h-10 w-10 rounded-full"
>>>>>>> e32052672baa705d7f5929f0f6d4afddd09e38dc
                  src={writer.image}
                  alt={writer.name}
                  className="h-10 w-10 rounded-full object-cover border border-slate-200 dark:border-transparent"
                />

                <div className="ml-3">
                  <p className="text-sm font-medium text-slate-700 dark:text-gray-400">{writer.name}</p>
                  <p className="text-xs text-slate-500 dark:text-gray-500">{writer.role}</p>
                </div>
              </div>
<<<<<<< HEAD
              <button
                disabled={isLoading}
                onClick={() => toggleFollow(index, writer.id)}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-colors disabled:opacity-50 ${following.includes(index) ? "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white" : "bg-indigo-600 text-white hover:bg-indigo-700"
                  }`}
=======

              <button
                onClick={() => toggleFollow(index, writer.id)}
                disabled={isLoading}
                className="!rounded-button text-indigo-600 text-sm font-medium hover:text-indigo-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
>>>>>>> e32052672baa705d7f5929f0f6d4afddd09e38dc
              >
                {following.includes(index) ? "Following" : "Follow"}
              </button>
            </div>
          ))}
        </div>
      </section>

      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-gray-200 mb-4">Authentication Required</h3>
              <p className="text-slate-600 dark:text-gray-400 mb-6">You need to log in to follow writers.</p>
              <div className="flex flex-col gap-3">
                <Link to="/login" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold">Log In</Link>
                <button onClick={() => setShowLoginModal(false)} className="text-slate-500 py-2">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default RecommendedWritersComponent;