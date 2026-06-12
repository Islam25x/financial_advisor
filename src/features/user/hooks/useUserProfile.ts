import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { fetchUserProfileApi } from "../api/user.api";
import type { User } from "../types/user.types";
import { extractUserData, parseUser } from "../utils/user.parser";
import { ApiError } from "../../../infrastructure/api/api-error";
import { queryKeys } from "../../../infrastructure/query/query-keys";
import { useAuth } from "../../../shared/auth/AuthContext";

export const USER_PROFILE_QUERY_KEY = queryKeys.user.profile;

export function useUserProfile(): UseQueryResult<User, ApiError> {
  const { isAuthenticated } = useAuth();

  return useQuery<User, ApiError>({
    queryKey: USER_PROFILE_QUERY_KEY,
    queryFn: async ({ signal }) => {
      const response = await fetchUserProfileApi({
        signal,
      });

      return parseUser(extractUserData(response), {
        profileImageCacheKey: Date.now(),
      });
    },
    staleTime: 1000 * 60 * 5,
    enabled: isAuthenticated,
  });
}
