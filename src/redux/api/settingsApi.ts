import { baseApi } from "./baseApi";
import { buildQueryParams } from "./queryParams";

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllAbout: builder.query({
      query: (args) => {
        const params = buildQueryParams(args);
        return { url: "/settings/about", method: "GET", params };
      },
      providesTags: ["about"],
    }),
    updateAbout: builder.mutation({
      query: (data: { description: string }) => ({
        url: "/settings/about/update",
        method: "PATCH",
        contentType: "application/json",
        data,
      }),
      invalidatesTags: ["about"],
    }),

    getAllPrivacy: builder.query({
      query: (args) => {
        const params = buildQueryParams(args);
        return { url: "/settings/privacy", method: "GET", params };
      },
      providesTags: ["privacy"],
    }),
    updatePrivacy: builder.mutation({
      query: (data: { description: string }) => ({
        url: "/settings/privacy/update",
        method: "PATCH",
        contentType: "application/json",
        data,
      }),
      invalidatesTags: ["privacy"],
    }),

    getAllTerms: builder.query({
      query: (args) => {
        const params = buildQueryParams(args);
        return { url: "/settings/terms", method: "GET", params };
      },
      providesTags: ["terms"],
    }),
    updateTerms: builder.mutation({
      query: (data: { description: string }) => ({
        url: "/settings/terms/update",
        method: "PATCH",
        contentType: "application/json",
        data,
      }),
      invalidatesTags: ["terms"],
    }),
  }),
});

export const {
  useGetAllAboutQuery,
  useUpdateAboutMutation,
  useGetAllPrivacyQuery,
  useUpdatePrivacyMutation,
  useGetAllTermsQuery,
  useUpdateTermsMutation,
} = settingsApi;
