// service/asterisk/deviceStates.ts
import { createServerFn } from "@tanstack/react-start";
import { connectARI } from "@/lib/ari.server";

export const getDeviceStates = createServerFn({ method: "GET" }).handler(
    async () => {
        const client = await connectARI();
        // GET /deviceStates
        return client.deviceStates.list();
    }
);

export const getDeviceState = createServerFn({ method: "GET" })
    .validator((deviceName: string) => deviceName)
    .handler(async ({ data: deviceName }) => {
        const client = await connectARI();
        // GET /deviceStates/{deviceName}
        return client.deviceStates.get({ deviceName });
    });

export const updateDeviceState = createServerFn({ method: "POST" })
    .validator(
        (input: {
            deviceName: string;
            deviceState:
            | "NOT_INUSE"
            | "INUSE"
            | "BUSY"
            | "INVALID"
            | "UNAVAILABLE"
            | "RINGING"
            | "RINGINUSE"
            | "ONHOLD";
        }) => input
    )
    .handler(async ({ data }) => {
        const client = await connectARI();
        // PUT /deviceStates/{deviceName}
        await client.deviceStates.update({
            deviceName: data.deviceName,
            deviceState: data.deviceState,
        });
        return { success: true };
    });

export const deleteDeviceState = createServerFn({ method: "POST" })
    .validator((deviceName: string) => deviceName)
    .handler(async ({ data: deviceName }) => {
        const client = await connectARI();
        // DELETE /deviceStates/{deviceName}
        await client.deviceStates.delete({ deviceName });
        return { success: true };
    });