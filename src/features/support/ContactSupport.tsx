import { useRef } from "react";
import type { FormEvent } from "react";
import { Button, Card, Input, Text } from "../../shared/ui";

const ContactSupport = () => {
    const form = useRef<HTMLFormElement>(null);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        alert("Form submitted (demo only, no email service connected).");
        form.current?.reset();
    };

    return (
        <section id="ContactSupport">
            <Card
                variant="outline"
                padding="md"
                className="h-fit relative shadow-sm rounded-lg"
                data-aos="zoom-in"
                data-aos-duration="500"
            >
                <Text as="h2" variant="subtitle" weight="bold" className="mb-6 text-gray-900">
                    Contact Support
                </Text>
                <form ref={form} onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <Input
                            type="text"
                            placeholder="Enter subject"
                            name="Subject"
                            label="Subject"
                            required
                        />
                    </div>
                    <div className="space-y-2 my-4">
                        <Input
                            as="textarea"
                            placeholder="Describe your issue..."
                            name="Message"
                            label="Message"
                            className="h-40"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Input
                            type="file"
                            name="Attachment"
                            label="Attachment (optional)"
                        />
                    </div>
                    <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        className="mt-4 rounded-md"
                    >
                        Send
                    </Button>
                </form>
            </Card>
        </section>
    );
};

export default ContactSupport;

