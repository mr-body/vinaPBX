// routes/api/events.ts
import { createFileRoute } from "@tanstack/react-router";
import { connectARI, ariEvents } from "@/lib/ari.server";

export const Route = createFileRoute("/api/events")({
    server: {
        handlers: {
            GET: async () => {
                await connectARI();

                let closed = false;
                let heartbeat: ReturnType<typeof setInterval>;
                let listener: (data: unknown) => void;

                const stream = new ReadableStream({
                    start(controller) {
                        const encoder = new TextEncoder();

                        const safeEnqueue = (chunk: string) => {
                            if (closed) return;
                            try {
                                controller.enqueue(encoder.encode(chunk));
                            } catch {
                                // controller já fechado por baixo dos panos; garante que paramos
                                closed = true;
                                clearInterval(heartbeat);
                                ariEvents.off("event", listener);
                            }
                        };

                        listener = (data: unknown) => {
                            safeEnqueue(`data: ${JSON.stringify(data)}\n\n`);
                        };
                        ariEvents.on("event", listener);

                        heartbeat = setInterval(() => {
                            safeEnqueue(`: ping\n\n`);
                        }, 15000);
                    },

                    cancel() {
                        // chamado quando o client desconecta (fecha aba, EventSource.close(), etc)
                        closed = true;
                        clearInterval(heartbeat);
                        ariEvents.off("event", listener);
                    },
                });

                return new Response(stream, {
                    headers: {
                        "Content-Type": "text/event-stream",
                        "Cache-Control": "no-cache",
                        Connection: "keep-alive",
                    },
                });
            },
        },
    },
});