import { baseApi } from "./baseApi";

interface IGetNotificationsParams {
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: string;
  sort?: string;
}

const notificationApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMyNotifications: build.query({
      query: (params?: IGetNotificationsParams) => ({
        url: "/notifications",
        method: "GET",
        params,
      }),
      providesTags: ["notification"],
    }),

    getUnreadCount: build.query({
      query: () => ({
        url: "/notifications/unread-count",
        method: "GET",
      }),
      providesTags: ["notification"],
    }),

    markNotificationAsRead: build.mutation({
      query: (id: string) => ({
        url: `/notifications/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["notification"],
    }),

    markAllNotificationsAsRead: build.mutation({
      query: () => ({
        url: `/notifications/read-all`,
        method: "PATCH",
      }),
      invalidatesTags: ["notification"],
    }),
  }),
});

export const {
  useGetMyNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
} = notificationApi;
