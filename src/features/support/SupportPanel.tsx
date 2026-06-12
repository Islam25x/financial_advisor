import { useState } from "react";
import { Mail, CircleHelp, FileText } from "lucide-react";
// comps
import Questions from "./Questions";
import Documentation from "./Documentation";
import ContactSupport from "./ContactSupport";
import { Button, Text } from "../../shared/ui";

import "./Support.css";

const buttons = [
    { icon: <Mail size={20} strokeWidth={1.75} />, labelKey: "Contact Support" },
    { icon: <CircleHelp size={20} strokeWidth={1.75} />, labelKey: "FAQs" },
    { icon: <FileText size={20} strokeWidth={1.75} />, labelKey: "Documentation" },
];

const Support = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const toggleOpen = (index: number) => setActiveIndex(index);

    return (
        <section
            id="Support"
            className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-50 text-gray-900 p-6"
        >
            <div className="max-w-5xl mx-auto">
                <Text as="h1" variant="title" weight="bold" className="mb-6">
                    Support
                </Text>
                <nav className="inline-flex h-10 items-center justify-center bg-gray-200 rounded-md p-1 mb-6">
                    {buttons.map((btn, index) => (
                        <Button
                            key={index}
                            onClick={() => toggleOpen(index)}
                            variant={activeIndex === index ? "primary" : "ghost"}
                            size="sm"
                            className={`justify-center no-underline px-3 py-1.5 text-sm font-medium flex items-center gap-2 rounded-md ${activeIndex === index ? "text-white" : "text-gray-600 hover:text-gray-900"
                                }`}
                        >
                            {btn.icon}
                            {btn.labelKey}
                        </Button>
                    ))}
                </nav>

                {activeIndex === 0 ? (
                    <ContactSupport />
                ) : activeIndex === 1 ? (
                    <Questions />
                ) : (
                    <Documentation />
                )}
            </div>
        </section>
    );
};

export default Support;

