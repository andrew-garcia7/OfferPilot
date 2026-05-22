import type { Server, Socket } from "socket.io";

interface ParticipantState {
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
}

interface JoinRequest {
  socketId: string;
  roomId: string;
  passcode?: string;
  name: string;
  userId: string;
  avatar?: string | null;
}

interface ChatMessage {
  id: string;
  participantId: string;
  name: string;
  text: string;
  ts: number;
}

interface RoomState {
  id: string;
  passcode: string;
  hostId: string;
  locked: boolean;
  examMode: boolean;
  paused: boolean;
  requireApproval: boolean;
  createdAt: number;
  participants: Map<string, ParticipantState>;
  joinQueue: Map<string, JoinRequest>;
  attendance: Array<{ participantId: string; name: string; joinedAt: number; leftAt?: number }>;
  chat: ChatMessage[];
}

interface RoomCreatePayload {
  roomId?: string;
  passcode?: string;
  name?: string;
  userId?: string;
  avatar?: string;
}

interface RoomJoinPayload {
  roomId: string;
  passcode?: string;
  name?: string;
  userId?: string;
  avatar?: string;
  allowCreateIfMissing?: boolean;
}

interface RoomAdminTargetPayload {
  roomId: string;
  participantId: string;
}

interface UpdateSelfPayload {
  roomId: string;
  micOn?: boolean;
  cameraOn?: boolean;
  handRaised?: boolean;
  isScreenSharing?: boolean;
  reaction?: string | null;
}

interface RoomSettingsPayload {
  roomId: string;
  locked?: boolean;
  examMode?: boolean;
  requireApproval?: boolean;
}

interface ChatSendPayload {
  roomId: string;
  text: string;
}

interface ChatTypingPayload {
  roomId: string;
  typing: boolean;
}

interface SignalPayload {
  roomId: string;
  to: string;
  from?: string;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
}

const rooms = new Map<string, RoomState>();

function randomRoomId(): string {
  return `ROOM-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function randomPasscode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function safeName(name?: string): string {
  const v = (name || "Guest").trim();
  return v.slice(0, 40) || "Guest";
}

function safeUserId(userId?: string): string {
  return (userId || "anon").trim().slice(0, 60) || "anon";
}

function safeAvatar(avatar?: string): string | null {
  const value = (avatar || "").trim();
  if (!value || value === "null" || value === "undefined") {
    return null;
  }
  if (value.startsWith("data:image/")) {
    return value.length > 80_000 ? null : value;
  }
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value.length > 2048 ? value.slice(0, 2048) : value;
  }
  return value.length > 512 ? null : value;
}

function emitRoomState(io: Server, room: RoomState): void {
  io.to(room.id).emit("room:state", {
    roomId: room.id,
    passcodeHint: room.passcode.slice(-2).padStart(room.passcode.length, "*"),
    locked: room.locked,
    examMode: room.examMode,
    paused: room.paused,
    requireApproval: room.requireApproval,
    createdAt: room.createdAt,
    participants: Array.from(room.participants.values()),
    joinQueue: Array.from(room.joinQueue.values()).map((j) => ({ socketId: j.socketId, name: j.name, userId: j.userId })),
    attendance: room.attendance,
    meetingDurationSec: Math.max(0, Math.floor((Date.now() - room.createdAt) / 1000)),
  });
}

function getRoomBySocket(socket: Socket): RoomState | undefined {
  const roomId = socket.data.roomId as string | undefined;
  return roomId ? rooms.get(roomId) : undefined;
}

function leaveRoom(io: Server, socket: Socket): void {
  const room = getRoomBySocket(socket);
  if (!room) {
    return;
  }

  const participant = room.participants.get(socket.id);
  if (participant) {
    room.participants.delete(socket.id);
    room.attendance = room.attendance.map((row) =>
      row.participantId === participant.id && row.leftAt === undefined
        ? { ...row, leftAt: Date.now() }
        : row
    );

    if (participant.isHost && room.participants.size > 0) {
      const nextHost = Array.from(room.participants.values())[0];
      if (nextHost) {
        nextHost.isHost = true;
        room.hostId = nextHost.id;
        io.to(room.id).emit("room:host-changed", { participantId: nextHost.id, name: nextHost.name });
      }
    }

    io.to(room.id).emit("room:participant-left", { participantId: socket.id });
  }

  room.joinQueue.delete(socket.id);
  socket.leave(room.id);
  socket.data.roomId = undefined;

  if (room.participants.size === 0) {
    rooms.delete(room.id);
    return;
  }

  emitRoomState(io, room);
}

function assertHost(socket: Socket, room: RoomState): boolean {
  return room.hostId === socket.id;
}

export function registerInterviewRealtime(io: Server): void {
  io.on("connection", (socket) => {
    socket.on("room:create", (payload: RoomCreatePayload = {}) => {
      leaveRoom(io, socket);

      const roomId = (payload.roomId || randomRoomId()).toUpperCase();
      const passcode = payload.passcode || randomPasscode();
      const name = safeName(payload.name);
      const userId = safeUserId(payload.userId);

      const participant: ParticipantState = {
        id: socket.id,
        userId,
        name,
        avatar: safeAvatar(payload.avatar),
        isHost: true,
        joinedAt: Date.now(),
        micOn: true,
        cameraOn: true,
        handRaised: false,
        isScreenSharing: false,
        reaction: null,
        micBlockedByHost: false,
        cameraBlockedByHost: false,
      };

      const existing = rooms.get(roomId);
      const room: RoomState =
        existing ||
        {
          id: roomId,
          passcode,
          hostId: socket.id,
          locked: false,
          examMode: false,
          paused: false,
          requireApproval: true,
          createdAt: Date.now(),
          participants: new Map<string, ParticipantState>(),
          joinQueue: new Map<string, JoinRequest>(),
          attendance: [],
          chat: [],
        };

      room.passcode = passcode;
      room.hostId = socket.id;
      room.participants.set(socket.id, participant);
      room.attendance.push({ participantId: participant.id, name: participant.name, joinedAt: participant.joinedAt });
      rooms.set(roomId, room);

      socket.join(roomId);
      socket.data.roomId = roomId;

      socket.emit("room:created", {
        roomId,
        passcode,
      });

      emitRoomState(io, room);
    });

    socket.on("room:join", (payload: RoomJoinPayload) => {
      if (!payload || !payload.roomId) {
        socket.emit("room:error", { message: "Room id is required." });
        return;
      }

      leaveRoom(io, socket);

      const roomId = payload.roomId.toUpperCase();
      let room = rooms.get(roomId);
      if (!room) {
        if (!payload.allowCreateIfMissing) {
          socket.emit("room:error", { message: "Room not found." });
          return;
        }

        const createdPasscode = payload.passcode || randomPasscode();
        room = {
          id: roomId,
          passcode: createdPasscode,
          hostId: socket.id,
          locked: false,
          examMode: false,
          paused: false,
          requireApproval: true,
          createdAt: Date.now(),
          participants: new Map<string, ParticipantState>(),
          joinQueue: new Map<string, JoinRequest>(),
          attendance: [],
          chat: [],
        };

        const host: ParticipantState = {
          id: socket.id,
          userId: safeUserId(payload.userId),
          name: safeName(payload.name),
          avatar: safeAvatar(payload.avatar),
          isHost: true,
          joinedAt: Date.now(),
          micOn: true,
          cameraOn: true,
          handRaised: false,
          isScreenSharing: false,
          reaction: null,
          micBlockedByHost: false,
          cameraBlockedByHost: false,
        };

        room.participants.set(socket.id, host);
        room.attendance.push({ participantId: host.id, name: host.name, joinedAt: host.joinedAt });
        rooms.set(roomId, room);

        socket.join(roomId);
        socket.data.roomId = roomId;
        socket.emit("room:created", { roomId, passcode: createdPasscode });
        emitRoomState(io, room);
        return;
      }

      if (room.locked) {
        socket.emit("room:error", { message: "Room is locked by host." });
        return;
      }

      if (room.passcode !== (payload.passcode || "")) {
        socket.emit("room:error", { message: "Invalid room passcode." });
        return;
      }

      const request: JoinRequest = {
        socketId: socket.id,
        roomId,
        passcode: payload.passcode,
        name: safeName(payload.name),
        userId: safeUserId(payload.userId),
        avatar: safeAvatar(payload.avatar),
      };

      if (room.requireApproval) {
        room.joinQueue.set(socket.id, request);
        socket.emit("room:join-pending", { roomId });
        io.to(room.hostId).emit("room:join-request", { socketId: socket.id, name: request.name, userId: request.userId });
        emitRoomState(io, room);
        return;
      }

      const participant: ParticipantState = {
        id: socket.id,
        userId: request.userId,
        name: request.name,
        avatar: safeAvatar(payload.avatar),
        isHost: false,
        joinedAt: Date.now(),
        micOn: true,
        cameraOn: true,
        handRaised: false,
        isScreenSharing: false,
        reaction: null,
        micBlockedByHost: false,
        cameraBlockedByHost: false,
      };

      room.participants.set(socket.id, participant);
      room.attendance.push({ participantId: participant.id, name: participant.name, joinedAt: participant.joinedAt });
      socket.join(roomId);
      socket.data.roomId = roomId;

      socket.emit("room:joined", { roomId, participantId: socket.id, hostId: room.hostId });
      io.to(roomId).emit("room:participant-joined", participant);
      emitRoomState(io, room);
    });

    socket.on("room:approve-join", (payload: { roomId: string; socketId: string; approve: boolean }) => {
      const room = rooms.get(payload?.roomId?.toUpperCase() || "");
      if (!room || !assertHost(socket, room)) {
        return;
      }

      const request = room.joinQueue.get(payload.socketId);
      if (!request) {
        return;
      }

      room.joinQueue.delete(payload.socketId);

      if (!payload.approve) {
        io.to(payload.socketId).emit("room:error", { message: "Host rejected the join request." });
        emitRoomState(io, room);
        return;
      }

      const participant: ParticipantState = {
        id: request.socketId,
        userId: request.userId,
        name: request.name,
        avatar: request.avatar || null,
        isHost: false,
        joinedAt: Date.now(),
        micOn: true,
        cameraOn: true,
        handRaised: false,
        isScreenSharing: false,
        reaction: null,
        micBlockedByHost: false,
        cameraBlockedByHost: false,
      };

      room.participants.set(request.socketId, participant);
      room.attendance.push({ participantId: participant.id, name: participant.name, joinedAt: participant.joinedAt });
      const targetSocket = io.sockets.sockets.get(request.socketId);
      if (targetSocket) {
        targetSocket.join(room.id);
        targetSocket.data.roomId = room.id;
        targetSocket.emit("room:joined", { roomId: room.id, participantId: request.socketId, hostId: room.hostId });
      }

      io.to(room.id).emit("room:participant-joined", participant);
      emitRoomState(io, room);
    });

    socket.on("room:update-self", (payload: UpdateSelfPayload) => {
      const room = rooms.get(payload?.roomId?.toUpperCase() || "");
      if (!room) {
        return;
      }

      const participant = room.participants.get(socket.id);
      if (!participant) {
        return;
      }

      if (typeof payload.micOn === "boolean") {
        participant.micOn = participant.micBlockedByHost ? false : payload.micOn;
      }
      if (typeof payload.cameraOn === "boolean") {
        participant.cameraOn = participant.cameraBlockedByHost ? false : payload.cameraOn;
      }
      if (typeof payload.handRaised === "boolean") {
        participant.handRaised = payload.handRaised;
      }
      if (typeof payload.isScreenSharing === "boolean") {
        participant.isScreenSharing = payload.isScreenSharing;
      }
      if (typeof payload.reaction === "string" || payload.reaction === null) {
        participant.reaction = payload.reaction;
      }

      io.to(room.id).emit("room:participant-updated", participant);
      emitRoomState(io, room);
    });

    socket.on("room:update-settings", (payload: RoomSettingsPayload) => {
      const room = rooms.get(payload?.roomId?.toUpperCase() || "");
      if (!room || !assertHost(socket, room)) {
        return;
      }

      if (typeof payload.locked === "boolean") {
        room.locked = payload.locked;
      }
      if (typeof payload.examMode === "boolean") {
        room.examMode = payload.examMode;
      }
      if (typeof payload.requireApproval === "boolean") {
        room.requireApproval = payload.requireApproval;
      }

      io.to(room.id).emit("room:settings-updated", {
        locked: room.locked,
        examMode: room.examMode,
        requireApproval: room.requireApproval,
      });
      emitRoomState(io, room);
    });

    socket.on("room:pause", (payload: { roomId: string; paused: boolean }) => {
      const room = rooms.get(payload?.roomId?.toUpperCase() || "");
      if (!room || !assertHost(socket, room)) {
        return;
      }

      room.paused = Boolean(payload.paused);
      io.to(room.id).emit("room:paused", {
        paused: room.paused,
        by: socket.id,
      });
      emitRoomState(io, room);
    });

    socket.on("room:mute-user", (payload: RoomAdminTargetPayload) => {
      const room = rooms.get(payload?.roomId?.toUpperCase() || "");
      if (!room || !assertHost(socket, room)) {
        return;
      }

      const participant = room.participants.get(payload.participantId);
      if (!participant) {
        return;
      }

      participant.micOn = false;
      io.to(payload.participantId).emit("room:force-mute", { by: socket.id });
      io.to(room.id).emit("room:participant-updated", participant);
      emitRoomState(io, room);
    });

    socket.on("room:set-media-access", (payload: { roomId: string; participantId: string; micBlocked?: boolean; cameraBlocked?: boolean }) => {
      const room = rooms.get(payload?.roomId?.toUpperCase() || "");
      if (!room || !assertHost(socket, room)) {
        return;
      }

      const participant = room.participants.get(payload.participantId);
      if (!participant) {
        return;
      }

      if (typeof payload.micBlocked === "boolean") {
        participant.micBlockedByHost = payload.micBlocked;
        if (payload.micBlocked) {
          participant.micOn = false;
        }
      }
      if (typeof payload.cameraBlocked === "boolean") {
        participant.cameraBlockedByHost = payload.cameraBlocked;
        if (payload.cameraBlocked) {
          participant.cameraOn = false;
        }
      }

      io.to(payload.participantId).emit("room:media-access-updated", {
        micBlockedByHost: participant.micBlockedByHost,
        cameraBlockedByHost: participant.cameraBlockedByHost,
      });
      io.to(room.id).emit("room:participant-updated", participant);
      emitRoomState(io, room);
    });

    socket.on("room:remove-user", (payload: RoomAdminTargetPayload) => {
      const room = rooms.get(payload?.roomId?.toUpperCase() || "");
      if (!room || !assertHost(socket, room)) {
        return;
      }

      const targetSocket = io.sockets.sockets.get(payload.participantId);
      if (targetSocket) {
        targetSocket.emit("room:removed", { by: socket.id });
        leaveRoom(io, targetSocket);
      }
      emitRoomState(io, room);
    });

    socket.on("room:end", (payload: { roomId: string }) => {
      const room = rooms.get(payload?.roomId?.toUpperCase() || "");
      if (!room || !assertHost(socket, room)) {
        return;
      }

      io.to(room.id).emit("room:ended", { by: socket.id });
      for (const participant of room.participants.values()) {
        const targetSocket = io.sockets.sockets.get(participant.id);
        if (targetSocket) {
          targetSocket.leave(room.id);
          targetSocket.data.roomId = undefined;
        }
      }
      rooms.delete(room.id);
    });

    socket.on("chat:send", (payload: ChatSendPayload) => {
      const room = rooms.get(payload?.roomId?.toUpperCase() || "");
      if (!room) {
        return;
      }
      const participant = room.participants.get(socket.id);
      if (!participant || !payload.text?.trim()) {
        return;
      }

      const msg: ChatMessage = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        participantId: participant.id,
        name: participant.name,
        text: payload.text.trim().slice(0, 500),
        ts: Date.now(),
      };
      room.chat.push(msg);
      if (room.chat.length > 200) {
        room.chat.shift();
      }
      io.to(room.id).emit("chat:new", msg);
    });

    socket.on("chat:typing", (payload: ChatTypingPayload) => {
      const room = rooms.get(payload?.roomId?.toUpperCase() || "");
      if (!room) {
        return;
      }
      const participant = room.participants.get(socket.id);
      if (!participant) {
        return;
      }

      socket.to(room.id).emit("chat:typing", {
        participantId: participant.id,
        name: participant.name,
        typing: Boolean(payload.typing),
      });
    });

    socket.on("webrtc:offer", (payload: SignalPayload) => {
      io.to(payload.to).emit("webrtc:offer", { ...payload, from: socket.id });
    });

    socket.on("webrtc:answer", (payload: SignalPayload) => {
      io.to(payload.to).emit("webrtc:answer", { ...payload, from: socket.id });
    });

    socket.on("webrtc:ice-candidate", (payload: SignalPayload) => {
      io.to(payload.to).emit("webrtc:ice-candidate", { ...payload, from: socket.id });
    });

    socket.on("disconnect", () => {
      leaveRoom(io, socket);
    });
  });
}
