import { fetchAPI } from "@/shared/api";
import { END_POINT } from "@/shared/api/endpoint";

export type Channel = {
  id: number;
  name: string;
};

export type ChannelRoom = {
  id: number;
  channelId: number;
  title: string;
  currentCount: number;
  maxCount: number;
};

export const getChannels = () => fetchAPI<Channel[]>(END_POINT.CHANNEL.LIST);

export const createChannel = (name: string) =>
  fetchAPI<Channel>(END_POINT.CHANNEL.LIST, {
    method: "POST",
    body: JSON.stringify({ name }),
  });

export type ChannelRoomPage = {
  rooms: ChannelRoom[];
  nextCursor: number | null;
  hasNext: boolean;
};

export const getChannelRooms = (channelId: number | string) =>
  fetchAPI<ChannelRoom[]>(END_POINT.CHANNEL.ROOMS(channelId));

export const getChannelRoomsCursor = (
  channelId: number | string,
  cursor?: number | null,
  keyword?: string,
  size = 20,
) => {
  const params = new URLSearchParams({ size: String(size) });
  if (cursor != null) params.set("cursor", String(cursor));
  if (keyword) params.set("keyword", keyword);
  return fetchAPI<ChannelRoomPage>(
    `${END_POINT.CHANNEL.ROOMS(channelId)}?${params}`,
  );
};

// cursor = roomId - 1, size = 1 로 해당 방 하나만 정확히 조회
export const getRoomById = (
  channelId: number | string,
  roomId: number | string,
): Promise<ChannelRoom | null> => {
  const numId = Number(roomId);
  return getChannelRoomsCursor(channelId, numId - 1, undefined, 1).then(
    (page) => page.rooms.find((r) => r.id === numId) ?? null,
  );
};

type CreateRoomBody = { title: string; maxCount: number };

export const createRoom = (channelId: number | string, body: CreateRoomBody) =>
  fetchAPI<ChannelRoom>(END_POINT.CHANNEL.ROOMS(channelId), {
    method: "POST",
    body: JSON.stringify(body),
  });

type UpdateRoomBody = { title?: string; maxCount?: number };

export const updateRoom = (
  channelId: number | string,
  roomId: number | string,
  body: UpdateRoomBody,
) =>
  fetchAPI<ChannelRoom>(END_POINT.CHANNEL.ROOM(channelId, roomId), {
    method: "PATCH",
    body: JSON.stringify(body),
  });

export const deleteChannel = (channelId: number | string) =>
  fetchAPI<void>(END_POINT.CHANNEL.DETAIL(channelId), { method: "DELETE" });

export const deleteRoom = (
  channelId: number | string,
  roomId: number | string,
) =>
  fetchAPI<void>(END_POINT.CHANNEL.ROOM(channelId, roomId), {
    method: "DELETE",
  });
