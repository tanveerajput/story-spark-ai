import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { connectSocket } from "../../socket/socket.oi";
import { isLoggedIn, getUserInfo } from "../../services/auth.service";
import { io, Socket } from "socket.io-client";

interface Participant {
  userId: string;
  username: string;
  color: string;
  socketId: string;
}

interface StoryChunk {
  authorId: string;
  authorName: string;
  color: string;
  text: string;
  isAI: boolean;
  timestamp: Date;
}

interface Room {
  roomId: string;
  createdBy: string;
  participants: Participant[];
  story: StoryChunk[];
  createdAt: Date;
}

export default function CollabRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newText, setNewText] = useState("");
  const user = getUserInfo();

  const collabSocketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }

    try {
      const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
      const collabSocket = io(`${socketUrl}/collab`, {
        transports: ["websocket"]
      });

      collabSocketRef.current = collabSocket;

      collabSocket.emit("collab:get_room", { roomId }, (response: any) => {
        if (response && response.room) {
          setRoom(response.room);
          setError(null);
        } else {
          setError("Room not found");
        }
        setLoading(false);
      });

      const handleRoomUpdated = (data: any) => {
        if (data && data.room) {
          setRoom(data.room);
        }
      };

      const handleStoryUpdated = (data: any) => {
        if (data && data.story) {
          setRoom((prev) => (prev ? { ...prev, story: data.story } : null));
        }
      };

      collabSocket.on("collab:room_updated", handleRoomUpdated);
      collabSocket.on("collab:story_updated", handleStoryUpdated);
      collabSocket.on("collab:error", (data: any) => {
        setError(data.message);
        setLoading(false);
      });

      return () => {
        collabSocket.off("collab:room_updated", handleRoomUpdated);
        collabSocket.off("collab:story_updated", handleStoryUpdated);
        collabSocket.disconnect();
      };
    } catch (err) {
      console.error("Collab error:", err);
      setError("Failed to initialize collaboration");
      setLoading(false);
    }
  }, [roomId, navigate]);

  const handleAddText = () => {
    if (!newText.trim() || !user) return;

    if (collabSocketRef.current) {
      collabSocketRef.current.emit("collab:add_text", {
        roomId,
        userId: user.userId,
        text: newText,
      });
      setNewText("");
    }
  };

  const handleAIContinue = () => {
    if (collabSocketRef.current) {
      collabSocketRef.current.emit("collab:ai_continue", { roomId });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0d0d14] dark:text-white flex items-center justify-center px-4 transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading collaboration room...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0d0d14] dark:text-white flex items-center justify-center px-4 transition-colors duration-300">
        <div className="text-center max-w-md">
          <p className="text-red-500 dark:text-red-400 text-lg mb-2">Error</p>
          <p className="text-slate-600 dark:text-white/60 text-sm mb-6">{error}</p>
          <button
            type="button"
            onClick={() => navigate("/collab")}
            className="text-indigo-600 dark:text-indigo-400 underline"
          >
            Back to collab home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0d0d14] dark:text-white flex justify-center px-4 py-8 transition-colors duration-300">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Story Content */}
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 p-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">Room: {roomId}</h1>
              <button
                type="button"
                onClick={() => navigate("/collab")}
                className="text-sm text-indigo-600 dark:text-indigo-400 underline"
              >
                Leave
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 min-h-64 max-h-[500px] overflow-y-auto mb-4 border border-slate-200 dark:border-white/5">
              {room?.story && room.story.length > 0 ? (
                <div className="space-y-3">
                  {room.story.map((chunk, idx) => (
                    <div key={idx} className="text-sm leading-relaxed">
                      <span style={{ color: chunk.color }} className="font-semibold mr-2">
                        {chunk.authorName}:
                      </span>
                      <span className="text-slate-700 dark:text-slate-300">{chunk.text}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-center mt-20">Story is empty. Start writing!</p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddText()}
                placeholder="Add your story text..."
                className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-xl focus:outline-none focus:border-indigo-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddText}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors whitespace-nowrap"
                >
                  Add
                </button>
                <button
                  onClick={handleAIContinue}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors whitespace-nowrap"
                >
                  AI ✨
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Participants Sidebar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 p-6 h-fit sticky top-24">
          <h2 className="text-lg font-bold mb-4 border-b border-slate-200 dark:border-white/10 pb-2">
            Participants ({room?.participants?.length || 0})
          </h2>
          <div className="space-y-2">
            {room?.participants?.map((p) => (
              <div
                key={p.userId}
                className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-white/5 rounded-xl flex items-center gap-3 shadow-sm"
              >
                <div
                  className="w-4 h-4 rounded-full shadow-inner"
                  style={{ backgroundColor: p.color }}
                ></div>
                <span className="text-sm font-medium">{p.username}</span>
                {p.userId === user?.userId && (
                  <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-500 dark:text-slate-400 ml-auto">
                    You
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}