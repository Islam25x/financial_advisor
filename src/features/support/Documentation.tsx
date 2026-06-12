import { Button, Card, Text } from "../../shared/ui";

const Documentation = () => {
    const documents = [
        {
            title: "User Guide",
            description: "A step-by-step guide to help you get started with the system.",
        },
        {
            title: "Technical Specifications",
            description:
                "Detailed technical specifications and requirements for the system.",
        },
        {
            title: "Gas Analysis Report",
            description: "Comprehensive gas analysis data and results.",
        },
        {
            title: "API Documentation",
            description: "Developer documentation for integrating with the API.",
        },
    ];

    return (
        <section id="Documentation">
            <Card
                variant="outline"
                padding="md"
                className="h-fit relative shadow-sm rounded-lg"
                data-aos="zoom-in"
                data-aos-duration="500"
            >
                <Text as="h2" variant="subtitle" weight="bold" className="mb-6 text-gray-900">
                    Documentation
                </Text>

                {/* Documents */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {documents.map((doc, index) => (
                        <Card
                            key={index}
                            variant="outline"
                            padding="sm"
                            className="bg-gray-50 hover:border-primary/40 rounded-lg"
                        >
                            <Text as="h3" variant="subtitle" weight="medium" className="mb-2 text-gray-900">
                                {doc.title}
                            </Text>
                            <Text variant="body" className="text-gray-600">
                                {doc.description}
                            </Text>
                            <Button variant="primary" size="sm" className="mt-3 rounded">
                                Download PDF
                            </Button>
                        </Card>
                    ))}
                </div>

                {/* Videos */}
                <Text as="h2" variant="subtitle" weight="bold" className="my-6 text-gray-900">
                    Tutorial Videos
                </Text>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card variant="outline" padding="sm" className="bg-gray-50 rounded-lg">
                        <div className="aspect-video bg-gray-100 rounded mb-3 flex items-center justify-center">
                            <iframe
                                className="w-full h-full rounded"
                                src="https://www.youtube.com/embed/6o5RprIJmfA"
                                title="Getting Started Guide"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                referrerPolicy="strict-origin-when-cross-origin"
                                allowFullScreen
                            ></iframe>
                        </div>
                        <Text as="h4" variant="body" weight="medium" className="text-gray-900">
                            Getting Started Guide
                        </Text>
                        <Text variant="body" className="text-gray-600 mt-1">
                            Learn the basics of using the system in this quick start video.
                        </Text>
                    </Card>

                    <Card variant="outline" padding="sm" className="bg-gray-50 rounded-lg">
                        <div className="aspect-video bg-gray-100 rounded mb-3 flex items-center justify-center">
                            <iframe
                                className="w-full h-full rounded"
                                src="https://www.youtube.com/embed/96Vekm8Ws4U"
                                title="Advanced Analysis Techniques"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                referrerPolicy="strict-origin-when-cross-origin"
                                allowFullScreen
                            ></iframe>
                        </div>
                        <Text as="h4" variant="body" weight="medium" className="text-gray-900">
                            Advanced Analysis Techniques
                        </Text>
                        <Text variant="body" className="text-gray-600 mt-1">
                            Explore advanced techniques and best practices for data analysis.
                        </Text>
                    </Card>
                </div>
            </Card>
        </section>
    );
};

export default Documentation;

