import { useEffect, useState } from "react";
import DateRangeSelector from "./DateRangeSelector";
import Text from "./Text";
import { NotificationBell } from "../../features/notifications/components/NotificationBell";
import { useUserProfile } from "../../features/user/hooks/useUserProfile";
import {
  getUserDisplayName,
  getUserInitial,
} from "../../features/user/utils/user.selectors";

function TopHeaderBar() {
  const { data: profile } = useUserProfile();
  const [hasImageError, setHasImageError] = useState(false);
  const username = profile?.username || (profile ? getUserDisplayName(profile) : "Finexa User");
  const email = profile?.email || "No email available";
  const imageUrl = !hasImageError ? profile?.profileImageUrl : "";
  const initial = profile ? getUserInitial(profile) : "F";

  useEffect(() => {
    setHasImageError(false);
  }, [profile?.profileImageUrl]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <NotificationBell />
      <DateRangeSelector />
      <div className="flex min-h-[52px] min-w-[230px] items-center gap-3 rounded-[28px] border border-slate-200 bg-white/95 px-3 py-2 shadow-[0_12px_30px_rgba(15,23,42,0.08)] backdrop-blur">
        {imageUrl ? (
          <img
            className="h-14 w-14 rounded-full object-cover shadow-[0_10px_24px_rgba(15,23,42,0.12)]"
            src={imageUrl}
            alt={username}
            onError={() => setHasImageError(true)}
          />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-b from-white to-slate-100 text-xl font-medium text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.12)]">
            {initial}
          </div>
        )}
        <div className="min-w-0 flex-1 align-middle">
          <Text as="h3" variant="body" weight="bold" className="text-sm text-gray-900">
            {username}
          </Text>
          <Text
            variant="caption"
            className="mt-0.5 max-w-[150px] truncate text-xs text-gray-400"
            title={email}
          >
            {email}
          </Text>
        </div>
      </div>
    </div>
  );
}

export default TopHeaderBar;
