import React, { useState } from "react";
import { useCreateReviewMutation } from "../../../redux/apis/review.api";

const ratingLabels = ["", "Poor", "Fair", "Good", "Great", "Excellent"];

const StarRating = ({
  rating,
  setRating,
}: {
  rating: number;
  setRating: (n: number) => void;
}) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className={`text-3xl transition-all duration-150 hover:scale-125 focus:outline-none ${star <= (hovered || rating)
                ? "text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.7)]"
                : "text-gray-400 dark:text-gray-600"
              }`}
            aria-label={`Rate ${star} star`}
          >
            ★
          </button>
        ))}
      </div>
      {(hovered || rating) > 0 && (
        <p className="text-xs font-semibold text-yellow-500 tracking-wide">
          {ratingLabels[hovered || rating]}
        </p>
      )}
    </div>
  );
};

const ReviewForm = () => {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const [createReview, { isLoading }] = useCreateReviewMutation();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!role.trim()) newErrors.role = "Role is required";
    if (!feedback.trim()) newErrors.feedback = "Review is required";
    if (feedback.length > 500) newErrors.feedback = "Max 500 characters";
    if (rating === 0) newErrors.rating = "Please select a rating";
    return newErrors;
  };

  const handleSubmit = async () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    try {
      await createReview({ name, role, feedback, rating, imgSrc: "" }).unwrap();
      setSuccess(true);
      setName("");
      setRole("");
      setFeedback("");
      setRating(0);
      setErrors({});
    } catch {
      setErrors({ submit: "Failed to submit review. Please try again." });
    }
  };

  return (
    <div className="mt-12 max-w-2xl mx-auto bg-slate-50 dark:bg-blue-900/10 p-8 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
        Share Your Experience
      </h3>

      {success && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 rounded-xl text-sm">
          🎉 Thank you! Your review has been submitted for approval.
        </div>
      )}

      {errors.submit && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-sm">
          ⚠️ {errors.submit}
        </div>
      )}

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition"
            placeholder="Your name"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
            Role <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition"
            placeholder="e.g. Fantasy Writer"
          />
          {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
            Review <span className="text-red-500">*</span>
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
            maxLength={500}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"
            placeholder="Tell us what you think..."
          />
          <p className="text-xs text-slate-500 mt-1 text-right">{feedback.length}/500</p>
          {errors.feedback && <p className="text-red-500 text-xs mt-1">{errors.feedback}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
            Rating <span className="text-red-500">*</span>
          </label>
          <StarRating rating={rating} setRating={setRating} />
          {errors.rating && <p className="text-red-500 text-xs mt-1">{errors.rating}</p>}
        </div>

        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition shadow-lg shadow-indigo-500/20"
        >
          {isLoading ? "Submitting..." : "Submit Review ✨"}
        </button>
      </div>
    </div>
  );
};

export default ReviewForm;