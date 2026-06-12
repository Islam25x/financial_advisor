import { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Brain, Mic, ReceiptText } from "lucide-react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import ChatBot from "./ChatBot";
import VoiceLedgerModal from "./VoiceLedgerModal";
import ReceiptOcrModal from "./ReceiptOcrModal";
import { Button, Text } from "../../../shared/ui";

const NOOP = () => { };

const LAUNCHER_SIZE = 115;
const LAUNCHER_COLLAPSED_WIDTH = 175;
const LAUNCHER_EXPANDED_WIDTH = 615;
const ACTION_STAGGER_SECONDS = 0.06;

const launcherVariants: Variants = {
    collapsed: {
        width: LAUNCHER_COLLAPSED_WIDTH,
        transition: {
            type: "spring",
            stiffness: 460,
            damping: 34,
            mass: 0.65,
        },
    },
    expanded: {
        width: LAUNCHER_EXPANDED_WIDTH,
        transition: {
            type: "spring",
            stiffness: 460,
            damping: 34,
            mass: 0.65,
        },
    },
};

const actionsVariants: Variants = {
    collapsed: {
        opacity: 0,
        y: 8,
        transition: {
            duration: 0.14,
            ease: "easeOut",
            when: "afterChildren",
            staggerChildren: 0.04,
            staggerDirection: -1,
        },
        transitionEnd: { pointerEvents: "none" },
    },
    expanded: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.18,
            ease: "easeOut",
            when: "beforeChildren",
            staggerChildren: ACTION_STAGGER_SECONDS,
        },
        pointerEvents: "auto",
    },
};

const actionItemVariants: Variants = {
    collapsed: { opacity: 0, y: 6 },
    expanded: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.16, ease: "easeOut" },
    },
};

interface AiActionButtonProps {
    icon: LucideIcon;
    label: string;
    onClick: () => void;
}

function AiActionButton({ icon: Icon, label, onClick }: AiActionButtonProps) {
    const MotionButton = motion(Button);
    return (
        <MotionButton
            type="button"
            variants={actionItemVariants}
            onClick={onClick}
            variant="secondary"
            size="sm"
            className="h-11 shrink-0 rounded-full border border-primary/20 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition-colors duration-150 hover:bg-primary/10 hover:text-primary"
        >
            <span className="flex items-center gap-2">
                <Icon size={16} strokeWidth={2} />
                <Text as="span" variant="body">
                    {label}
                </Text>
            </span>
        </MotionButton>
    );
}

function ChatIcon() {
    type ActiveModal = "chat" | "Speech" | "ocr" | null;
    const [activeModal, setActiveModal] = useState<ActiveModal>(null);
    const [isPinnedOpen, setIsPinnedOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const previewUrl = selectedFile
        ? URL.createObjectURL(selectedFile)
        : null;

    const launcherRef = useRef<HTMLDivElement | null>(null);

    const isAnyModalOpen = activeModal !== null;

    useEffect(() => {
        if (!isPinnedOpen) return;

        const handlePointerDown = (event: MouseEvent) => {
            if (!launcherRef.current?.contains(event.target as Node)) {
                setIsPinnedOpen(false);
            }
        };

        document.addEventListener("mousedown", handlePointerDown);
        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
        };
    }, [isPinnedOpen]);

    return (
        <>
            <AnimatePresence>
                {!isAnyModalOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-6 right-6 z-50 flex flex-col items-end"
                    >
                        <motion.section
                            ref={launcherRef}
                            initial={false}
                            animate={isPinnedOpen ? "expanded" : "collapsed"}
                            whileHover="expanded"
                            variants={launcherVariants}
                            style={{ height: LAUNCHER_SIZE }}
                            className="relative flex items-center overflow-visible rounded-full pr-4 hover:bg-white/90 hover:shadow-lg hover:backdrop-blur"
                        >
                            <motion.div
                                variants={actionsVariants}
                                className="flex min-w-0 items-center gap-2 pl-3 pr-6"
                            >
                                <AiActionButton
                                    icon={Brain}
                                    label="Finexa Assist"
                                    onClick={() => {
                                        setActiveModal('chat');
                                        setIsPinnedOpen(false);
                                    }}
                                />
                                <AiActionButton
                                    icon={Mic}
                                    label="Voice Ledger"
                                    onClick={() => {
                                        setActiveModal('Speech');
                                        setIsPinnedOpen(false);
                                    }}
                                />
                                <AiActionButton
                                    icon={ReceiptText}
                                    label="Smart Receipt"
                                    onClick={() => {
                                        setActiveModal('ocr');
                                        setIsPinnedOpen(false);
                                    }}
                                />
                            </motion.div>

                            <div className="relative shrink-0 flex items-center justify-center">
                                <motion.span
                                    aria-hidden="true"
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        opacity: [0.4, 1, 0.4],
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                    className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-primary/40 to-primary/20"
                                />

                                <Button
                                    type="button"
                                    onClick={() => setIsPinnedOpen((v) => !v)}
                                    variant="primary"
                                    size="sm"
                                    shape="circle"
                                    className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full p-0"
                                >
                                    <Brain size={40} strokeWidth={2.6} />
                                </Button>
                            </div>
                        </motion.section>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {activeModal === "chat" && (
                    <ChatBot
                        setActive={() => setActiveModal(null)}
                        setHideIcon={NOOP}
                    />
                )}
            </AnimatePresence>

            <VoiceLedgerModal
                isOpen={activeModal === "Speech"}
                onClose={() => setActiveModal(null)}
            />
            <ReceiptOcrModal
                isOpen={activeModal === "ocr"}
                state="idle"
                selectedFile={selectedFile}
                previewUrl={previewUrl}
                onFileChange={setSelectedFile}
                onClose={() => {
                    setActiveModal(null);
                    setSelectedFile(null);
                }}
            />
        </>
    );
}

export default ChatIcon;
