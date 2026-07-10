// lib/ari.server.ts
import AriClient from "ari-client";
import { EventEmitter } from "node:events";

let clientPromise: ReturnType<typeof AriClient.connect> | null = null;
export const ariEvents = new EventEmitter();
ariEvents.setMaxListeners(0);

const APP_NAME = process.env.ARI_APP_NAME ?? "my-app";

export function connectARI() {
    if (!clientPromise) {
        clientPromise = AriClient.connect(
            process.env.ARI_URL!,
            process.env.ARI_USER!,
            process.env.ARI_PASSWORD!
        ).then((client) => {
            // repassa TODOS os eventos ARI para o emitter interno
            client.on("*", (event, objects) => {
                ariEvents.emit("event", { event, objects });
            });

            client.start(APP_NAME);
            console.log(`ARI conectado, app "${APP_NAME}" registrada`);
            return client;
        });
    }
    return clientPromise;
}