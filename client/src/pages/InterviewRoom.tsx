import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Camera,
  CameraOff,
  ChartNoAxesCombined,
  Check,
  Copy,
  DoorOpen,
  Expand,
  Hand,
  MessagesSquare,
  Mic,
  MicOff,
  Pause,
  Play,
  Radio,
  Send,
  Settings,
  Share2,
  Smile,
  Volume2,
  VolumeX,
  Users,
  Video,
  Wifi,
  Home,
  LayoutDashboard,
  LogOut,
  Lock,
  ShieldCheck,
  UserCheck,
  SlidersHorizontal,
  Clipboard,
  Trash2,
} from "lucide-react";
import { API } from "../api";
import { useToast } from "../contexts/ToastContext";
import { useAuth } from "../contexts/AuthContext";
import { useSettings } from "../contexts/SettingsContext";
import UserAvatar from "../components/common/UserAvatar";
import { getStoredUser, resolveAvatarSrc } from "../lib/avatar";

type InterviewQuestion = string | { text?: string; question?: string };

type AnswerFeedback = {
  score: number;
  fb: string;
};

type MediaStatus = "idle" | "loading" | "ready" | "camera-denied" | "mic-denied" | "error";

type PanelType = "participants" | "chat" | "analytics" | "transcript" | "settings";

type Participant = {
  id: string;
  userId: string;
  name: string;
  avatar?: string | null;
  isHost: boolean;
  joinedAt: number;
  micOn: boolean;
  cameraOn: boolean;
  handRaised: boolean;
  isScreenSharing: boolean;
  reaction: string | null;
  micBlockedByHost: boolean;
  cameraBlockedByHost: boolean;
};

type JoinRequest = {
  socketId: string;
  name: string;
  userId: string;
};

type ChatMessage = {
  id: string;
  participantId: string;
  name: string;
  text: string;
  ts: number;
};

type PublicProfilePreview = {
  id: string;
  userId: string;
  name: string;
  avatar: string | null;
  isHost: boolean;
  isYou: boolean;
  micOn: boolean;
  cameraOn: boolean;
  joinedAt: number;
  role: string;
  bio: string;
  skills: string[];
};

type RoomStatePayload = {
  roomId: string;
  locked: boolean;
  examMode: boolean;
  paused?: boolean;
  requireApproval: boolean;
  createdAt: number;
  participants: Participant[];
  joinQueue: JoinRequest[];
  attendance: Array<{ participantId: string; name: string; joinedAt: number; leftAt?: number }>;
  meetingDurationSec: number;
};

type FloatingReaction = {
  id: string;
  emoji: string;
  name: string;
};

function randomRoomId(seed: number): string {
  return `INT-${seed}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function randomPasscode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function formatTimer(value: number): string {
  const mm = Math.floor(value / 60)
    .toString()
    .padStart(2, "0");
  const ss = Math.floor(value % 60)
    .toString()
    .padStart(2, "0");
  return `${mm}:${ss}`;
}

function classifyMediaError(err: unknown): { status: MediaStatus; message: string } {
  if (!err || typeof err !== "object") {
    return { status: "error", message: "Could not start camera and microphone." };
  }
  const e = err as { name?: string; message?: string };
  const name = e.name || "";
  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    return {
      status: "camera-denied",
      message: "Camera or microphone permission denied. Allow access in browser settings and retry.",
    };
  }
  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return {
      status: "error",
      message: "No camera or microphone found. Connect a device and retry.",
    };
  }
  if (name === "NotReadableError" || name === "TrackStartError") {
    return {
      status: "error",
      message: "Camera is busy in another app. Close it there and retry.",
    };
  }
  if (name === "OverconstrainedError") {
    return {
      status: "error",
      message: "Requested video settings are unsupported by this camera.",
    };
  }
  return {
    status: "error",
    message: e.message || "Failed to access camera/microphone.",
  };
}

function ControlIconButton({
  onClick,
  icon,
  label,
  active = false,
  danger = false,
  badge,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  danger?: boolean;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`group relative flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 transition-all duration-200 ${
        danger
          ? "border-red-300/40 bg-red-500/20 text-red-100 hover:bg-red-500/35"
          : active
            ? "border-cyan-300/45 bg-cyan-500/20 text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.25)]"
            : "border-white/15 bg-white/8 text-white/85 hover:border-indigo-300/40 hover:bg-indigo-500/20 hover:text-indigo-100"
      }`}
    >
      {icon}
      {badge && badge > 0 && (
        <span className="absolute -right-1.5 -top-1.5 min-w-5 rounded-full border border-black/40 bg-rose-500 px-1 text-[10px] font-bold text-white">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
      <span className="pointer-events-none absolute -top-8 rounded bg-black/85 px-2 py-0.5 text-[10px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
        {label}
      </span>
    </button>
  );
}

function MiniTrend({ points, color }: { points: number[]; color: string }) {
  if (points.length < 2) {
    return <div className="h-14 rounded-lg border border-white/8 bg-white/4" />;
  }
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = Math.max(1, max - min);
  const path = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * 100;
      const y = 100 - ((p - min) / range) * 100;
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 100" className="h-14 w-full rounded-lg border border-white/8 bg-white/4 p-1">
      <path d={path} fill="none" stroke={color} strokeWidth="2.8" strokeLinecap="round" />
    </svg>
  );
}

function VideoTile({
  stream,
  name,
  avatar,
  isHost,
  micOn,
  cameraOn,
  handRaised,
  reaction,
  isActiveSpeaker,
  muted = false,
  className,
}: {
  stream: MediaStream | null;
  name: string;
  avatar?: string | null;
  isHost: boolean;
  micOn: boolean;
  cameraOn: boolean;
  handRaised: boolean;
  reaction: string | null;
  isActiveSpeaker: boolean;
  muted?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    ref.current.srcObject = stream;
    ref.current.muted = muted;
    ref.current.volume = muted ? 0 : 1;
    ref.current.playsInline = true;
    void ref.current.play().catch(() => undefined);
  }, [muted, stream]);

  return (
    <div
      className={`relative overflow-hidden border ${className || ""}`}
      style={{
        borderColor: isActiveSpeaker ? "rgba(34,197,94,0.8)" : "rgba(255,255,255,0.12)",
        boxShadow: isActiveSpeaker ? "0 0 0 2px rgba(16,185,129,0.22), 0 10px 28px rgba(0,0,0,0.28)" : "0 8px 22px rgba(0,0,0,0.24)",
        backgroundColor: "#0A0A10",
      }}
    >
      {cameraOn ? (
        <video ref={ref} autoPlay playsInline muted={muted} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full min-h-45 w-full items-center justify-center bg-[#0E1020]">
          <UserAvatar src={avatar} name={name} size={64} speaking={isActiveSpeaker} online />
        </div>
      )}

      <div className="absolute left-3 top-3 flex items-center gap-2">
        {isHost && (
          <span className="rounded-full border border-amber-300/50 bg-amber-300/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-200">
            Host
          </span>
        )}
        {handRaised && (
          <span className="flex items-center gap-1 animate-pulse rounded-full border border-indigo-300/60 bg-indigo-500/30 px-2 py-0.5 text-[11px] font-bold text-indigo-100 shadow">
            <Hand className="h-3.5 w-3.5" /> Hand Raised
          </span>
        )}
      </div>

      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 rounded-lg bg-black/45 px-2.5 py-1 text-xs font-semibold text-white/95 backdrop-blur-sm">
          <UserAvatar src={avatar} name={name} size={24} speaking={isActiveSpeaker} online />
          <span>{name}</span>
          {isHost && <span className="text-[10px] font-bold uppercase tracking-wide text-amber-200">Host</span>}
        </div>
        <div className="flex items-center gap-2">
          <span
            className="rounded-lg px-2 py-1 text-[11px] font-semibold"
            style={{ backgroundColor: micOn ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.28)", color: micOn ? "#86efac" : "#fca5a5" }}
          >
            {micOn ? "Mic On" : "Mic Off"}
          </span>
          <span
            className="rounded-lg px-2 py-1 text-[11px] font-semibold"
            style={{ backgroundColor: cameraOn ? "rgba(99,102,241,0.25)" : "rgba(148,163,184,0.25)", color: cameraOn ? "#c7d2fe" : "#e2e8f0" }}
          >
            {cameraOn ? "Cam On" : "Cam Off"}
          </span>
          {reaction && <span className="rounded-lg bg-black/45 px-2 py-1 text-lg leading-none">{reaction}</span>}
        </div>
      </div>

      {isActiveSpeaker && (
        <div className="pointer-events-none absolute inset-x-3 bottom-2">
          <div className="h-1.5 overflow-hidden rounded-full bg-emerald-500/20">
            <motion.div
              className="h-full rounded-full bg-emerald-300"
              initial={{ width: "18%" }}
              animate={{ width: ["18%", "72%", "38%", "86%", "44%"] }}
              transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function InterviewRoom() {
  const { id } = useParams();
  const routeToken = (id || "").trim();
  const interviewIdCandidate = Number(routeToken);
  const isInterviewRoute = Number.isFinite(interviewIdCandidate) && /^\d+$/.test(routeToken) && interviewIdCandidate > 0;
  const interviewId = isInterviewRoute ? interviewIdCandidate : 0;
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { user: authUser } = useAuth();
  const { settings } = useSettings();
  const [storedUser, setStoredUser] = useState(() => getStoredUser());

  useEffect(() => {
    const syncUser = () => setStoredUser(getStoredUser());
    window.addEventListener("auth-change", syncUser);
    return () => window.removeEventListener("auth-change", syncUser);
  }, []);

  const activeUser = authUser || storedUser;
  const displayName = activeUser?.name?.trim() || "Candidate";
  const userAvatar = useMemo(
    () => resolveAvatarSrc({ avatar: settings.account.avatar }) || resolveAvatarSrc(activeUser),
    [settings.account.avatar, activeUser]
  );
  const userId = activeUser?.id != null ? String(activeUser.id) : "anon";

  const initialQuestions = (location.state as { questions?: InterviewQuestion[] } | null)?.questions || null;
  const [questions, setQuestions] = useState<InterviewQuestion[] | null>(initialQuestions);
  const [loading, setLoading] = useState(!initialQuestions);
  const [error, setError] = useState("");
  const [connectionState, setConnectionState] = useState<"connecting" | "connected" | "failed">("connecting");
  const [retryKey, setRetryKey] = useState(0);

  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [questionAnswers, setQuestionAnswers] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<AnswerFeedback | null>(null);
  const [scores, setScores] = useState<number[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [showFinalSubmitModal, setShowFinalSubmitModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [showReactionMenu, setShowReactionMenu] = useState(false);

  const [mediaStatus, setMediaStatus] = useState<MediaStatus>("idle");
  const [mediaError, setMediaError] = useState("");
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [monitorLocalAudio, setMonitorLocalAudio] = useState(true);
  const [micBlockedByHost, setMicBlockedByHost] = useState(false);
  const [cameraBlockedByHost, setCameraBlockedByHost] = useState(false);
  const [isReconnectingMedia, setIsReconnectingMedia] = useState(false);

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [joinQueue, setJoinQueue] = useState<JoinRequest[]>([]);
  const [roomLocked, setRoomLocked] = useState(false);
  const [roomRequireApproval, setRoomRequireApproval] = useState(true);
  const [examMode, setExamMode] = useState(false);
  const [roomPaused, setRoomPaused] = useState(false);
  const [meetingDurationSec, setMeetingDurationSec] = useState(0);

  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({});
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [publicProfile, setPublicProfile] = useState<PublicProfilePreview | null>(null);

  const [transcript, setTranscript] = useState<string[]>([]);
  const [silenceSeconds, setSilenceSeconds] = useState(0);
  const [speakingPace, setSpeakingPace] = useState(0);

  const [suspiciousWarnings, setSuspiciousWarnings] = useState<string[]>([]);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [copyPasteAttempts, setCopyPasteAttempts] = useState(0);

  const [panel, setPanel] = useState<PanelType | null>("participants");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(() => window.innerHeight);
  const [isDockVisible, setIsDockVisible] = useState(true);
  const [answerSecondsLeft, setAnswerSecondsLeft] = useState(90);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [localAudioLevel, setLocalAudioLevel] = useState(0);
  const [networkQuality, setNetworkQuality] = useState<"excellent" | "good" | "poor">("good");
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);
  const [trendConfidence, setTrendConfidence] = useState<number[]>([]);
  const [inviteToken, setInviteToken] = useState("");
  const [copiedKey, setCopiedKey] = useState<"invite" | "room" | "pass" | "chat" | "transcript" | null>(null);
  const [selectedVideoDeviceId, setSelectedVideoDeviceId] = useState("");
  const [selectedAudioDeviceId, setSelectedAudioDeviceId] = useState("");
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [availableMics, setAvailableMics] = useState<MediaDeviceInfo[]>([]);
  const [lowBandwidthMode, setLowBandwidthMode] = useState(false);
  const [backgroundBlurEnabled, setBackgroundBlurEnabled] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  const defaultRouteRoomId = isInterviewRoute ? `INT-${interviewId}` : routeToken.toUpperCase();
  const [roomId, setRoomId] = useState(searchParams.get("room") || defaultRouteRoomId);
  const [passcode, setPasscode] = useState(searchParams.get("pass") || "");
  const [inviteLink, setInviteLink] = useState("");
  const [joinPending, setJoinPending] = useState(false);

  const canAutoCreateRoom = useMemo(() => {
    if (!isInterviewRoute) {
      return false;
    }
    const fromCreation = Boolean((location.state as { questions?: InterviewQuestion[]; interviewId?: number } | null)?.questions?.length);
    const hasCachedQuestions = Boolean(localStorage.getItem(`interview_${interviewId}_questions`));
    return fromCreation || hasCachedQuestions;
  }, [interviewId, isInterviewRoute, location.state]);

  const [activeSpeakerIds, setActiveSpeakerIds] = useState<Set<string>>(new Set());
  const dockHideTimerRef = useRef<number | null>(null);

  const selfPublicProfile = useMemo(() => {
    let saved: {
      name?: string;
      role?: string;
      bio?: string;
      skills?: string[];
    } | null = null;
    try {
      saved = JSON.parse(localStorage.getItem("op-profile") || "null");
    } catch {
      saved = null;
    }
    return {
      name: saved?.name || displayName,
      role: saved?.role || "Interview Candidate",
      bio: saved?.bio || "Focused on interview prep and continuous improvement.",
      skills: Array.isArray(saved?.skills) ? saved.skills.slice(0, 10) : [],
      userId,
      avatar: userAvatar,
    };
  }, [displayName, userAvatar, userId]);

  const roomRootRef = useRef<HTMLDivElement | null>(null);
  const answerBoxRef = useRef<HTMLTextAreaElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const screenPreviewRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const remoteStreamsRef = useRef<Map<string, MediaStream>>(new Map());
  const [remoteStreams, setRemoteStreams] = useState<Array<{ participantId: string; stream: MediaStream }>>([]);
  const selfIdRef = useRef<string>("");
  const handStateRef = useRef<Record<string, boolean>>({});
  const typingTimeoutRef = useRef<number | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  const audioMonitorsRef = useRef<Map<string, { ctx: AudioContext; rafId: number; source: MediaStreamAudioSourceNode; analyser: AnalyserNode }>>(new Map());

  const isHost = useMemo(() => participants.some((p) => p.id === selfIdRef.current && p.isHost), [participants]);

  const questionCount = questions?.length || 0;
  const currentQuestionRaw = questions?.[questionIndex] || "";
  const currentQuestionText =
    typeof currentQuestionRaw === "string"
      ? currentQuestionRaw
      : currentQuestionRaw.text || currentQuestionRaw.question || "";
  const isLastQuestion = questionIndex >= Math.max(0, questionCount - 1);
  const answeredCount = questionAnswers.filter((item) => item.trim()).length;

  const confidence = useMemo(() => {
    const base = 74;
    const silencePenalty = Math.min(24, Math.floor(silenceSeconds / 4));
    const warningPenalty = Math.min(20, suspiciousWarnings.length * 2);
    return Math.max(30, Math.min(98, base - silencePenalty - warningPenalty + Math.floor(Math.random() * 8 - 3)));
  }, [silenceSeconds, suspiciousWarnings.length]);

  const eyeContact = useMemo(() => {
    const base = cameraOn ? 88 : 52;
    return Math.max(20, Math.min(99, base + Math.floor(Math.random() * 8 - 4)));
  }, [cameraOn]);

  const aiInterviewScore = useMemo(() => {
    const scoreBase = scores.length ? (scores.reduce((acc, val) => acc + val, 0) / scores.length) * 10 : confidence;
    return Math.max(38, Math.min(98, Math.round((scoreBase + eyeContact + Math.min(100, speakingPace)) / 3)));
  }, [confidence, eyeContact, scores, speakingPace]);

  const fillerWordCount = useMemo(() => {
    const joined = transcript.join(" ").toLowerCase();
    const matches = joined.match(/\b(um+|uh+|like|you know|basically|actually)\b/g);
    return matches?.length || 0;
  }, [transcript]);

  const speakingRatio = useMemo(() => {
    const participantCount = Math.max(1, participants.length);
    return Math.max(10, Math.min(95, Math.round((speakingPace / (participantCount * 18)) * 100)));
  }, [participants.length, speakingPace]);

  const emotionState = useMemo(() => {
    if (confidence >= 80) {
      return "Confident";
    }
    if (confidence >= 62) {
      return "Focused";
    }
    if (confidence >= 48) {
      return "Nervous";
    }
    return "Stressed";
  }, [confidence]);

  const reactionOptions = useMemo(() => ["👍", "👏", "🔥", "😂", "❤️", "💀", "😡", "👻", "😥", "😭", "😴", "🤡", "😻"], []);

  const demoParticipants = useMemo<Participant[]>(() => {
    if (!demoMode) {
      return [];
    }
    return [
      { id: "demo-priya", userId: "demo-priya", name: "Priya M.", avatar: null, isHost: false, joinedAt: Date.now(), micOn: true, cameraOn: true, handRaised: false, isScreenSharing: false, reaction: null, micBlockedByHost: false, cameraBlockedByHost: false },
      { id: "demo-rahul", userId: "demo-rahul", name: "Rahul K.", avatar: null, isHost: false, joinedAt: Date.now(), micOn: false, cameraOn: true, handRaised: false, isScreenSharing: false, reaction: null, micBlockedByHost: false, cameraBlockedByHost: false },
      { id: "demo-panel", userId: "demo-panel", name: "Interview Panel", avatar: null, isHost: false, joinedAt: Date.now(), micOn: true, cameraOn: false, handRaised: false, isScreenSharing: false, reaction: null, micBlockedByHost: false, cameraBlockedByHost: false },
      { id: "demo-ai", userId: "demo-ai", name: "AI Evaluator", avatar: null, isHost: false, joinedAt: Date.now(), micOn: true, cameraOn: false, handRaised: false, isScreenSharing: false, reaction: "🤖", micBlockedByHost: false, cameraBlockedByHost: false },
    ];
  }, [demoMode]);

  const visibleParticipants = useMemo(() => [...participants, ...demoParticipants], [demoParticipants, participants]);

  const addWarning = useCallback((msg: string) => {
    setSuspiciousWarnings((prev) => {
      const next = [msg, ...prev];
      return next.slice(0, 20);
    });
  }, []);

  const playRoomSound = useCallback((type: "join" | "leave") => {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = type === "join" ? 640 : 280;
      gain.gain.value = 0.0001;
      osc.connect(gain);
      gain.connect(ctx.destination);
      const now = ctx.currentTime;
      gain.gain.exponentialRampToValueAtTime(0.05, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.2);
      window.setTimeout(() => {
        ctx.close().catch(() => undefined);
      }, 250);
    } catch {
      undefined;
    }
  }, []);

  const clearAudioMonitors = useCallback(() => {
    audioMonitorsRef.current.forEach((m) => {
      cancelAnimationFrame(m.rafId);
      m.source.disconnect();
      m.analyser.disconnect();
      m.ctx.close().catch(() => undefined);
    });
    audioMonitorsRef.current.clear();
  }, []);

  const watchAudioLevel = useCallback((participantId: string, stream: MediaStream) => {
    if (audioMonitorsRef.current.has(participantId)) {
      return;
    }
    if (stream.getAudioTracks().length === 0) {
      return;
    }

    const ctx = new AudioContext();
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);

    const arr = new Uint8Array(analyser.frequencyBinCount);

    const tick = () => {
      analyser.getByteFrequencyData(arr);
      let sum = 0;
      for (let i = 0; i < arr.length; i += 1) {
        sum += arr[i];
      }
      const avg = sum / arr.length;
      if (participantId === "local") {
        setLocalAudioLevel(Math.min(100, Math.round((avg / 65) * 100)));
      }
      setActiveSpeakerIds((prev) => {
        const next = new Set(prev);
        if (avg > 30) {
          next.add(participantId);
        } else {
          next.delete(participantId);
        }
        return next;
      });
      const rafId = requestAnimationFrame(tick);
      const monitor = audioMonitorsRef.current.get(participantId);
      if (monitor) {
        monitor.rafId = rafId;
      }
    };

    const rafId = requestAnimationFrame(tick);
    audioMonitorsRef.current.set(participantId, { ctx, source, analyser, rafId });
  }, []);

  const updateRemoteStreamsState = useCallback(() => {
    const data = Array.from(remoteStreamsRef.current.entries()).map(([participantId, stream]) => ({ participantId, stream }));
    setRemoteStreams(data);
  }, []);

  const closePeerConnection = useCallback((participantId: string) => {
    const pc = peersRef.current.get(participantId);
    if (pc) {
      pc.ontrack = null;
      pc.onicecandidate = null;
      pc.close();
      peersRef.current.delete(participantId);
    }
    remoteStreamsRef.current.delete(participantId);
    updateRemoteStreamsState();
  }, [updateRemoteStreamsState]);

  const cleanupLocalStream = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) {
      return;
    }
    stream.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
  }, []);

  const syncPeerTracks = useCallback(() => {
    const stream = localStreamRef.current;
    peersRef.current.forEach((pc) => {
      const senders = pc.getSenders();
      const currentVideo = stream?.getVideoTracks()[0] || null;
      const currentAudio = stream?.getAudioTracks()[0] || null;

      const videoSender = senders.find((s) => s.track?.kind === "video");
      const audioSender = senders.find((s) => s.track?.kind === "audio");

      if (videoSender && currentVideo) {
        videoSender.replaceTrack(currentVideo).catch(() => undefined);
      }
      if (audioSender && currentAudio) {
        audioSender.replaceTrack(currentAudio).catch(() => undefined);
      }
    });
  }, []);

  const setTrackEnabled = useCallback((kind: "audio" | "video", enabled: boolean) => {
    const stream = localStreamRef.current;
    if (!stream) {
      return;
    }
    stream.getTracks().forEach((t) => {
      if (t.kind === kind) {
        t.enabled = enabled;
      }
    });
  }, []);

  const startMedia = useCallback(
    async (isRetry = false) => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setMediaStatus("error");
        setMediaError("This browser does not support camera access. Use latest Chrome, Edge, or Firefox.");
        return;
      }

      setMediaStatus("loading");
      setMediaError("");
      if (isRetry) {
        setIsReconnectingMedia(true);
      }

      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasVideoInput = devices.some((d) => d.kind === "videoinput");
        const hasAudioInput = devices.some((d) => d.kind === "audioinput");
        if (!hasVideoInput || !hasAudioInput) {
          setMediaStatus("error");
          setMediaError("Camera or microphone device not found.");
          setIsReconnectingMedia(false);
          return;
        }

        const baseVideo = {
          width: { ideal: lowBandwidthMode ? 640 : 1280 },
          height: { ideal: lowBandwidthMode ? 360 : 720 },
          frameRate: { ideal: lowBandwidthMode ? 15 : 30, max: lowBandwidthMode ? 24 : 60 },
          facingMode: { ideal: "user" },
        };
        const baseAudio = {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        };

        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              ...baseVideo,
              deviceId: selectedVideoDeviceId ? { exact: selectedVideoDeviceId } : undefined,
            },
            audio: {
              ...baseAudio,
              deviceId: selectedAudioDeviceId ? { exact: selectedAudioDeviceId } : undefined,
            },
          });
        } catch (firstErr) {
          const firstError = firstErr as { name?: string };
          const canFallback =
            Boolean(selectedVideoDeviceId || selectedAudioDeviceId) &&
            (firstError?.name === "OverconstrainedError" || firstError?.name === "NotFoundError" || firstError?.name === "DevicesNotFoundError");

          if (!canFallback) {
            throw firstErr;
          }

          setSelectedVideoDeviceId("");
          setSelectedAudioDeviceId("");
          stream = await navigator.mediaDevices.getUserMedia({
            video: baseVideo,
            audio: baseAudio,
          });
        }

        cleanupLocalStream();
        localStreamRef.current = stream;

        stream.getAudioTracks().forEach((t) => {
          t.enabled = micOn;
        });
        stream.getVideoTracks().forEach((t) => {
          t.enabled = cameraOn;
        });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.muted = !monitorLocalAudio;
          localVideoRef.current.volume = monitorLocalAudio ? 1 : 0;
          localVideoRef.current.playsInline = true;
          void localVideoRef.current.play().catch(() => undefined);
        }

        setMediaStatus("ready");
        setIsReconnectingMedia(false);

        watchAudioLevel("local", stream);
        syncPeerTracks();
      } catch (err) {
        const classified = classifyMediaError(err);
        setMediaStatus(classified.status);
        setMediaError(classified.message);
        setIsReconnectingMedia(false);
      }
    },
    [cameraOn, cleanupLocalStream, lowBandwidthMode, micOn, monitorLocalAudio, selectedAudioDeviceId, selectedVideoDeviceId, syncPeerTracks, watchAudioLevel]
  );

  const createPeerConnection = useCallback(
    (peerId: string) => {
      const existing = peersRef.current.get(peerId);
      if (existing) {
        return existing;
      }

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      });

      const localStream = localStreamRef.current;
      if (localStream) {
        localStream.getTracks().forEach((track) => {
          pc.addTrack(track, localStream);
        });
      }

      pc.ontrack = (evt) => {
        const [stream] = evt.streams;
        if (!stream) {
          return;
        }
        remoteStreamsRef.current.set(peerId, stream);
        updateRemoteStreamsState();
        watchAudioLevel(peerId, stream);
      };

      pc.onicecandidate = (evt) => {
        if (!evt.candidate || !socketRef.current) {
          return;
        }
        socketRef.current.emit("webrtc:ice-candidate", {
          roomId,
          to: peerId,
          candidate: evt.candidate,
        });
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "failed" || pc.connectionState === "closed" || pc.connectionState === "disconnected") {
          closePeerConnection(peerId);
        }
      };

      peersRef.current.set(peerId, pc);
      return pc;
    },
    [closePeerConnection, roomId, updateRemoteStreamsState, watchAudioLevel]
  );

  const createOffer = useCallback(
    async (peerId: string) => {
      if (!socketRef.current || !roomId) {
        return;
      }
      try {
        const pc = createPeerConnection(peerId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socketRef.current.emit("webrtc:offer", {
          roomId,
          to: peerId,
          sdp: offer,
        });
      } catch {
        closePeerConnection(peerId);
      }
    },
    [closePeerConnection, createPeerConnection, roomId]
  );

  const joinOrCreateRoom = useCallback(() => {
    if (!socketRef.current || !socketRef.current.connected) {
      return;
    }

    const resolvedRoomId = (searchParams.get("room") || roomId || defaultRouteRoomId || randomRoomId(interviewId || Date.now())).toUpperCase();
    const storedPass = localStorage.getItem(`room_pass_${resolvedRoomId}`) || "";
    const resolvedPasscode = searchParams.get("pass") || passcode || storedPass || (canAutoCreateRoom ? randomPasscode() : "");

    setRoomId(resolvedRoomId);
    if (resolvedPasscode) {
      setPasscode(resolvedPasscode);
    }

    socketRef.current.emit("room:join", {
      roomId: resolvedRoomId,
      passcode: resolvedPasscode,
      name: displayName,
      userId,
      avatar: userAvatar || undefined,
      allowCreateIfMissing: canAutoCreateRoom,
    });
  }, [canAutoCreateRoom, defaultRouteRoomId, displayName, interviewId, passcode, roomId, searchParams, userAvatar, userId]);

  const connectRealtime = useCallback(() => {
    const apiBase = String(API.defaults.baseURL || "http://localhost:4000");
    const socketUrl = new URL(apiBase).origin;

    const socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      selfIdRef.current = socket.id || "";
      toast("Connected to interview room.", "success");
      setConnectionState("connected");
      setError("");
      joinOrCreateRoom();
    });

    socket.on("connect_error", () => {
      setConnectionState("failed");
      setError("Unable to connect to realtime meeting server.");
      toast("Realtime reconnect failed.", "error");
    });

    socket.on("disconnect", () => {
      setConnectionState("connecting");
      toast("Connection lost. Reconnecting...", "info");
    });

    socket.on("room:created", (payload: { roomId: string; passcode: string }) => {
      setRoomId(payload.roomId);
      setPasscode(payload.passcode);
      localStorage.setItem(`room_pass_${payload.roomId}`, payload.passcode);
      setSearchParams({ room: payload.roomId, pass: payload.passcode });
      setJoinPending(false);
      setError("");
    });

    socket.on("room:joined", (payload: { roomId: string; participantId: string }) => {
      selfIdRef.current = payload.participantId;
      setRoomId(payload.roomId);
      setJoinPending(false);
      setError("");
    });

    socket.on("room:join-pending", () => {
      setJoinPending(true);
    });

    socket.on("room:error", (payload: { message?: string }) => {
      const msg = payload?.message || "Failed to join room.";
      if (msg.toLowerCase().includes("room not found") && canAutoCreateRoom && socketRef.current) {
        const recoveredPasscode = passcode || randomPasscode();
        socketRef.current.emit("room:create", {
          roomId: roomId || defaultRouteRoomId || randomRoomId(interviewId || Date.now()),
          passcode: recoveredPasscode,
          name: displayName,
          userId,
          avatar: userAvatar || undefined,
        });
        return;
      }
      setError(msg);
    });

    socket.on("room:state", (payload: RoomStatePayload) => {
      setParticipants(payload.participants || []);
      setJoinQueue(payload.joinQueue || []);
      setRoomLocked(payload.locked);
      setRoomRequireApproval(payload.requireApproval);
      setExamMode(payload.examMode);
      setRoomPaused(Boolean(payload.paused));
      setMeetingDurationSec(payload.meetingDurationSec || 0);
    });

    socket.on("room:paused", (payload: { paused: boolean }) => {
      setRoomPaused(Boolean(payload.paused));
    });

    socket.on("room:participant-joined", (participant: Participant) => {
      if (!participant || participant.id === selfIdRef.current) {
        return;
      }
      setParticipants((prev) => {
        if (prev.some((p) => p.id === participant.id)) {
          return prev;
        }
        return [...prev, participant];
      });
      playRoomSound("join");

      if (selfIdRef.current && selfIdRef.current < participant.id) {
        createOffer(participant.id);
      }
    });

    socket.on("room:participant-left", (payload: { participantId: string }) => {
      setParticipants((prev) => prev.filter((p) => p.id !== payload.participantId));
      closePeerConnection(payload.participantId);
      playRoomSound("leave");
    });

    socket.on("room:participant-updated", (participant: Participant) => {
      const wasRaised = Boolean(handStateRef.current[participant.id]);
      handStateRef.current[participant.id] = Boolean(participant.handRaised);
      setParticipants((prev) => prev.map((p) => (p.id === participant.id ? participant : p)));
      if (participant.id === selfIdRef.current) {
        setMicBlockedByHost(participant.micBlockedByHost);
        setCameraBlockedByHost(participant.cameraBlockedByHost);
      }
      if (!wasRaised && participant.handRaised && participant.id !== selfIdRef.current) {
        toast(`${participant.name} raised hand`, "info");
      }
      if (participant.reaction) {
        const rid = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
        setFloatingReactions((prev) => [...prev, { id: rid, emoji: participant.reaction || "👍", name: participant.name }].slice(-8));
        window.setTimeout(() => {
          setFloatingReactions((prev) => prev.filter((item) => item.id !== rid));
        }, 2400);
      }
    });

    socket.on("room:force-mute", () => {
      setMicOn(false);
      setTrackEnabled("audio", false);
      addWarning("Host muted your microphone.");
    });

    socket.on("room:media-access-updated", (payload: { micBlockedByHost: boolean; cameraBlockedByHost: boolean }) => {
      setMicBlockedByHost(payload.micBlockedByHost);
      setCameraBlockedByHost(payload.cameraBlockedByHost);
      if (payload.micBlockedByHost) {
        setMicOn(false);
        setTrackEnabled("audio", false);
      }
      if (payload.cameraBlockedByHost) {
        setCameraOn(false);
        setTrackEnabled("video", false);
      }
    });

    socket.on("room:removed", () => {
      addWarning("You were removed by host.");
      navigate("/history", { replace: true });
    });

    socket.on("room:ended", () => {
      addWarning("Meeting ended by host.");
      navigate("/history", { replace: true });
    });

    socket.on("chat:new", (msg: ChatMessage) => {
      setChat((prev) => [...prev, msg].slice(-200));
      if (panel !== "chat") {
        setUnreadChatCount((prev) => prev + 1);
      }
    });

    socket.on("chat:typing", (payload: { participantId: string; name: string; typing: boolean }) => {
      setTypingUsers((prev) => {
        const next = { ...prev };
        if (payload.typing) {
          next[payload.participantId] = payload.name;
        } else {
          delete next[payload.participantId];
        }
        return next;
      });
    });

    socket.on("webrtc:offer", async (payload: { from: string; sdp: RTCSessionDescriptionInit }) => {
      try {
        const pc = createPeerConnection(payload.from);
        await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("webrtc:answer", {
          roomId,
          to: payload.from,
          sdp: answer,
        });
      } catch {
        closePeerConnection(payload.from);
      }
    });

    socket.on("webrtc:answer", async (payload: { from: string; sdp: RTCSessionDescriptionInit }) => {
      const pc = peersRef.current.get(payload.from);
      if (!pc) {
        return;
      }
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
      } catch {
        closePeerConnection(payload.from);
      }
    });

    socket.on("webrtc:ice-candidate", async (payload: { from: string; candidate: RTCIceCandidateInit }) => {
      const pc = peersRef.current.get(payload.from);
      if (!pc) {
        return;
      }
      try {
        await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
      } catch {
        closePeerConnection(payload.from);
      }
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [
    addWarning,
    canAutoCreateRoom,
    closePeerConnection,
    createOffer,
    createPeerConnection,
    defaultRouteRoomId,
    displayName,
    interviewId,
    joinOrCreateRoom,
    navigate,
    panel,
    passcode,
    playRoomSound,
    roomId,
    setSearchParams,
    setTrackEnabled,
    toast,
    userId,
    userAvatar,
  ]);

  const toggleFullscreen = useCallback(async () => {
    const root = roomRootRef.current;
    if (!root) {
      return;
    }
    try {
      if (!document.fullscreenElement) {
        await root.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      addWarning("Fullscreen operation was blocked by browser.");
    }
  }, [addWarning]);

  const togglePanel = useCallback(
    (nextPanel: PanelType) => {
      setPanel((prev) => {
        if (isFullscreen && prev === nextPanel) {
          return null;
        }
        return nextPanel;
      });
    },
    [isFullscreen]
  );

  const revealDock = useCallback(() => {
    setIsDockVisible(true);
    if (dockHideTimerRef.current) {
      window.clearTimeout(dockHideTimerRef.current);
    }
    dockHideTimerRef.current = window.setTimeout(() => {
      setIsDockVisible(false);
    }, 2600);
  }, []);

  const keepDockVisible = useCallback(() => {
    setIsDockVisible(true);
    if (dockHideTimerRef.current) {
      window.clearTimeout(dockHideTimerRef.current);
      dockHideTimerRef.current = null;
    }
  }, []);

  const leaveRoomAndExit = useCallback(() => {
    socketRef.current?.disconnect();
    socketRef.current = null;
    navigate("/history");
  }, [navigate]);

  const submitAnswer = useCallback(
    async ({ autoNext = false }: { autoNext?: boolean } = {}) => {
      if (!isInterviewRoute) {
        return;
      }
      if (roomPaused) {
        return;
      }
      if (!questions?.[questionIndex]) {
        return;
      }
      const currentAnswer = (questionAnswers[questionIndex] ?? answer).trim();
      if (!currentAnswer) {
        return;
      }
      const rawQ = questions[questionIndex];
      const question = typeof rawQ === "string" ? rawQ : rawQ.text || rawQ.question || JSON.stringify(rawQ);
      try {
        const res = await API.post(`/api/interview/${interviewId}/answer`, { question, answer: currentAnswer });
        if (!res.data?.success) {
          return;
        }
        setScores((prev) => [...prev, Number(res.data.score) || 0]);
        setFeedback({ score: Number(res.data.score) || 0, fb: String(res.data.feedback || "") });
        if (autoNext) {
          setTimeout(() => {
            setFeedback(null);
            setQuestionIndex((prev) => Math.min((questions?.length || 1) - 1, prev + 1));
          }, 700);
        }
      } catch {
        setError("Failed to submit answer.");
      }
    },
    [answer, interviewId, isInterviewRoute, questionAnswers, questionIndex, questions, roomPaused]
  );

  const endInterview = useCallback(async () => {
    if (!isInterviewRoute) {
      setShowSummary(true);
      return;
    }
    try {
      await API.post(`/api/interview/${interviewId}/end`);
      setShowSummary(true);
    } catch {
      setError("Failed to end interview.");
    }
  }, [interviewId, isInterviewRoute]);

  const handleRetryRoomLoad = useCallback(() => {
    setError("");
    setConnectionState("connecting");
    setLoading(isInterviewRoute);
    setRetryKey((prev) => prev + 1);
  }, [isInterviewRoute]);

  useEffect(() => {
    startMedia();
  }, [retryKey, startMedia]);

  useEffect(() => {
    if (questions?.length) {
      setLoading(false);
      return;
    }

    if (!isInterviewRoute) {
      setQuestions([]);
      setLoading(false);
      return;
    }

    const cachedRaw = localStorage.getItem(`interview_${interviewId}_questions`);
    if (cachedRaw) {
      try {
        const cached = JSON.parse(cachedRaw);
        if (Array.isArray(cached) && cached.length > 0) {
          setQuestions(cached);
          setLoading(false);
        }
      } catch {
        undefined;
      }
    }

    API.get(`/api/interview/${interviewId}`)
      .then((res) => {
        if (!res.data?.id && !Array.isArray(res.data?.questions)) {
          setError("Interview session could not be found.");
          return;
        }
        if (Array.isArray(res.data?.questions) && res.data.questions.length > 0) {
          setQuestions(res.data.questions);
        } else {
          setQuestions([]);
        }
      })
      .catch(() => setError("Failed to load interview."))
      .finally(() => setLoading(false));
  }, [interviewId, isInterviewRoute, questions, retryKey]);

  useEffect(() => {
    const disconnect = connectRealtime();
    return () => {
      if (disconnect) {
        disconnect();
      }
    };
  }, [connectRealtime, retryKey]);

  useEffect(() => {
    const onFullscreenChange = () => {
      const active = !!document.fullscreenElement;
      setIsFullscreen(active);
      if (!active && examMode) {
        addWarning("Fullscreen exited during exam mode.");
      }
    };

    const onKeyDown = (evt: KeyboardEvent) => {
      if (evt.key === "Escape") {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => undefined);
          return;
        }
        if (!showInviteModal && !showLeaveModal && !showDeviceModal) {
          setShowLeaveModal(true);
        }
      }
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [addWarning, examMode, showDeviceModal, showInviteModal, showLeaveModal]);

  useEffect(() => {
    const onResize = () => {
      setViewportHeight(window.innerHeight);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    if (!isFullscreen) {
      setIsDockVisible(true);
      document.body.style.overflow = "";
      if (dockHideTimerRef.current) {
        window.clearTimeout(dockHideTimerRef.current);
        dockHideTimerRef.current = null;
      }
      return;
    }

    document.body.style.overflow = "hidden";
    revealDock();

    const target = roomRootRef.current || window;
    const onInteraction = () => revealDock();
    target.addEventListener("mousemove", onInteraction as EventListener);
    target.addEventListener("touchstart", onInteraction as EventListener, { passive: true });
    window.addEventListener("keydown", onInteraction);

    return () => {
      document.body.style.overflow = "";
      target.removeEventListener("mousemove", onInteraction as EventListener);
      target.removeEventListener("touchstart", onInteraction as EventListener);
      window.removeEventListener("keydown", onInteraction);
      if (dockHideTimerRef.current) {
        window.clearTimeout(dockHideTimerRef.current);
        dockHideTimerRef.current = null;
      }
    };
  }, [isFullscreen, revealDock]);

  useEffect(() => {
    if (isFullscreen) {
      setPanel(null);
      return;
    }
    setPanel((prev) => prev ?? "participants");
  }, [isFullscreen]);

  useEffect(() => {
    if (roomPaused) {
      return;
    }
    const idTimer = window.setInterval(() => {
      setMeetingDurationSec((prev) => prev + 1);
    }, 1000);
    return () => {
      window.clearInterval(idTimer);
    };
  }, [roomPaused]);

  useEffect(() => {
    if (roomPaused) {
      return;
    }
    if (answerSecondsLeft <= 0) {
      submitAnswer({ autoNext: true });
      setAnswerSecondsLeft(90);
      return;
    }
    const t = window.setTimeout(() => setAnswerSecondsLeft((prev) => prev - 1), 1000);
    return () => window.clearTimeout(t);
  }, [answerSecondsLeft, roomPaused, submitAnswer]);

  useEffect(() => {
    setAnswerSecondsLeft(90);
  }, [questionIndex]);

  useEffect(() => {
    setQuestionAnswers((prev) => {
      const size = Math.max(0, questionCount);
      if (size === 0) {
        return [];
      }
      return Array.from({ length: size }, (_, idx) => prev[idx] || "");
    });
  }, [questionCount]);

  useEffect(() => {
    setAnswer(questionAnswers[questionIndex] || "");
  }, [questionAnswers, questionIndex]);

  useEffect(() => {
    if (!examMode) {
      return;
    }

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        setTabSwitchCount((prev) => prev + 1);
        addWarning("Tab switch detected.");
      }
    };

    const onCopy = (evt: ClipboardEvent) => {
      evt.preventDefault();
      setCopyPasteAttempts((prev) => prev + 1);
      addWarning("Copy/paste blocked in exam mode.");
    };

    const onContext = (evt: MouseEvent) => {
      evt.preventDefault();
      addWarning("Right click blocked in exam mode.");
    };

    const onBeforeUnload = (evt: BeforeUnloadEvent) => {
      evt.preventDefault();
      evt.returnValue = "";
    };

    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("copy", onCopy);
    document.addEventListener("paste", onCopy);
    document.addEventListener("cut", onCopy);
    document.addEventListener("contextmenu", onContext);
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("paste", onCopy);
      document.removeEventListener("cut", onCopy);
      document.removeEventListener("contextmenu", onContext);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [addWarning, examMode]);

  useEffect(() => {
    if (!cameraOn && examMode) {
      addWarning("No-face warning: camera is off in exam mode.");
    }
  }, [addWarning, cameraOn, examMode]);

  useEffect(() => {
    let recognition: any = null;
    const speechWindow = window as any;
    const SpeechRecognitionImpl = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;

    if (!SpeechRecognitionImpl || mediaStatus !== "ready") {
      return;
    }

    recognition = new SpeechRecognitionImpl();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let words = 0;
    let startedAt = Date.now();

    recognition.onresult = (evt: any) => {
      if (roomPaused) {
        return;
      }
      const recent = evt.results[evt.results.length - 1];
      if (!recent) {
        return;
      }
      const text = recent[0].transcript.trim();
      if (!text) {
        return;
      }
      const count = text.split(/\s+/).filter(Boolean).length;
      words += count;
      const elapsedMinutes = Math.max(1 / 60, (Date.now() - startedAt) / 60000);
      setSpeakingPace(Math.round(words / elapsedMinutes));
      setTranscript((prev) => [text, ...prev].slice(0, 100));
      setSilenceSeconds(0);
    };

    recognition.onerror = () => undefined;
    recognition.onend = () => {
      if (mediaStatus === "ready") {
        try {
          recognition?.start();
        } catch {
          undefined;
        }
      }
    };

    try {
      recognition.start();
    } catch {
      recognition = null;
    }

    const silenceTicker = window.setInterval(() => {
      if (!roomPaused) {
        setSilenceSeconds((prev) => prev + 1);
      }
    }, 1000);

    return () => {
      window.clearInterval(silenceTicker);
      recognition?.stop();
      recognition = null;
      words = 0;
      startedAt = Date.now();
    };
  }, [mediaStatus, roomPaused]);

  useEffect(() => {
    if (roomPaused) {
      return;
    }
    if (silenceSeconds > 12) {
      addWarning("Silence detected for too long.");
      setSilenceSeconds(0);
    }
  }, [addWarning, roomPaused, silenceSeconds]);

  useEffect(() => {
    socketRef.current?.emit("room:update-self", {
      roomId,
      micOn,
      cameraOn,
      handRaised: participants.find((p) => p.id === selfIdRef.current)?.handRaised || false,
      isScreenSharing: participants.find((p) => p.id === selfIdRef.current)?.isScreenSharing || false,
    });
  }, [cameraOn, micOn, participants, roomId]);

  useEffect(() => {
    if (!roomId || !passcode) {
      return;
    }
    const tokenSource = `${roomId}.${passcode}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}`;
    const token = btoa(tokenSource).replace(/=+$/g, "");
    setInviteToken(token);
    setInviteLink(`${window.location.origin}/room/${roomId}?invite=${token}&pass=${passcode}`);
  }, [passcode, roomId]);

  useEffect(() => {
    if (panel === "chat") {
      setUnreadChatCount(0);
    }
  }, [panel]);

  useEffect(() => {
    const video = localVideoRef.current;
    const stream = localStreamRef.current;
    if (!video || !stream) {
      return;
    }
    video.srcObject = stream;
    video.muted = !monitorLocalAudio;
    video.volume = monitorLocalAudio ? 1 : 0;
    video.playsInline = true;
    void video.play().catch(() => undefined);
  }, [mediaStatus, monitorLocalAudio, retryKey]);

  useEffect(() => {
    const loadDevices = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        return;
      }
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cams = devices.filter((d) => d.kind === "videoinput");
        const mics = devices.filter((d) => d.kind === "audioinput");
        setAvailableCameras(cams);
        setAvailableMics(mics);
        if (!selectedVideoDeviceId && cams[0]?.deviceId) {
          setSelectedVideoDeviceId(cams[0].deviceId);
        }
        if (!selectedAudioDeviceId && mics[0]?.deviceId) {
          setSelectedAudioDeviceId(mics[0].deviceId);
        }
      } catch {
        undefined;
      }
    };

    if (showDeviceModal || mediaStatus === "ready") {
      void loadDevices();
    }
  }, [mediaStatus, selectedAudioDeviceId, selectedVideoDeviceId, showDeviceModal]);

  useEffect(() => {
    const preview = screenPreviewRef.current;
    const screen = screenStreamRef.current;
    if (!preview || !screen) {
      return;
    }
    preview.srcObject = screen;
    preview.muted = true;
    preview.playsInline = true;
    void preview.play().catch(() => undefined);
  }, [isScreenSharing]);

  useEffect(() => {
    if (roomPaused) {
      return;
    }
    const t = window.setInterval(() => {
      setTrendConfidence((prev) => [...prev.slice(-17), confidence]);
    }, 2000);
    return () => window.clearInterval(t);
  }, [confidence, roomPaused]);

  useEffect(() => {
    const updateQuality = () => {
      const navConnection = navigator as Navigator & { connection?: { effectiveType?: string } };
      const effective = navConnection.connection?.effectiveType || "4g";
      if (connectionState !== "connected" || effective === "slow-2g" || effective === "2g") {
        setNetworkQuality("poor");
        return;
      }
      if (effective === "3g") {
        setNetworkQuality("good");
        return;
      }
      setNetworkQuality("excellent");
    };

    updateQuality();
    window.addEventListener("online", updateQuality);
    window.addEventListener("offline", updateQuality);
    return () => {
      window.removeEventListener("online", updateQuality);
      window.removeEventListener("offline", updateQuality);
    };
  }, [connectionState]);

  useEffect(() => {
    if (!showLeaveModal) {
      return;
    }
    const onKey = (evt: KeyboardEvent) => {
      if (evt.key === "Escape") {
        setShowLeaveModal(false);
      }
      if (evt.key === "Enter") {
        leaveRoomAndExit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [leaveRoomAndExit, showLeaveModal]);

  useEffect(() => {
    if (!roomId || !socketRef.current) {
      return;
    }

    const remoteIds = new Set(participants.map((p) => p.id));
    peersRef.current.forEach((_, peerId) => {
      if (!remoteIds.has(peerId)) {
        closePeerConnection(peerId);
      }
    });

    participants.forEach((p) => {
      if (p.id === selfIdRef.current) {
        return;
      }
      if (!peersRef.current.has(p.id) && selfIdRef.current < p.id) {
        createOffer(p.id);
      }
    });
  }, [closePeerConnection, createOffer, participants, roomId]);

  useEffect(() => {
    if (showInviteModal || showLeaveModal || showDeviceModal) {
      return;
    }
    window.setTimeout(() => {
      answerBoxRef.current?.focus();
    }, 60);
  }, [questionIndex, showDeviceModal, showInviteModal, showLeaveModal]);

  useEffect(() => {
    return () => {
      cleanupLocalStream();
      clearAudioMonitors();
      peersRef.current.forEach((pc) => pc.close());
      peersRef.current.clear();
      remoteStreamsRef.current.clear();
    };
  }, [cleanupLocalStream, clearAudioMonitors]);

  const selfParticipant = participants.find((p) => p.id === selfIdRef.current) || null;
  const isSoloMeeting = visibleParticipants.length <= 1 && remoteStreams.length === 0 && !isScreenSharing;
  const unresolvedParticipants = visibleParticipants.filter((p) => p.id !== selfIdRef.current && !remoteStreams.find((s) => s.participantId === p.id));
  const fullscreenTileCount = 1 + (isScreenSharing ? 1 : 0) + remoteStreams.length + unresolvedParticipants.length;
  const fullscreenGridClass =
    fullscreenTileCount <= 1
      ? "grid-cols-1"
      : fullscreenTileCount === 2
        ? "grid-cols-1 md:grid-cols-2"
        : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3";
  const participantPresence = useMemo(() => {
    const base =
      visibleParticipants.length > 0
        ? visibleParticipants.map((p) => ({
            id: p.id,
            name: p.name,
            avatar: p.avatar || (p.id === selfIdRef.current ? userAvatar : null),
            isHost: p.isHost,
            active: activeSpeakerIds.has(p.id) || p.micOn || p.cameraOn,
          }))
        : [
            {
              id: "self-local",
              name: displayName,
              avatar: userAvatar,
              isHost,
              active: micOn || cameraOn,
            },
          ];

    return base;
  }, [activeSpeakerIds, cameraOn, displayName, isHost, micOn, userAvatar, visibleParticipants]);
  const activeParticipantsCount = participantPresence.filter((p) => p.active).length;

  const localCanMic = !micBlockedByHost;
  const localCanCamera = !cameraBlockedByHost;

  const openOwnPublicProfile = useCallback(() => {
    setPublicProfile({
      id: selfParticipant?.id || "self-local",
      userId: selfPublicProfile.userId,
      name: selfPublicProfile.name,
      avatar: selfPublicProfile.avatar || null,
      isHost: Boolean(selfParticipant?.isHost ?? isHost),
      isYou: true,
      micOn,
      cameraOn,
      joinedAt: selfParticipant?.joinedAt || Date.now(),
      role: selfPublicProfile.role,
      bio: selfPublicProfile.bio,
      skills: selfPublicProfile.skills,
    });
  }, [cameraOn, isHost, micOn, selfParticipant, selfPublicProfile]);

  const openParticipantPublicProfile = useCallback(
    (participantId: string) => {
      const participant = visibleParticipants.find((p) => p.id === participantId) || participants.find((p) => p.id === participantId);
      if (!participant) {
        return;
      }
      if (participant.id === selfIdRef.current) {
        openOwnPublicProfile();
        return;
      }
      setPublicProfile({
        id: participant.id,
        userId: participant.userId,
        name: participant.name,
        avatar: participant.avatar || null,
        isHost: participant.isHost,
        isYou: false,
        micOn: participant.micOn,
        cameraOn: participant.cameraOn,
        joinedAt: participant.joinedAt,
        role: "Interview Participant",
        bio: "Public profile in this room is limited to shared meeting details.",
        skills: [],
      });
    },
    [openOwnPublicProfile, participants, visibleParticipants]
  );

  const toggleMic = () => {
    if (!localCanMic) {
      addWarning("Host disabled your microphone access.");
      return;
    }
    const next = !micOn;
    setMicOn(next);
    setTrackEnabled("audio", next);
  };

  const toggleCamera = () => {
    if (!localCanCamera) {
      addWarning("Host disabled your camera access.");
      return;
    }
    const next = !cameraOn;
    setCameraOn(next);
    setTrackEnabled("video", next);
  };

  const toggleRaiseHand = () => {
    if (!socketRef.current || !roomId) {
      return;
    }
    const handRaised = !(selfParticipant?.handRaised || false);
    socketRef.current.emit("room:update-self", {
      roomId,
      handRaised,
      micOn,
      cameraOn,
    });
  };

  const sendReaction = (reaction: string) => {
    socketRef.current?.emit("room:update-self", {
      roomId,
      reaction,
      micOn,
      cameraOn,
    });
    const rid = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setFloatingReactions((prev) => [...prev, { id: rid, emoji: reaction, name: displayName }].slice(-8));
    window.setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((item) => item.id !== rid));
    }, 2200);
    window.setTimeout(() => {
      socketRef.current?.emit("room:update-self", {
        roomId,
        reaction: null,
        micOn,
        cameraOn,
      });
    }, 2000);
  };

  const sendChat = () => {
    if (!chatInput.trim()) {
      return;
    }
    socketRef.current?.emit("chat:send", { roomId, text: chatInput.trim() });
    socketRef.current?.emit("chat:typing", { roomId, typing: false });
    setChatInput("");
  };

  const onChangeChatInput = (value: string) => {
    setChatInput(value);
    socketRef.current?.emit("chat:typing", { roomId, typing: true });
    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = window.setTimeout(() => {
      socketRef.current?.emit("chat:typing", { roomId, typing: false });
    }, 1200);
  };

  const copyText = async (value: string, successMessage: string, key: "invite" | "room" | "pass" | "chat" | "transcript") => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      toast(`${successMessage} Copied ✓`, "success");
      window.setTimeout(() => setCopiedKey((prev) => (prev === key ? null : prev)), 1200);
    } catch {
      toast("Clipboard blocked. Copy manually.", "error");
    }
  };

  const copyInviteLink = async () => {
    const link = inviteLink || `${window.location.origin}/room/${roomId}?invite=${inviteToken}&pass=${passcode}`;
    await copyText(link, "Invite link", "invite");
  };

  const copyRoomId = async () => {
    await copyText(roomId, "Room id", "room");
  };

  const copyPasscode = async () => {
    await copyText(passcode, "Passcode", "pass");
  };

  const shareInvite = async () => {
    const link = inviteLink || `${window.location.origin}/room/${roomId}?invite=${inviteToken}&pass=${passcode}`;
    const nav = navigator as Navigator & { share?: (data: { title?: string; text?: string; url?: string }) => Promise<void> };
    if (nav.share) {
      try {
        await nav.share({
          title: "Interview Invite",
          text: `Join room ${roomId}`,
          url: link,
        });
        return;
      } catch {
        undefined;
      }
    }
    await copyText(link, "Invite link", "invite");
  };

  const copyTranscript = async () => {
    await copyText(transcript.join("\n") || "", "Transcript", "transcript");
  };

  const copyChat = async () => {
    const text = chat.map((m) => `${m.name}: ${m.text}`).join("\n");
    await copyText(text, "Chat", "chat");
  };

  const clearChat = () => {
    if (!chat.length) {
      toast("Chat is already empty.", "info");
      return;
    }
    setChat([]);
    setUnreadChatCount(0);
    setTypingUsers({});
    socketRef.current?.emit("chat:typing", { roomId, typing: false });
    toast("Chat cleared.", "success");
  };

  const togglePauseInterview = () => {
    if (!isHost) {
      return;
    }
    socketRef.current?.emit("room:pause", { roomId, paused: !roomPaused });
  };

  const toggleRoomLock = () => {
    socketRef.current?.emit("room:update-settings", {
      roomId,
      locked: !roomLocked,
      requireApproval: roomRequireApproval,
      examMode,
    });
  };

  const toggleRequireApproval = () => {
    socketRef.current?.emit("room:update-settings", {
      roomId,
      locked: roomLocked,
      requireApproval: !roomRequireApproval,
      examMode,
    });
  };

  const toggleExamMode = () => {
    socketRef.current?.emit("room:update-settings", {
      roomId,
      locked: roomLocked,
      requireApproval: roomRequireApproval,
      examMode: !examMode,
    });
  };

  const approveJoin = (socketId: string, approve: boolean) => {
    socketRef.current?.emit("room:approve-join", { roomId, socketId, approve });
  };

  const hostMute = (participantId: string) => {
    socketRef.current?.emit("room:mute-user", { roomId, participantId });
  };

  const hostBlockMedia = (participantId: string, kind: "mic" | "camera", blocked: boolean) => {
    socketRef.current?.emit("room:set-media-access", {
      roomId,
      participantId,
      micBlocked: kind === "mic" ? blocked : undefined,
      cameraBlocked: kind === "camera" ? blocked : undefined,
    });
  };

  const hostRemove = (participantId: string) => {
    socketRef.current?.emit("room:remove-user", { roomId, participantId });
  };

  const hostEndMeeting = () => {
    socketRef.current?.emit("room:end", { roomId });
    navigate("/history");
  };

  const openScreenShare = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      addWarning("Screen share unsupported in this browser.");
      return;
    }

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      const videoTrack = screenStream.getVideoTracks()[0];
      if (!videoTrack) {
        return;
      }
      screenStreamRef.current = screenStream;
      setIsScreenSharing(true);

      peersRef.current.forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === "video");
        sender?.replaceTrack(videoTrack).catch(() => undefined);
      });

      socketRef.current?.emit("room:update-self", {
        roomId,
        isScreenSharing: true,
        micOn,
        cameraOn,
      });

      videoTrack.onended = () => {
        const camTrack = localStreamRef.current?.getVideoTracks()[0];
        if (!camTrack) {
          return;
        }
        peersRef.current.forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track?.kind === "video");
          sender?.replaceTrack(camTrack).catch(() => undefined);
        });
        socketRef.current?.emit("room:update-self", {
          roomId,
          isScreenSharing: false,
          micOn,
          cameraOn,
        });
        screenStreamRef.current = null;
        setIsScreenSharing(false);
      };
    } catch {
      addWarning("Screen share request canceled.");
    }
  };

  const stopScreenShare = () => {
    const active = screenStreamRef.current;
    if (!active) {
      return;
    }
    active.getTracks().forEach((t) => t.stop());
    screenStreamRef.current = null;
    setIsScreenSharing(false);
    const camTrack = localStreamRef.current?.getVideoTracks()[0];
    if (camTrack) {
      peersRef.current.forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === "video");
        sender?.replaceTrack(camTrack).catch(() => undefined);
      });
    }
    socketRef.current?.emit("room:update-self", {
      roomId,
      isScreenSharing: false,
      micOn,
      cameraOn,
    });
  };

  if (loading) {
    return (
      <div className="op-dark-page op-interview-room min-h-screen bg-[#090B14] text-white">
        <div className="mx-auto max-w-450 px-4 py-10">
          <div className="mb-4 h-12 w-3/5 animate-pulse rounded-xl bg-white/8" />
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_420px]">
            <div className="space-y-4">
              <div className="h-80 animate-pulse rounded-2xl border border-white/10 bg-white/6" />
              <div className="h-56 animate-pulse rounded-2xl border border-white/10 bg-white/6" />
            </div>
            <div className="space-y-4">
              <div className="h-52 animate-pulse rounded-2xl border border-white/10 bg-white/6" />
              <div className="h-72 animate-pulse rounded-2xl border border-white/10 bg-white/6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="op-dark-page op-interview-room min-h-screen bg-[#090B14] text-white">
        <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 text-center">
          <h2 className="mb-2 text-3xl font-extrabold">Unable to open room</h2>
          <p className="mb-6 max-w-xl text-sm text-white/65">{error}</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button className="rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400" onClick={handleRetryRoomLoad}>
              Retry
            </button>
            <button className="rounded-xl border border-white/20 bg-white/8 px-5 py-2.5 text-sm font-semibold text-white/85 hover:bg-white/12" onClick={() => navigate("/history") }>
              Back to History
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={roomRootRef}
      className={`op-dark-page op-interview-room bg-[#060912] text-white ${isFullscreen ? "fixed inset-0 z-80 w-screen h-screen overflow-hidden bg-black" : "min-h-screen"}`}
      style={isFullscreen ? { height: viewportHeight } : undefined}
    >
      <header className={`${isFullscreen ? "hidden" : "sticky top-0"} z-60 border-b border-white/10 bg-[#08101F]/96 backdrop-blur-sm`}>
        <div className="mx-auto w-full max-w-450 px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => navigate("/")} title="Back to Home" className="rounded-lg border border-white/15 bg-[#0B1220]/88 px-3 py-1.5 text-xs font-semibold text-white/85 backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-cyan-300/40 hover:text-cyan-100">
                <Home className="mr-1 inline h-3.5 w-3.5" />Home
              </button>
              <button onClick={() => navigate("/dashboard")} title="Return to Dashboard" className="rounded-lg border border-white/15 bg-[#0B1220]/88 px-3 py-1.5 text-xs font-semibold text-white/85 backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-indigo-300/40 hover:text-indigo-100">
                <LayoutDashboard className="mr-1 inline h-3.5 w-3.5" />Dashboard
              </button>
              <button onClick={() => setShowLeaveModal(true)} title="Exit Meeting" className="rounded-lg border border-red-300/35 bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-100 transition hover:-translate-y-0.5 hover:bg-red-500/30">
                <LogOut className="mr-1 inline h-3.5 w-3.5" />Exit
              </button>
            </div>

            <div className="flex items-center gap-2">
              <ControlIconButton onClick={() => setShowInviteModal(true)} icon={<Share2 className="h-4 w-4" />} label="Invite Share" />
              <ControlIconButton onClick={copyInviteLink} icon={<Copy className="h-4 w-4" />} label="Copy Invite Link" />
              {isHost && (
                <ControlIconButton
                  onClick={togglePauseInterview}
                  icon={roomPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  label={roomPaused ? "Resume Interview" : "Pause Interview"}
                  active={roomPaused}
                />
              )}
              <ControlIconButton onClick={toggleFullscreen} icon={<Expand className="h-4 w-4" />} label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"} active={isFullscreen} />
              <ControlIconButton onClick={() => setShowLeaveModal(true)} icon={<DoorOpen className="h-4 w-4" />} label="Leave Interview" danger />
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2.5">
            <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/85">Room {roomId || "..."}</div>
            <div className="rounded-lg border border-indigo-300/30 bg-indigo-400/15 px-3 py-1.5 text-xs font-semibold text-indigo-100">Passcode {passcode || "..."}</div>
            <div className="rounded-lg border border-emerald-300/30 bg-emerald-400/15 px-3 py-1.5 text-xs font-semibold text-emerald-100">{formatTimer(meetingDurationSec)}</div>
            <div className="rounded-lg border border-rose-300/35 bg-rose-500/15 px-3 py-1.5 text-xs font-semibold text-rose-100">
              <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-rose-300" />REC
            </div>
            <div className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${connectionState === "connected" ? "border border-emerald-300/35 bg-emerald-400/12 text-emerald-100" : connectionState === "connecting" ? "border border-amber-300/35 bg-amber-400/12 text-amber-100" : "border border-red-300/35 bg-red-400/12 text-red-100"}`}>
              {connectionState === "connected" ? "Realtime Connected" : connectionState === "connecting" ? "Reconnecting..." : "Disconnected"}
            </div>
            <div className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${networkQuality === "excellent" ? "border border-emerald-300/35 bg-emerald-400/12 text-emerald-100" : networkQuality === "good" ? "border border-amber-300/35 bg-amber-400/12 text-amber-100" : "border border-red-300/35 bg-red-400/12 text-red-100"}`}>
              <Wifi className="mr-1 inline h-3 w-3" /> {networkQuality}
            </div>
            {roomPaused && <div className="rounded-lg border border-amber-300/35 bg-amber-400/15 px-3 py-1.5 text-xs font-semibold text-amber-100">Interview Paused</div>}
            {joinPending && <div className="rounded-lg border border-amber-300/30 bg-amber-400/15 px-3 py-1.5 text-xs font-semibold text-amber-100">Waiting host approval...</div>}
          </div>
        </div>
      </header>

      <div className={`${isFullscreen ? "pointer-events-none absolute left-3 right-3 top-3 z-50 border border-white/10 rounded-2xl bg-[#090F1E]/60 backdrop-blur-sm" : "border-b border-white/8 bg-[#090F1E]/75 backdrop-blur-sm"}`}>
        <div className={`mx-auto flex w-full items-center justify-between gap-3 py-2 ${isFullscreen ? "max-w-none px-3 md:px-5" : "max-w-450 px-4"}`}>
          <div className="text-xs text-white/65">
            Joined <span className="font-semibold text-white/90">{participantPresence.length}</span> | Active <span className="font-semibold text-emerald-200">{activeParticipantsCount}</span>
          </div>
          <div className={`flex items-center gap-1.5 overflow-x-auto pb-0.5 ${isFullscreen ? "pointer-events-auto max-w-[72%]" : "max-w-[70%]"}`}>
            {participantPresence.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => openParticipantPublicProfile(p.id)}
                title={`View ${p.name} profile`}
                className="relative shrink-0 rounded-full transition hover:scale-105"
              >
                <UserAvatar src={p.avatar} name={p.name} size={32} speaking={p.active} online host={p.isHost} />
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className={`grid w-full grid-cols-1 gap-4 ${isFullscreen ? "h-full px-0 pb-28 pt-0" : "mx-auto max-w-450 px-4 pb-28 pt-4 xl:grid-cols-[1fr_420px]"}`}>
        <section className={`${isFullscreen ? "h-full" : "space-y-4"}`}>
          <div className={`${isFullscreen ? "h-full border-0 bg-black p-0" : "rounded-2xl border border-white/10 bg-[#0D1324] p-3"}`}> 
            <div className="mb-3 flex items-center justify-between">
              <h2 className={`font-semibold text-white/85 ${isFullscreen ? "px-4 pt-3 text-xs text-white/65" : "text-sm"}`}>Live Interview Grid</h2>
              <motion.div key={visibleParticipants.length} initial={{ scale: 0.9, opacity: 0.7 }} animate={{ scale: 1, opacity: 1 }} className="text-xs text-white/45">
                Participants {visibleParticipants.length}
              </motion.div>
            </div>

            <div className={`grid gap-3 ${isFullscreen ? `h-[calc(100%-42px)] w-full px-0 pb-0 ${fullscreenGridClass}` : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"} ${isSoloMeeting && !isFullscreen ? "mx-auto max-w-4xl" : ""}`}>
              <div className={`relative overflow-hidden border border-indigo-400/30 bg-[#0A0F1A] ${isFullscreen ? `min-h-0 w-full ${fullscreenTileCount === 1 ? "h-full rounded-none" : "h-[calc(100vh-190px)] rounded-xl"}` : "rounded-2xl"} ${isSoloMeeting && !isFullscreen ? "md:col-span-2 min-h-[68vh]" : ""}`}>
                {mediaStatus === "ready" && cameraOn ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`h-full w-full object-cover ${isFullscreen ? "min-h-0" : "min-h-55"} scale-x-[-1] will-change-transform ${backgroundBlurEnabled ? "brightness-95 saturate-120" : ""}`}
                  />
                ) : (
                  <div className={`flex flex-col items-center justify-center gap-3 px-4 text-center ${isFullscreen ? "h-full min-h-0" : "min-h-55"}`}>
                    {!cameraOn ? (
                      <>
                        <UserAvatar src={userAvatar} name={displayName} size={112} online />
                        <p className="text-sm text-white/65">Camera is off. Turn it on to start video.</p>
                      </>
                    ) : (
                      <>
                        <div className="h-11 w-11 animate-pulse rounded-full bg-indigo-500/20" />
                        <p className="text-sm text-white/70">
                          {mediaStatus === "loading" ? "Starting camera..." : mediaStatus === "camera-denied" ? "Camera permission denied" : mediaError || "Camera unavailable"}
                        </p>
                        <button
                          onClick={() => startMedia(true)}
                          className="rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/15"
                        >
                          {isReconnectingMedia ? "Retrying..." : "Retry Camera"}
                        </button>
                      </>
                    )}
                  </div>
                )}
                {!isFullscreen && (
                  <button
                    type="button"
                    onClick={openOwnPublicProfile}
                    title="Open profile"
                    className="absolute right-3 top-3 rounded-full transition hover:scale-105"
                  >
                    <UserAvatar src={userAvatar} name={displayName} size={40} online />
                  </button>
                )}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 rounded-lg bg-black/40 px-2.5 py-1 text-xs font-semibold">
                    {!isFullscreen ? (
                      <UserAvatar
                        src={userAvatar}
                        name={displayName}
                        size={24}
                        speaking={activeSpeakerIds.has("local") || localAudioLevel > 28}
                        online
                        host={isHost}
                      />
                    ) : null}
                    <span>{displayName} (You)</span>
                    {isHost && <span className="text-[10px] font-bold uppercase tracking-wide text-amber-200">Host</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg px-2 py-1 text-[11px] font-semibold" style={{ backgroundColor: micOn ? "rgba(16,185,129,0.22)" : "rgba(239,68,68,0.28)", color: micOn ? "#86efac" : "#fecaca" }}>
                      {micOn ? "Mic On" : "Mic Off"}
                    </span>
                    <span className="rounded-lg px-2 py-1 text-[11px] font-semibold" style={{ backgroundColor: cameraOn ? "rgba(99,102,241,0.25)" : "rgba(148,163,184,0.25)", color: cameraOn ? "#c7d2fe" : "#e2e8f0" }}>
                      {cameraOn ? "Cam On" : "Cam Off"}
                    </span>
                  </div>
                </div>
                {transcript[0] && (
                  <div className="pointer-events-none absolute inset-x-3 bottom-13 rounded-lg border border-black/20 bg-black/45 px-2 py-1 text-[11px] text-white/90">
                    {transcript[0]}
                  </div>
                )}
                <div className="absolute left-3 top-3 flex items-center gap-2">
                  <div className={`h-7 w-7 rounded-full border border-cyan-300/40 bg-cyan-400/15 ${localAudioLevel > 26 ? "animate-pulse" : ""}`}>
                    <Mic className="m-1 h-5 w-5 text-cyan-200" />
                  </div>
                  <div className="h-2 w-20 overflow-hidden rounded-full bg-black/45">
                    <div className="h-full rounded-full bg-cyan-300 transition-all" style={{ width: `${Math.min(100, localAudioLevel)}%` }} />
                  </div>
                </div>
              </div>

              {isFullscreen && visibleParticipants.length > 1 && (
                <div className="pointer-events-none absolute right-3 top-16 z-40 flex max-h-[72vh] w-30 flex-col gap-2 overflow-y-auto rounded-2xl border border-white/10 bg-black/35 p-2 backdrop-blur-sm">
                  {participantPresence.slice(0, 8).map((p) => (
                    <button
                      key={`floating-presence-${p.id}`}
                      type="button"
                      onClick={() => openParticipantPublicProfile(p.id)}
                      className="pointer-events-auto flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/6 p-1.5 text-left text-[10px] text-white/85 transition hover:border-cyan-300/45 hover:bg-cyan-500/14"
                      title={p.name}
                    >
                      <UserAvatar src={p.avatar} name={p.name} size={24} speaking={p.active} online host={p.isHost} />
                      <span className="truncate">{p.name}</span>
                    </button>
                  ))}
                  <div className="rounded-lg border border-white/10 bg-white/6 px-2 py-1 text-center text-[10px] font-semibold text-white/75">
                    {participantPresence.length} total
                  </div>
                </div>
              )}

              {isScreenSharing && (
                <div className={`relative overflow-hidden border border-cyan-300/35 bg-[#08111E] ${isFullscreen ? "h-[calc(100vh-190px)] rounded-xl" : "rounded-2xl"}`}>
                  <video ref={screenPreviewRef} autoPlay playsInline muted className={`h-full w-full object-cover ${isFullscreen ? "min-h-0" : "min-h-55"}`} />
                  <div className="absolute left-3 top-3 rounded-full border border-cyan-300/35 bg-cyan-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-cyan-100">
                    Screen Share Preview
                  </div>
                </div>
              )}

              {remoteStreams.map(({ participantId, stream }) => {
                const participant = participants.find((p) => p.id === participantId);
                if (!participant) {
                  return null;
                }
                return (
                  <VideoTile
                    key={participantId}
                    stream={stream}
                    name={participant.name}
                    avatar={participant.avatar || null}
                    isHost={participant.isHost}
                    micOn={participant.micOn}
                    cameraOn={participant.cameraOn}
                    handRaised={participant.handRaised}
                    reaction={participant.reaction}
                    isActiveSpeaker={activeSpeakerIds.has(participantId)}
                    className={isFullscreen ? "h-[calc(100vh-190px)] rounded-xl" : "rounded-2xl min-h-[34vh]"}
                  />
                );
              })}

              {unresolvedParticipants.map((p) => (
                  <VideoTile
                    key={p.id}
                    stream={null}
                    name={p.name}
                    avatar={p.avatar || null}
                    isHost={p.isHost}
                    micOn={p.micOn}
                    cameraOn={p.cameraOn}
                    handRaised={p.handRaised}
                    reaction={p.reaction}
                    isActiveSpeaker={activeSpeakerIds.has(p.id)}
                    className={isFullscreen ? "h-[calc(100vh-190px)] rounded-xl" : "rounded-2xl min-h-[28vh]"}
                  />
                ))}
            </div>
          </div>

          <div className={`${isFullscreen ? "hidden" : "rounded-2xl border border-white/10 bg-[#0D1324] p-4"}`}>
            <div className="mb-2 flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-wide text-white/60">
                Question {questionIndex + 1} / {Math.max(1, questionCount)}
              </div>
              <div className="rounded-lg border border-indigo-300/30 bg-indigo-400/15 px-2.5 py-1 text-xs font-semibold text-indigo-100">Timer {formatTimer(answerSecondsLeft)}</div>
            </div>
            {roomPaused && (
              <div className="mb-3 rounded-lg border border-amber-300/30 bg-amber-400/10 px-3 py-2 text-xs font-semibold text-amber-100">
                Interview is paused by host. Question timer and analytics are temporarily paused.
              </div>
            )}

            <div className="mb-3 flex flex-wrap items-center gap-2">
              {Array.from({ length: Math.max(1, questionCount) }, (_, idx) => {
                const answered = Boolean(questionAnswers[idx]?.trim());
                const isCurrent = idx === questionIndex;
                return (
                  <button
                    key={`question-chip-${idx}`}
                    type="button"
                    onClick={() => {
                      setQuestionIndex(idx);
                      setFeedback(null);
                    }}
                    className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${isCurrent ? "border-cyan-300/60 bg-cyan-500/20 text-cyan-100" : answered ? "border-emerald-300/35 bg-emerald-500/12 text-emerald-100" : "border-white/15 bg-white/5 text-white/70 hover:bg-white/10"}`}
                    title={answered ? `Q${idx + 1} Answered` : `Q${idx + 1} Not Answered`}
                  >
                    Q{idx + 1} {answered ? "Answered" : "Not Answered"}
                  </button>
                );
              })}
            </div>

            <h3 className="mb-3 text-lg font-semibold text-white">{currentQuestionText || "Question loading..."}</h3>
            <textarea
              ref={answerBoxRef}
              autoFocus
              value={answer}
              onChange={(e) => {
                const nextValue = e.target.value;
                setAnswer(nextValue);
                setQuestionAnswers((prev) => {
                  const next = [...prev];
                  next[questionIndex] = nextValue;
                  return next;
                });
              }}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                  e.preventDefault();
                  void submitAnswer({ autoNext: true });
                }
              }}
              placeholder="Type your answer..."
              className="relative z-20 min-h-40 w-full rounded-xl border border-white/10 bg-[#070B15] p-3 text-sm text-white/90 caret-cyan-300 outline-none focus:border-indigo-400/60"
              style={{ pointerEvents: "auto" }}
            />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setQuestionIndex((prev) => Math.max(0, prev - 1));
                  setFeedback(null);
                }}
                disabled={roomPaused || questionIndex === 0}
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => submitAnswer({ autoNext: true })}
                disabled={roomPaused}
                className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400"
              >
                Submit & Next
              </button>
              <button
                onClick={() => submitAnswer()}
                disabled={roomPaused}
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10"
              >
                Submit
              </button>
              <button
                onClick={() => {
                  setQuestionIndex((prev) => Math.min(questionCount - 1, prev + 1));
                  setFeedback(null);
                }}
                disabled={roomPaused || isLastQuestion}
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10"
              >
                Next
              </button>
              <button onClick={() => setShowFinalSubmitModal(true)} className="rounded-xl border border-red-300/40 bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-100">
                Final Submission
              </button>
              <div className="ml-auto rounded-lg border border-emerald-300/25 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-100">
                Answered {Math.min(answeredCount, questionCount)}/{Math.max(1, questionCount)}
              </div>
            </div>

            {feedback && (
              <div className="mt-3 rounded-xl border border-indigo-300/30 bg-indigo-500/10 p-3">
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-indigo-200">AI Feedback</div>
                <div className="mb-1 text-sm text-white/80">{feedback.fb}</div>
                <div className="text-xs text-indigo-100">Score {feedback.score}/10</div>
              </div>
            )}
          </div>
        </section>

        <aside
          className={
            isFullscreen
              ? `fixed right-3 top-16 z-70 w-[min(420px,92vw)] max-h-[calc(100vh-170px)] overflow-y-auto rounded-2xl border border-white/12 bg-[#091122]/92 p-3 backdrop-blur-xl ${panel ? "block" : "hidden"}`
              : "space-y-4"
          }
        >
          {isFullscreen && panel && (
            <div className="mb-2 flex justify-end">
              <button
                type="button"
                onClick={() => setPanel(null)}
                className="rounded-lg border border-white/20 bg-white/8 px-2.5 py-1 text-xs font-semibold text-white/85 transition hover:bg-white/14"
                title="Close section"
              >
                X
              </button>
            </div>
          )}
          <div className="rounded-2xl border border-white/10 bg-[#0D1324] p-4">
            <h4 className="mb-3 text-sm font-semibold text-white/85">Live AI Analytics</h4>
            <div className="space-y-3 text-xs">
              <div>
                <div className="mb-1 flex items-center justify-between"><span className="text-white/55">Confidence</span><span className="text-emerald-300">{confidence}%</span></div>
                <div className="h-2 rounded-full bg-white/10"><div className="h-full rounded-full bg-emerald-400" style={{ width: `${confidence}%` }} /></div>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between"><span className="text-white/55">Eye Contact</span><span className="text-cyan-300">{eyeContact}%</span></div>
                <div className="h-2 rounded-full bg-white/10"><div className="h-full rounded-full bg-cyan-400" style={{ width: `${eyeContact}%` }} /></div>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between"><span className="text-white/55">Speaking Pace</span><span className="text-indigo-200">{speakingPace} wpm</span></div>
                <div className="h-2 rounded-full bg-white/10"><div className="h-full rounded-full bg-indigo-400" style={{ width: `${Math.min(100, Math.max(20, speakingPace / 2))}%` }} /></div>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between"><span className="text-white/55">Speaking Ratio</span><span className="text-fuchsia-200">{speakingRatio}%</span></div>
                <div className="h-2 rounded-full bg-white/10"><div className="h-full rounded-full bg-fuchsia-400" style={{ width: `${speakingRatio}%` }} /></div>
              </div>
              <div>
                <div className="mb-1 text-white/55">Eye Movement Heat</div>
                <div className="grid grid-cols-6 gap-1">
                  {Array.from({ length: 12 }).map((_, idx) => {
                    const intensity = Math.max(0.12, ((eyeContact + idx * 7) % 100) / 100);
                    return <div key={idx} className="h-2 rounded-sm" style={{ backgroundColor: `rgba(56,189,248,${intensity.toFixed(2)})` }} />;
                  })}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-white/10 bg-white/5 p-2">
                  <div className="text-white/45">Emotion</div>
                  <div className="font-semibold text-white/90">{emotionState}</div>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-2">
                  <div className="text-white/45">AI Score</div>
                  <div className="font-semibold text-cyan-300">{aiInterviewScore}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-white/10 bg-white/5 p-2">
                  <div className="text-white/45">Filler Words</div>
                  <div className="font-semibold text-amber-200">{fillerWordCount}</div>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-2">
                  <div className="text-white/45">Suspicious</div>
                  <div className="font-semibold text-amber-200">{suspiciousWarnings.length}</div>
                </div>
              </div>
              <div>
                <div className="mb-1 text-white/55">Confidence Trend</div>
                <MiniTrend points={trendConfidence} color="#22d3ee" />
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between"><span className="text-white/55">Tab Switches</span><span className="text-amber-200">{tabSwitchCount}</span></div>
                <div className="mb-1 flex items-center justify-between"><span className="text-white/55">Copy/Paste Blocks</span><span className="text-amber-200">{copyPasteAttempts}</span></div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0D1324] p-4">
            <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
              {([
                { key: "participants", icon: <Users className="h-3.5 w-3.5" />, label: "Participants" },
                { key: "chat", icon: <MessagesSquare className="h-3.5 w-3.5" />, label: "Chat" },
                { key: "analytics", icon: <ChartNoAxesCombined className="h-3.5 w-3.5" />, label: "Analytics" },
                { key: "transcript", icon: <Activity className="h-3.5 w-3.5" />, label: "Transcript" },
                { key: "settings", icon: <Settings className="h-3.5 w-3.5" />, label: "Settings" },
              ] as Array<{ key: PanelType; icon: React.ReactNode; label: string }>).map((item) => (
                <button
                  key={item.key}
                  onClick={() => setPanel(item.key)}
                  title={item.label}
                  className={`relative flex items-center gap-1 rounded-lg border px-2.5 py-1.5 transition-all ${panel === item.key ? "border-indigo-300/50 bg-indigo-500/20 text-indigo-100" : "border-white/10 bg-white/6 text-white/75 hover:bg-white/12"}`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.key === "chat" && unreadChatCount > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">{unreadChatCount > 9 ? "9+" : unreadChatCount}</span>
                  )}
                </button>
              ))}
            </div>

            {panel === "participants" && (
              <div className="space-y-2">
                {joinQueue.length > 0 && isHost && (
                  <div className="rounded-xl border border-amber-300/30 bg-amber-400/10 p-2">
                    <div className="mb-2 text-xs font-semibold text-amber-100">Join Requests</div>
                    {joinQueue.map((q) => (
                      <div key={q.socketId} className="mb-2 rounded-lg border border-white/10 bg-white/5 p-2 text-xs">
                        <div className="mb-1 text-white/90">{q.name}</div>
                        <div className="flex gap-2">
                          <button onClick={() => approveJoin(q.socketId, true)} className="rounded bg-emerald-500/25 px-2 py-1 text-emerald-100">Approve</button>
                          <button onClick={() => approveJoin(q.socketId, false)} className="rounded bg-red-500/25 px-2 py-1 text-red-100">Reject</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {visibleParticipants.map((p) => (
                  <div key={p.id} className="rounded-xl border border-white/10 bg-white/5 p-2 text-xs">
                    <div className="mb-1 flex items-center justify-between">
                      <button type="button" onClick={() => openParticipantPublicProfile(p.id)} className="flex items-center gap-2 font-semibold text-white/90 transition hover:text-cyan-200">
                        <UserAvatar src={p.avatar} name={p.name} size={24} speaking={activeSpeakerIds.has(p.id)} online host={p.isHost} />
                        {p.name}
                      </button>
                      <span className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${p.isHost ? "border-amber-300/40 bg-amber-400/15 text-amber-100" : "border-white/15 bg-white/6 text-white/60"}`}>
                        {p.isHost ? <ShieldCheck className="h-3 w-3" /> : <Users className="h-3 w-3" />}
                        {p.isHost ? "Host" : "Participant"}
                      </span>
                    </div>
                    <div className="mb-2 flex flex-wrap items-center gap-1.5">
                      <span className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${p.micOn ? "border-emerald-300/35 bg-emerald-400/15 text-emerald-100" : "border-rose-300/35 bg-rose-500/15 text-rose-100"}`}>
                        {p.micOn ? <Mic className="h-3 w-3" /> : <MicOff className="h-3 w-3" />}
                        {p.micOn ? "Mic On" : "Mic Off"}
                      </span>
                      <span className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${p.cameraOn ? "border-sky-300/35 bg-sky-500/15 text-sky-100" : "border-slate-300/30 bg-slate-500/18 text-slate-100"}`}>
                        {p.cameraOn ? <Camera className="h-3 w-3" /> : <CameraOff className="h-3 w-3" />}
                        {p.cameraOn ? "Cam On" : "Cam Off"}
                      </span>
                      {p.handRaised && (
                        <span className="inline-flex items-center gap-1 animate-pulse rounded-md border border-indigo-300/60 bg-indigo-500/25 px-1.5 py-0.5 text-[10px] font-bold text-indigo-100 shadow">
                          <Hand className="h-3.5 w-3.5" />
                          Hand Raised
                        </span>
                      )}
                    </div>
                    {isHost && p.id !== selfIdRef.current && (
                      <div className="flex flex-wrap gap-1.5">
                        <button onClick={() => hostMute(p.id)} className="rounded bg-indigo-500/25 px-2 py-1 text-indigo-100">Mute</button>
                        <button onClick={() => hostBlockMedia(p.id, "mic", !p.micBlockedByHost)} className="rounded bg-slate-500/25 px-2 py-1 text-slate-100">{p.micBlockedByHost ? "Unblock Mic" : "Block Mic"}</button>
                        <button onClick={() => hostBlockMedia(p.id, "camera", !p.cameraBlockedByHost)} className="rounded bg-slate-500/25 px-2 py-1 text-slate-100">{p.cameraBlockedByHost ? "Unblock Cam" : "Block Cam"}</button>
                        <button onClick={() => hostRemove(p.id)} className="rounded bg-red-500/25 px-2 py-1 text-red-100">Kick</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {panel === "chat" && (
              <div>
                <div className="mb-2 flex justify-end gap-2">
                  <button onClick={copyChat} className={`rounded-md border px-2 py-1 text-[11px] font-semibold transition ${copiedKey === "chat" ? "border-emerald-300/45 bg-emerald-500/15 text-emerald-200" : "border-white/15 bg-white/8 text-white/75"}`}>
                    <Clipboard className="mr-1 inline h-3 w-3" />{copiedKey === "chat" ? "Copied ✓" : "Copy Chat"}
                  </button>
                  <button onClick={clearChat} className="rounded-md border border-red-300/35 bg-red-500/15 px-2 py-1 text-[11px] font-semibold text-red-100 transition hover:bg-red-500/22" title="Clear chat">
                    <Trash2 className="mr-1 inline h-3 w-3" />Clear
                  </button>
                </div>
                <div className="mb-2 max-h-70 space-y-2 overflow-y-auto pr-1">
                  {chat.map((m) => (
                    <div key={m.id} className="rounded-lg border border-white/10 bg-white/5 p-2 text-xs">
                      {(() => {
                        const msgParticipant = visibleParticipants.find((p) => p.id === m.participantId);
                        return (
                          <button type="button" onClick={() => msgParticipant && openParticipantPublicProfile(msgParticipant.id)} className="mb-1 flex items-center gap-2 text-[11px] text-white/55 transition hover:text-cyan-200">
                            <UserAvatar src={msgParticipant?.avatar} name={m.name} size={20} online />
                            {m.name}
                          </button>
                        );
                      })()}
                      <div className="text-white/85">{m.text}</div>
                    </div>
                  ))}
                </div>
                {Object.keys(typingUsers).length > 0 && (
                  <div className="mb-2 text-[11px] text-cyan-200/85">
                    {Object.values(typingUsers).slice(0, 2).join(", ")} {Object.keys(typingUsers).length > 1 ? "are" : "is"} typing...
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    value={chatInput}
                    onChange={(e) => onChangeChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        sendChat();
                      }
                    }}
                    className="w-full rounded-lg border border-white/10 bg-[#070B15] px-2 py-1.5 text-xs text-white outline-none"
                    placeholder="Type message..."
                  />
                  <button onClick={sendChat} className="rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-semibold"><Send className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            )}

            {panel === "analytics" && (
              <div className="space-y-2 text-xs text-white/80">
                <div className="rounded-lg border border-white/10 bg-white/5 p-2">Silence: {silenceSeconds}s</div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-2">Warnings: {suspiciousWarnings.length}</div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-2">Interview score trend: {scores.length ? scores.join(", ") : "No scores yet"}</div>
              </div>
            )}

            {panel === "transcript" && (
              <div className="max-h-75 space-y-2 overflow-y-auto pr-1">
                <div className="mb-2 flex justify-end">
                  <button onClick={copyTranscript} className={`rounded-md border px-2 py-1 text-[11px] font-semibold transition ${copiedKey === "transcript" ? "border-emerald-300/45 bg-emerald-500/15 text-emerald-200" : "border-white/15 bg-white/8 text-white/75"}`}>
                    <Clipboard className="mr-1 inline h-3 w-3" />{copiedKey === "transcript" ? "Copied ✓" : "Copy Transcript"}
                  </button>
                </div>
                {transcript.map((line, idx) => (
                  <div key={`${line}-${idx}`} className="rounded-lg border border-white/10 bg-white/5 p-2 text-xs text-white/80">
                    {line}
                  </div>
                ))}
                {transcript.length === 0 && <div className="text-xs text-white/40">Transcript will appear when speech recognition is available.</div>}
              </div>
            )}

            {panel === "settings" && (
              <div className="space-y-2 text-xs">
                <motion.button
                  onClick={toggleRoomLock}
                  whileTap={{ scale: 0.985 }}
                  className={`w-full rounded-lg border px-3 py-2 text-left transition-all duration-300 hover:-translate-y-0.5 ${roomLocked ? "border-emerald-300/40 bg-emerald-500/14 text-emerald-100" : "border-white/15 bg-white/5 text-white/85 hover:bg-white/10"}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span><Lock className="mr-2 inline h-3.5 w-3.5" />{roomLocked ? "Unlock Room" : "Lock Room"}</span>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide ${roomLocked ? "border-emerald-300/45 bg-emerald-500/20 text-emerald-100" : "border-slate-300/30 bg-slate-500/20 text-slate-200"}`}>{roomLocked ? "ON" : "OFF"}</span>
                  </div>
                </motion.button>

                <motion.button
                  onClick={toggleRequireApproval}
                  whileTap={{ scale: 0.985 }}
                  className={`w-full rounded-lg border px-3 py-2 text-left transition-all duration-300 hover:-translate-y-0.5 ${roomRequireApproval ? "border-cyan-300/40 bg-cyan-500/14 text-cyan-100" : "border-white/15 bg-white/5 text-white/85 hover:bg-white/10"}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span><UserCheck className="mr-2 inline h-3.5 w-3.5" />{roomRequireApproval ? "Disable Join Approval" : "Enable Join Approval"}</span>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide ${roomRequireApproval ? "border-cyan-300/45 bg-cyan-500/20 text-cyan-100" : "border-slate-300/30 bg-slate-500/20 text-slate-200"}`}>{roomRequireApproval ? "ON" : "OFF"}</span>
                  </div>
                </motion.button>

                <motion.button
                  onClick={toggleExamMode}
                  whileTap={{ scale: 0.985 }}
                  className={`w-full rounded-lg border px-3 py-2 text-left transition-all duration-300 hover:-translate-y-0.5 ${examMode ? "border-violet-300/40 bg-violet-500/14 text-violet-100" : "border-white/15 bg-white/5 text-white/85 hover:bg-white/10"}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span><ShieldCheck className="mr-2 inline h-3.5 w-3.5" />{examMode ? "Disable Exam Mode" : "Enable Exam Mode"}</span>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide ${examMode ? "border-violet-300/45 bg-violet-500/20 text-violet-100" : "border-slate-300/30 bg-slate-500/20 text-slate-200"}`}>{examMode ? "ON" : "OFF"}</span>
                  </div>
                </motion.button>

                <motion.button onClick={() => setShowDeviceModal(true)} whileTap={{ scale: 0.985 }} className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-left text-white/85 transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-300/40 hover:bg-indigo-500/12 hover:text-indigo-100">
                  <div className="flex items-center justify-between gap-3">
                    <span><SlidersHorizontal className="mr-2 inline h-3.5 w-3.5" />Device Selection</span>
                    <span className="rounded-full border border-indigo-300/35 bg-indigo-500/14 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-indigo-100">OPEN</span>
                  </div>
                </motion.button>

                <motion.button
                  onClick={() => setLowBandwidthMode((prev) => !prev)}
                  whileTap={{ scale: 0.985 }}
                  className={`w-full rounded-lg border px-3 py-2 text-left transition-all duration-300 hover:-translate-y-0.5 ${lowBandwidthMode ? "border-amber-300/45 bg-amber-500/16 text-amber-100" : "border-white/15 bg-white/5 text-white/85 hover:bg-white/10"}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span><Radio className="mr-2 inline h-3.5 w-3.5" />{lowBandwidthMode ? "Disable Low Bandwidth Mode" : "Enable Low Bandwidth Mode"}</span>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide ${lowBandwidthMode ? "border-amber-300/45 bg-amber-500/20 text-amber-100" : "border-slate-300/30 bg-slate-500/20 text-slate-200"}`}>{lowBandwidthMode ? "ON" : "OFF"}</span>
                  </div>
                </motion.button>

                <motion.button
                  onClick={() => setBackgroundBlurEnabled((prev) => !prev)}
                  whileTap={{ scale: 0.985 }}
                  className={`w-full rounded-lg border px-3 py-2 text-left transition-all duration-300 hover:-translate-y-0.5 ${backgroundBlurEnabled ? "border-sky-300/45 bg-sky-500/16 text-sky-100" : "border-white/15 bg-white/5 text-white/85 hover:bg-white/10"}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span><Camera className="mr-2 inline h-3.5 w-3.5" />{backgroundBlurEnabled ? "Disable Background Blur" : "Enable Background Blur"}</span>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide ${backgroundBlurEnabled ? "border-sky-300/45 bg-sky-500/20 text-sky-100" : "border-slate-300/30 bg-slate-500/20 text-slate-200"}`}>{backgroundBlurEnabled ? "ON" : "OFF"}</span>
                  </div>
                </motion.button>

                <motion.button
                  onClick={() => setDemoMode((prev) => !prev)}
                  whileTap={{ scale: 0.985 }}
                  className={`w-full rounded-lg border px-3 py-2 text-left transition-all duration-300 hover:-translate-y-0.5 ${demoMode ? "border-fuchsia-300/45 bg-fuchsia-500/16 text-fuchsia-100" : "border-white/15 bg-white/5 text-white/85 hover:bg-white/10"}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span><Users className="mr-2 inline h-3.5 w-3.5" />{demoMode ? "Disable Demo Participants" : "Enable Demo Participants"}</span>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide ${demoMode ? "border-fuchsia-300/45 bg-fuchsia-500/20 text-fuchsia-100" : "border-slate-300/30 bg-slate-500/20 text-slate-200"}`}>{demoMode ? "ON" : "OFF"}</span>
                  </div>
                </motion.button>
                {isHost && (
                  <button onClick={hostEndMeeting} className="w-full rounded-lg border border-red-300/35 bg-red-500/20 px-3 py-2 text-left font-semibold text-red-100">
                    <LogOut className="mr-2 inline h-3.5 w-3.5" />
                    End Meeting For All
                  </button>
                )}
              </div>
            )}
          </div>

          {suspiciousWarnings.length > 0 && (
            <div className="op-security-alerts rounded-2xl border border-amber-500/30 bg-amber-50 p-3 transition-colors duration-300 dark:border-amber-300/30 dark:bg-amber-500/10">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-900 dark:text-amber-100">
                Security Alerts
              </div>
              <div className="max-h-45 space-y-1 overflow-y-auto pr-1 text-xs">
                {suspiciousWarnings.map((w, i) => (
                  <div
                    key={`${w}-${i}`}
                    className="rounded border border-amber-200/70 bg-amber-100/90 px-2 py-1.5 font-medium text-amber-950 dark:border-transparent dark:bg-black/15 dark:text-amber-50"
                  >
                    {w}
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </main>

      <div
        className={`fixed left-1/2 z-90 -translate-x-1/2 transition-all duration-300 ${isFullscreen ? "bottom-6" : "bottom-4"} ${isFullscreen ? (isDockVisible ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-4") : "opacity-100"}`}
        onMouseMove={revealDock}
        onMouseEnter={keepDockVisible}
        onMouseLeave={revealDock}
        onClick={revealDock}
      >
        <div className={`flex flex-wrap items-center justify-center gap-2 border border-white/15 bg-[#0B1020]/88 px-3 py-2 shadow-[0_14px_34px_rgba(0,0,0,0.35)] backdrop-blur-md ${isFullscreen ? "rounded-2xl max-w-[94vw]" : "rounded-2xl"}`}>
          <ControlIconButton onClick={toggleMic} icon={micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />} label={micOn ? "Mic On" : "Mic Off"} active={micOn} />
          <ControlIconButton onClick={() => setMonitorLocalAudio((prev) => !prev)} icon={monitorLocalAudio ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />} label={monitorLocalAudio ? "Voice Monitor On" : "Voice Monitor Off"} active={monitorLocalAudio} />
          <ControlIconButton onClick={toggleCamera} icon={cameraOn ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />} label={cameraOn ? "Cam On" : "Cam Off"} active={cameraOn} />
          <ControlIconButton onClick={isScreenSharing ? stopScreenShare : openScreenShare} icon={isScreenSharing ? <Video className="h-4 w-4" /> : <Share2 className="h-4 w-4" />} label={isScreenSharing ? "Stop Screen Share" : "Screen Share"} active={isScreenSharing} />
          <ControlIconButton onClick={() => setShowInviteModal(true)} icon={<Send className="h-4 w-4" />} label="Invite Share" />
          <ControlIconButton
            onClick={toggleRaiseHand}
            icon={<Hand className={`h-4 w-4 ${selfParticipant?.handRaised ? 'text-indigo-300 animate-pulse' : ''}`} />}
            label={selfParticipant?.handRaised ? "Lower Hand" : "Raise Hand"}
            active={Boolean(selfParticipant?.handRaised)}
          />
          <ControlIconButton onClick={() => setShowReactionMenu((prev) => !prev)} icon={<Smile className="h-4 w-4" />} label="React" active={showReactionMenu} />
          <ControlIconButton onClick={toggleFullscreen} icon={<Expand className="h-4 w-4" />} label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"} active={isFullscreen} />
          {isHost && <ControlIconButton onClick={togglePauseInterview} icon={roomPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />} label={roomPaused ? "Resume Interview" : "Pause Interview"} active={roomPaused} />}
          <ControlIconButton onClick={() => togglePanel("participants")} icon={<Users className="h-4 w-4" />} label="Participants" active={panel === "participants"} />
          <ControlIconButton onClick={() => togglePanel("chat")} icon={<MessagesSquare className="h-4 w-4" />} label="Chat" badge={unreadChatCount} active={panel === "chat"} />
          <ControlIconButton onClick={() => togglePanel("analytics")} icon={<ChartNoAxesCombined className="h-4 w-4" />} label="Analytics" active={panel === "analytics"} />
          <ControlIconButton onClick={() => togglePanel("transcript")} icon={<Activity className="h-4 w-4" />} label="Transcript" active={panel === "transcript"} />
          <ControlIconButton onClick={() => togglePanel("settings")} icon={<Settings className="h-4 w-4" />} label="Settings" active={panel === "settings"} />
          <ControlIconButton onClick={() => setShowLeaveModal(true)} icon={<DoorOpen className="h-4 w-4" />} label="Leave" danger />
        </div>
        <AnimatePresence>
          {showReactionMenu && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="absolute bottom-14 left-1/2 z-90 -translate-x-1/2 rounded-2xl border border-white/15 bg-[#0D1424]/95 p-2 backdrop-blur-sm">
              <div className="grid grid-cols-7 gap-1">
                {reactionOptions.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      sendReaction(emoji);
                      setShowReactionMenu(false);
                    }}
                    className="rounded-lg border border-white/10 bg-white/6 px-2 py-1 text-base transition hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-cyan-500/18"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {floatingReactions.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 40, x: 0, scale: 0.7 }}
            animate={{ opacity: 1, y: -220, x: Math.random() * 120 - 60, scale: 1.05 }}
            exit={{ opacity: 0, y: -260, scale: 0.8 }}
            transition={{ duration: 2.1, ease: "easeOut" }}
            className="pointer-events-none fixed bottom-18 left-1/2 z-70 -translate-x-1/2 rounded-full border border-white/15 bg-black/35 px-3 py-1.5 text-sm text-white"
          >
            <span className="mr-1 text-lg">{item.emoji}</span>
            <span className="text-xs text-white/80">{item.name}</span>
          </motion.div>
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {publicProfile && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-94 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm" onClick={() => setPublicProfile(null)}>
            <motion.div initial={{ opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.98 }} className="w-full max-w-md rounded-2xl border border-white/12 bg-[#0D1424] p-5" onClick={(e) => e.stopPropagation()}>
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <UserAvatar src={publicProfile.avatar} name={publicProfile.name} size={48} online host={publicProfile.isHost} />
                  <div>
                    <div className="text-base font-bold text-white">{publicProfile.name}</div>
                    <div className="text-xs text-cyan-200/85">{publicProfile.role}</div>
                  </div>
                </div>
                <button onClick={() => setPublicProfile(null)} className="rounded-lg border border-white/15 bg-white/8 px-2 py-1 text-xs font-semibold text-white/75 hover:bg-white/12">Close</button>
              </div>

              <div className="mb-3 flex flex-wrap gap-1.5 text-[11px]">
                <span className={`rounded-md border px-2 py-1 font-semibold ${publicProfile.micOn ? "border-emerald-300/35 bg-emerald-500/15 text-emerald-100" : "border-rose-300/35 bg-rose-500/15 text-rose-100"}`}>{publicProfile.micOn ? "Mic On" : "Mic Off"}</span>
                <span className={`rounded-md border px-2 py-1 font-semibold ${publicProfile.cameraOn ? "border-sky-300/35 bg-sky-500/15 text-sky-100" : "border-slate-300/30 bg-slate-500/18 text-slate-100"}`}>{publicProfile.cameraOn ? "Cam On" : "Cam Off"}</span>
                {publicProfile.isHost && <span className="rounded-md border border-amber-300/35 bg-amber-500/15 px-2 py-1 font-semibold text-amber-100">Host</span>}
                {publicProfile.isYou && <span className="rounded-md border border-violet-300/35 bg-violet-500/15 px-2 py-1 font-semibold text-violet-100">You</span>}
              </div>

              <div className="mb-2 rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-white/75">{publicProfile.bio}</div>
              {publicProfile.skills.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {publicProfile.skills.slice(0, 8).map((skill) => (
                    <span key={skill} className="rounded-md border border-white/15 bg-white/6 px-2 py-1 text-[11px] font-semibold text-white/80">{skill}</span>
                  ))}
                </div>
              )}
              <div className="text-[11px] text-white/45">Joined {new Date(publicProfile.joinedAt).toLocaleString()}</div>

              {publicProfile.isYou && (
                <div className="mt-4">
                  <button onClick={() => navigate("/profile")} className="rounded-lg border border-cyan-300/40 bg-cyan-500/15 px-3 py-1.5 text-xs font-semibold text-cyan-100 hover:bg-cyan-500/25">
                    Open My Profile
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {showInviteModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-90 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.98 }} className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0E1424] p-5">
              <h3 className="mb-1 text-lg font-bold text-white">Share Interview Invite</h3>
              <p className="mb-4 text-sm text-white/60">Send this secure invite to participants.</p>
              <div className="space-y-3 text-xs">
                <div className="rounded-lg border border-white/10 bg-white/5 p-2">
                  <div className="mb-1 text-white/45">Invite URL</div>
                  <div className="truncate text-white/85">{inviteLink}</div>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div className="rounded-lg border border-white/10 bg-white/5 p-2">
                    <div className="text-white/45">Room ID</div>
                    <div className="font-semibold text-white/90">{roomId}</div>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/5 p-2">
                    <div className="text-white/45">Passcode</div>
                    <div className="font-semibold text-white/90">{passcode}</div>
                  </div>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-2">
                  <div className="text-white/45">Invite Token</div>
                  <div className="truncate font-semibold text-cyan-200">{inviteToken}</div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={copyInviteLink} className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${copiedKey === "invite" ? "border-emerald-300/45 bg-emerald-500/15 text-emerald-200" : "border-white/15 bg-white/8 text-white/90 hover:bg-white/12"}`}><Copy className="mr-1 inline h-3.5 w-3.5" />{copiedKey === "invite" ? "Copied ✓" : "Copy Invite"}</button>
                <button onClick={copyRoomId} className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${copiedKey === "room" ? "border-emerald-300/45 bg-emerald-500/15 text-emerald-200" : "border-white/15 bg-white/8 text-white/90 hover:bg-white/12"}`}><Copy className="mr-1 inline h-3.5 w-3.5" />{copiedKey === "room" ? "Copied ✓" : "Copy Room ID"}</button>
                <button onClick={copyPasscode} className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${copiedKey === "pass" ? "border-emerald-300/45 bg-emerald-500/15 text-emerald-200" : "border-white/15 bg-white/8 text-white/90 hover:bg-white/12"}`}><Copy className="mr-1 inline h-3.5 w-3.5" />{copiedKey === "pass" ? "Copied ✓" : "Copy Passcode"}</button>
                <button onClick={shareInvite} className="rounded-lg border border-cyan-300/40 bg-cyan-500/15 px-3 py-2 text-xs font-semibold text-cyan-100 hover:bg-cyan-500/25"><Share2 className="mr-1 inline h-3.5 w-3.5" />Share</button>
              </div>
              <div className="mt-4 text-right">
                <button onClick={() => setShowInviteModal(false)} className="rounded-lg border border-white/15 bg-white/6 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeviceModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-93 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm dark:bg-black/60" onClick={() => setShowDeviceModal(false)}>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="op-device-modal w-full max-w-lg rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.12)] transition-colors duration-300 dark:border-white/10 dark:bg-[#0E1424] dark:shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="mb-3 text-lg font-bold text-zinc-900 dark:text-white">Device Selection</h3>
              <div className="space-y-3 text-sm">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-zinc-600 dark:text-white/60">Camera</span>
                  <select
                    value={selectedVideoDeviceId}
                    onChange={(e) => setSelectedVideoDeviceId(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors duration-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-white/15 dark:bg-[#20283C] dark:text-white dark:focus:border-indigo-400/75 dark:focus:ring-indigo-400/20"
                  >
                    {availableCameras.map((cam) => (
                      <option key={cam.deviceId} value={cam.deviceId} className="bg-white text-zinc-900 dark:bg-[#20283C] dark:text-white">
                        {cam.label || `Camera ${cam.deviceId.slice(0, 6)}`}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-zinc-600 dark:text-white/60">Microphone</span>
                  <select
                    value={selectedAudioDeviceId}
                    onChange={(e) => setSelectedAudioDeviceId(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors duration-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-white/15 dark:bg-[#20283C] dark:text-white dark:focus:border-indigo-400/75 dark:focus:ring-indigo-400/20"
                  >
                    {availableMics.map((mic) => (
                      <option key={mic.deviceId} value={mic.deviceId} className="bg-white text-zinc-900 dark:bg-[#20283C] dark:text-white">
                        {mic.label || `Microphone ${mic.deviceId.slice(0, 6)}`}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => setShowDeviceModal(false)}
                  className="rounded-lg border border-zinc-200 bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-800 transition hover:bg-zinc-50 dark:border-white/15 dark:bg-white/8 dark:text-white/85 dark:hover:bg-white/12"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { setShowDeviceModal(false); void startMedia(true); }}
                  className="rounded-lg border border-cyan-600/25 bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-800 transition hover:bg-cyan-100 dark:border-cyan-300/40 dark:bg-cyan-500/15 dark:text-cyan-100 dark:hover:bg-cyan-500/25"
                >
                  Apply Devices
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLeaveModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-95 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setShowLeaveModal(false)}>
            <motion.div initial={{ opacity: 0, y: 14, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.96 }} className="w-full max-w-md rounded-2xl border border-white/12 bg-[#0B1222] p-5" onClick={(e) => e.stopPropagation()}>
              <h3 className="mb-2 text-xl font-bold">Leave Interview?</h3>
              <p className="mb-5 text-sm text-white/65">Are you sure you want to leave this interview session?</p>
              <div className="flex gap-2">
                <button className="flex-1 rounded-xl border border-white/15 bg-white/6 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/12" onClick={() => setShowLeaveModal(false)}>
                  Stay
                </button>
                <button className="flex-1 rounded-xl border border-red-300/35 bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-100 hover:bg-red-500/35" onClick={leaveRoomAndExit}>
                  Leave Interview
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFinalSubmitModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-95 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setShowFinalSubmitModal(false)}>
            <motion.div initial={{ opacity: 0, y: 14, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.96 }} className="w-full max-w-md rounded-2xl border border-white/12 bg-[#0B1222] p-5" onClick={(e) => e.stopPropagation()}>
              <h3 className="mb-2 text-xl font-bold">Submit Final Interview?</h3>
              <p className="mb-5 text-sm text-white/65">Are you sure you want to submit now, or do you want to stay and continue editing answers?</p>
              <div className="flex gap-2">
                <button className="flex-1 rounded-xl border border-white/15 bg-white/6 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/12" onClick={() => setShowFinalSubmitModal(false)}>
                  Stay
                </button>
                <button
                  className="flex-1 rounded-xl border border-red-300/35 bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-100 hover:bg-red-500/35"
                  onClick={() => {
                    setShowFinalSubmitModal(false);
                    void endInterview();
                  }}
                >
                  Submit Final
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showSummary && (
        <div className="fixed inset-0 z-80 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0E1424] p-6">
            <h3 className="mb-2 text-xl font-bold">Interview Complete</h3>
            <p className="mb-4 text-sm text-white/60">AI-generated feedback and scoring are ready.</p>
            <div className="mb-5 rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
              Score: {scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : "0.0"}/10
            </div>
            <div className="flex gap-2">
              <button onClick={() => navigate("/history", { state: { refresh: true } })} className="flex-1 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold">
                View History
              </button>
              <button onClick={() => navigate("/")} className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85">
                Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
