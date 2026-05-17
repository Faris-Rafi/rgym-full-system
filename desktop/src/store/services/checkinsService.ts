import type { Checkin, TodayStats } from '../../types'
import { baseApi } from '../../utils/helper'

export const checkinsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createCheckin: builder.mutation({
      query: (body) => ({
        url: '/checkins',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Checkins', 'Stats']
    }),
    getTodayStats: builder.query<TodayStats, void>({
      query: () => '/checkins/stats/today',
      providesTags: ['Stats']
    }),
    getAllCheckins: builder.query<Checkin[], void>({
      query: () => '/checkins',
      providesTags: ['Checkins']
    }),
    getCheckinsByMember: builder.query<Checkin[], number>({
      query: (id) => `/checkins/member/${id}`,
      providesTags: ['Checkins']
    })
  })
})

export const {
  useCreateCheckinMutation,
  useGetTodayStatsQuery,
  useGetAllCheckinsQuery,
  useGetCheckinsByMemberQuery
} = checkinsApi