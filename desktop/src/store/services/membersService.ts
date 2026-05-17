import type { Member } from '../../types'
import { baseApi } from '../../utils/helper'

export const membersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMembers: builder.query<Member[], void>({
      query: () => '/members',
      providesTags: ['Members']
    }),
    getMemberById: builder.query<Member, number>({
      query: (id) => `/members/${id}`,
      providesTags: ['Members']
    }),
    updateMember: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/members/${id}`,
        method: 'PUT',
        body
      }),
      invalidatesTags: ['Members']
    }),
    deactivateMember: builder.mutation({
      query: (id) => ({
        url: `/members/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Members']
    })
  })
})

export const {
  useGetMembersQuery,
  useGetMemberByIdQuery,
  useUpdateMemberMutation,
  useDeactivateMemberMutation
} = membersApi