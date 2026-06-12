import { useEffect, useMemo, useState } from "react";
import {
    BrainCircuit,
    CheckCircle2,
    Lock,
    Mail,
    Settings,
    ShieldCheck,
    Sparkles,
    Upload,
    User,
} from "lucide-react";
import ProfileInfo from "./ProfileInfo";
import Security from "./Security";
import Preferences from "./Preferences";
import ProfileImageUploadModal from "./ProfileImageUploadModal";
import { useTransactions } from "../../transactions/hooks/useTransactions";
import { useUserProfile } from "../hooks/useUserProfile";
import {
    getUserDisplayName,
    getUserInitial,
} from "../utils/user.selectors";
import {
    selectTransactionsInsights,
    type TransactionsInsights,
} from "../../transactions/utils/transaction.selectors";
import { Text } from "../../../shared/ui";

const PAGE_SHELL_CLASS =
    "relative overflow-hidden rounded-[28px] bg-gradient-to-br from-white via-[#fbfcff] to-[#eef7ff] py-6 text-slate-900";
const GLASS_CARD_CLASS =
    "rounded-[24px] border border-slate-200/80 bg-white/78 shadow-[0_18px_45px_rgba(14,165,233,0.08)] backdrop-blur-xl";
const TAB_BASE_CLASS =
    "flex items-center justify-center gap-2 rounded-2xl px-3 py-1.5 text-sm font-medium transition-all duration-200";

function ProfileInsightsPanel({
    insights,
    isLoading,
    completion,
}: {
    insights: TransactionsInsights;
    isLoading: boolean;
    completion: {
        percentage: number;
        completedFields: number;
        totalFields: number;
        isComplete: boolean;
        remainingFields: string[];
    };
}) {
    const changeLabel = `${Math.abs(insights.spendingChange).toFixed(0)}%`;
    const items = [
        {
            id: "spending",
            icon: <BrainCircuit size={18} />,
            title: `Spending is ${insights.isSpendingUp ? "up" : "down"} ${changeLabel}`,
            body: "Compared with last month based on your recent financial activity.",
        },
        {
            id: "category",
            icon: <Sparkles size={18} />,
            title: "Category spotlight",
            body: `${insights.topCategory} is currently your strongest spending signal.`,
        },
        {
            id: "tip",
            icon: <ShieldCheck size={18} />,
            title: "Suggested next move",
            body: insights.tip,
        },
    ];
    const progressWidth = `${completion.percentage}%`;
    const completionMessage = completion.isComplete
        ? "Your profile is fully complete and ready to power sharper recommendations across Finexa."
        : `Add ${completion.remainingFields.slice(0, 2).join(" and ")}${completion.remainingFields.length > 2 ? " and more" : ""} to unlock stronger personalization.`;

    return (
        <aside className={`${GLASS_CARD_CLASS} p-4 text-slate-700 h-full`}>
            <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                    <Text as="h3" variant="subtitle" weight="bold" className="text-slate-900">
                        AI Insights
                    </Text>
                    <Text className="mt-1 text-sm text-slate-500">
                        Smart, lightweight guidance built from your profile and activity.
                    </Text>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-100 text-primary ring-1 ring-sky-200/80">
                    <Sparkles size={18} />
                </span>
            </div>

            <div className="space-y-2.5">
                {isLoading
                    ? Array.from({ length: 3 }, (_, index) => (
                        <div
                            key={index}
                            className="rounded-2xl border border-slate-200 bg-white/80 p-2.5"
                        >
                            <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
                            <div className="mt-2.5 h-3 w-full animate-pulse rounded bg-slate-100" />
                            <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-slate-100" />
                        </div>
                    ))
                    : items.map((item) => (
                        <div
                            key={item.id}
                            className="rounded-2xl border border-slate-200/80 bg-white/80 p-2.5"
                        >
                            <div className="mb-1.5 flex items-center gap-2.5">
                                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-50 text-primary">
                                    {item.icon}
                                </span>
                                <Text as="h4" weight="bold" className="text-sm text-slate-900">
                                    {item.title}
                                </Text>
                            </div>
                            <Text className="text-sm leading-5 text-slate-500">{item.body}</Text>
                        </div>
                    ))}
            </div>

            <div className="mt-3 rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-2.5">
                <div className="flex items-center justify-between gap-3">
                    <Text as="p" weight="bold" className="text-sm text-slate-900">
                        Profile completeness
                    </Text>
                    {completion.isComplete ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                            <CheckCircle2 size={12} />
                            Complete
                        </span>
                    ) : (
                        <span className="text-xs font-medium text-slate-500">
                            {completion.completedFields}/{completion.totalFields}
                        </span>
                    )}
                </div>
                <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-sky-400 to-primary transition-all duration-300"
                        style={{ width: progressWidth }}
                    />
                </div>
                <Text className="mt-1.5 text-xs font-medium text-slate-700">
                    {completion.percentage}% complete
                </Text>
                <Text className="mt-1 text-xs text-slate-500">
                    {completionMessage}
                </Text>
            </div>
        </aside>
    );
}

const Profile = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [hasProfileImageError, setHasProfileImageError] = useState(false);
    const { data: profile } = useUserProfile();
    const { data: transactionsData, isLoading: isTransactionsLoading } = useTransactions();
    const toggleOpen = (index: number) => setActiveIndex(index);
    const displayName = profile ? getUserDisplayName(profile) : "Finexa User";
    const displayEmail = profile?.email || "No email available";
    const initial = profile ? getUserInitial(profile) : "F";
    const profileImageUrl = !hasProfileImageError ? profile?.profileImageUrl : null;
    const transactions = useMemo(() => transactionsData?.items ?? [], [transactionsData]);
    const insights = useMemo(() => selectTransactionsInsights(transactions), [transactions]);
    const completion = useMemo(() => {
        const completionFields: Array<{ label: string; value: string | undefined }> = [
            { label: "first name", value: profile?.firstName },
            { label: "last name", value: profile?.lastName },
            { label: "username", value: profile?.username },
            { label: "email", value: profile?.email },
            { label: "phone number", value: profile?.phoneNumber },
            { label: "date of birth", value: profile?.dateOfBirth?.toISOString() },
            { label: "profile photo", value: profile?.profileImageUrl ?? undefined },
        ];
        const completedFields = completionFields.filter((field) => field.value?.trim()).length;
        const totalFields = completionFields.length;
        const percentage = Math.round((completedFields / totalFields) * 100);

        return {
            percentage,
            completedFields,
            totalFields,
            isComplete: completedFields === totalFields,
            remainingFields: completionFields
                .filter((field) => !field.value?.trim())
                .map((field) => field.label),
        };
    }, [profile]);

    const buttons = [
        { icon: <User size={17} strokeWidth={1.75} />, label: "Personal Information" },
        { icon: <Lock size={20} strokeWidth={1.75} />, label: "Security" },
        { icon: <Settings size={20} strokeWidth={1.75} />, label: "Preferences" },
    ];

    useEffect(() => {
        setHasProfileImageError(false);
    }, [profile?.profileImageUrl]);

    return (
        <section id="Support" className={PAGE_SHELL_CLASS}>
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute left-[-10%] top-[-15%] h-56 w-56 rounded-full bg-sky-200/40 blur-3xl" />
                <div className="absolute bottom-[-10%] right-[-5%] h-72 w-72 rounded-full bg-blue-100/70 blur-3xl" />
            </div>

            <div className="mx-auto w-full max-w-6xl px-4">
                <div className="mb-4 flex flex-col gap-1">
                    <Text as="h1" weight="bold" className="text-2xl text-slate-900 md:text-3xl">
                        Profile
                    </Text>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <div
                            data-aos="zoom-in"
                            data-aos-duration="500"
                            className={`${GLASS_CARD_CLASS} overflow-hidden p-4 md:p-5`}
                        >
                            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <div className="flex flex-col items-center gap-3 text-center md:flex-row md:text-left">
                                    <div className="relative">
                                        <span className="relative flex h-12 w-12 shrink-0 overflow-hidden rounded-[18px] border border-sky-100 bg-gradient-to-br from-white via-sky-50 to-[#eef6ff] shadow-[0_16px_36px_rgba(14,165,233,0.14)]">
                                            {profileImageUrl ? (
                                                <img
                                                    src={profileImageUrl}
                                                    alt={`${displayName} profile`}
                                                    className="h-full w-full object-cover"
                                                    onError={() => setHasProfileImageError(true)}
                                                />
                                            ) : (
                                                <span className="flex h-full w-full items-center justify-center text-lg font-semibold text-slate-700">
                                                    {initial}
                                                </span>
                                            )}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setIsUploadModalOpen(true)}
                                            className="absolute -bottom-1 -right-1 inline-flex h-7 w-7 items-center justify-center rounded-xl border border-slate-200 bg-white text-primary shadow-md transition hover:bg-sky-50"
                                            aria-label="Upload profile picture"
                                        >
                                            <Upload strokeWidth={1.5} size={14} />
                                        </button>
                                    </div>

                                    <div>
                                        <Text as="h2" weight="bold" className="text-base text-slate-900 md:text-lg">
                                            {displayName}
                                        </Text>
                                        <div className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-2.5 py-1 text-xs text-slate-400">
                                            <Mail size={12} />
                                            <span>{displayEmail}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-white/75 px-3.5 py-2.5 text-left text-sm text-slate-500">
                                    <Text className="text-xs uppercase tracking-[0.2em] text-slate-400">
                                        Member Snapshot
                                    </Text>
                                    <Text as="p" weight="bold" className="mt-1 text-sm text-slate-900">
                                        Personal workspace synced
                                    </Text>
                                    <Text className="mt-1 text-xs text-slate-500">
                                        Your profile data powers dashboard personalization.
                                    </Text>
                                </div>
                            </div>

                            <nav className="mb-4 grid grid-cols-1 gap-2 rounded-[22px] border border-slate-200 bg-slate-50/80 p-2 md:grid-cols-3">
                                {buttons.map((btn, index) => (
                                    <button
                                        key={index}
                                        onClick={() => toggleOpen(index)}
                                        className={`${TAB_BASE_CLASS} ${activeIndex === index
                                            ? "bg-gradient-to-r from-sky-400 to-primary text-white shadow-[0_12px_24px_rgba(14,165,233,0.22)]"
                                            : "text-slate-500 hover:bg-white hover:text-slate-900"
                                            }`}
                                    >
                                        {btn.icon}
                                        {btn.label}
                                    </button>
                                ))}
                            </nav>

                            <div className="rounded-[22px] border border-slate-200 bg-white/70 p-4 md:p-5">
                                <div className="text-slate-900">
                                    {activeIndex === 0 ? (
                                        <ProfileInfo />
                                    ) : activeIndex === 1 ? (
                                        <Security />
                                    ) : (
                                        <Preferences />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1 h-full">
                        <div className="lg:sticky lg:top-4 h-full">
                            <ProfileInsightsPanel
                                insights={insights}
                                isLoading={isTransactionsLoading}
                                completion={completion}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <ProfileImageUploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
            />
        </section>
    );
};

export default Profile;
