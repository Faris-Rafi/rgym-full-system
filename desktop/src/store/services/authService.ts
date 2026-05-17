import { baseApi } from "../../utils/helper"

export const authService = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials
      })
    }),
    getMe: builder.query({
      query: () => '/auth/me'
    })
  })
})

export const { useLoginMutation, useGetMeQuery } = authService