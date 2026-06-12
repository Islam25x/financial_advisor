import { Card, Text } from "../../shared/ui";

const Questions = () => {
    const questions = [
        {
            question: "How do I reset my password?",
            answer: "Click on 'Forgot Password' at the login page and follow the instructions."
        },
        {
            question: "Where can I find my invoices?",
            answer: "You can view and download your invoices from the Billing section in your account settings."
        },
        {
            question: "How do I contact support?",
            answer: "Go to the Support page and click 'Contact Support' to send us a message."
        },
        {
            question: "Can I change my subscription plan?",
            answer: "Yes, you can upgrade or downgrade your plan at any time from the Subscription settings."
        },
        {
            question: "Is my data secure?",
            answer: "Yes, we use industry-standard encryption and security practices to keep your data safe."
        }
    ];

    return (
        <section id="Questions" className="py-10 bg-gray-100 text-gray-900">
            <div className="max-w-6xl mx-auto px-4">
                <Text as="h2" variant="title" weight="bold" className="text-center mb-8">
                    Frequently Asked Questions
                </Text>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {questions.map((q, index) => (
                        <Card
                            key={index}
                            variant="outline"
                            padding="md"
                            className="hover:shadow-md transition rounded-lg"
                        >
                            <Text as="h3" variant="subtitle" weight="bold" className="mb-2">
                                {q.question}
                            </Text>
                            <Text variant="body" className="text-gray-600">
                                {q.answer}
                            </Text>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Questions;
