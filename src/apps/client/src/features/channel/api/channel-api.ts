import { fetchAPI } from '@/shared/api'
import { END_POINT } from '@/shared/api/endpoint'

export type Channel = {
  id: number
  name: string
}

export type ChannelRoom = {
  id: number
  channelId: number
  title: string
  currentCount: number
  maxCount: number
}

export const getChannels = () =>
  fetchAPI<Channel[]>(END_POINT.CHANNEL.LIST)

export const createChannel = (name: string) =>
  fetchAPI<Channel>(END_POINT.CHANNEL.LIST, {
    method: 'POST',
    body: JSON.stringify({ name }),
  })

export const getChannelRooms = (channelId: number | string) =>
  fetchAPI<ChannelRoom[]>(END_POINT.CHANNEL.ROOMS(channelId))

type CreateRoomBody = { title: string; maxCount: number }

export const createRoom = (channelId: number | string, body: CreateRoomBody) =>
  fetchAPI<ChannelRoom>(END_POINT.CHANNEL.ROOMS(channelId), {
    method: 'POST',
    body: JSON.stringify(body),
  })
