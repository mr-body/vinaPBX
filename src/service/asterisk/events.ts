// routes/api/events.ts
import { createFileRoute } from "@tanstack/react-router";
import { connectARI, ariEvents } from "@/lib/ari.server";

export const Route = createFileRoute("/api/events")({
    server: {
        handlers: {
            GET: async () => {
                await connectARI(); // garante conexão ativa

                const stream = new ReadableStream({
                    start(controller) {
                        const encoder = new TextEncoder();

                        const send = (payload: unknown) => {
                            controller.enqueue(
                                encoder.encode(`data: ${JSON.stringify(payload)}\n\n`)
                            );
                        };

                        const listener = (data: unknown) => send(data);
                        ariEvents.on("event", listener);

                        // heartbeat pra manter a conexão viva atrás de proxies
                        const heartbeat = setInterval(() => {
                            controller.enqueue(encoder.encode(`: ping\n\n`));
                        }, 15000);

                        // cleanup quando o client desconectar
                        const cleanup = () => {
                            ariEvents.off("event", listener);
                            clearInterval(heartbeat);
                            controller.close();
                        };

                        // @ts-expect-error - sinal de abort do Request
                        controller.signal?.addEventListener?.("abort", cleanup);
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