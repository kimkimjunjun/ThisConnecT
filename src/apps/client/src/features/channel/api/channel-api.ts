import { publicApi, privateApi } from "@/shared/api";
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

export type ChannelRoomPage = {
  rooms: ChannelRoom[];
  nextCursor: number | null;
  hasNext: boolean;
};

export const getChannels = () =>
  publicApi.get<Channel[]>(END_POINT.CHANNEL.LIST).then((r) => r.data);

export const getChannelRoomsCursor = (
  channelId: number | string,
  cursor?: number | null,
  keyword?: string,
  size = 20,
) => {
  const params: Record<string, string | number> = { size };
  if (cursor != null) params.cursor = cursor;
  if (keyword) params.keyword = keyword;
  return publicApi
    .get<ChannelRoomPage>(END_POINT.CHANNEL.ROOMS(channelId), { params })
    .then((r) => r.data);
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

export const createChannel = (name: string) =>
  privateApi
    .post<Channel>(END_POINT.CHANNEL.LIST, { name })
    .then((r) => r.data);

type CreateRoomBody = { title: string; maxCount: number };

export const createRoom = (channelId: number | string, body: CreateRoomBody) =>
  privateApi
    .post<ChannelRoom>(END_POINT.CHANNEL.ROOMS(channelId), body)
    .then((r) => r.data);

type UpdateRoomBody = { title?: string; maxCount?: number };

export const updateRoom = (
  channelId: number | string,
  roomId: number | string,
  body: UpdateRoomBody,
) =>
  privateApi
    .patch<ChannelRoom>(END_POINT.CHANNEL.ROOM(channelId, roomId), body)
    .then((r) => r.data);

export const deleteChannel = (channelId: number | string) =>
  privateApi
    .delete<void>(END_POINT.CHANNEL.DETAIL(channelId))
    .then((r) => r.data);

export const deleteRoom = (
  channelId: number | string,
  roomId: number | string,
) =>
  privateApi
    .delete<void>(END_POINT.CHANNEL.ROOM(channelId, roomId))
    .then((r) => r.data);
