// service/asterisk/channels.ts
import { createServerFn } from "@tanstack/react-start";
import { connectARI } from "@/lib/ari.server";

// ---------- LIST / ORIGINATE / CREATE ----------

export const getChannels = createServerFn({ method: "GET" }).handler(
    async () => {
        const client = await connectARI();
        // GET /channels
        return client.channels.list();
    }
);

export const getChannel = createServerFn({ method: "GET" })
    .validator((channelId: string) => channelId)
    .handler(async ({ data: channelId }) => {
        const client = await connectARI();
        // GET /channels/{channelId}
        return client.channels.get({ channelId });
    });

export interface OriginateInput {
    endpoint: string;
    extension?: string;
    context?: string;
    priority?: number;
    label?: string;
    app?: string;
    appArgs?: string;
    callerId?: string;
    timeout?: number;
    variables?: Record<string, string>;
    channelId?: string;
    otherChannelId?: string;
    originator?: string;
    formats?: string;
}

export const originateChannel = createServerFn({ method: "POST" })
    .validator((input: OriginateInput) => input)
    .handler(async ({ data }) => {
        const client = await connectARI();
        // POST /channels (originate) — usa channelId se fornecido (originateWithId)
        return client.channels.originate(data);
    });

export const createChannel = createServerFn({ method: "POST" })
    .validator(
        (input: {
            endpoint: string;
            app: string;
            appArgs?: string;
            channelId?: string;
            otherChannelId?: string;
            originator?: string;
            formats?: string;
            variables?: Record<string, string>;
        }) => input
    )
    .handler(async ({ data }) => {
        const client = await connectARI();
        // POST /channels/create (cria sem discar)
        return client.channels.create(data);
    });

export const hangupChannel = createServerFn({ method: "POST" })
    .validator(
        (input: { channelId: string; reason?: string; reason_code?: string }) =>
            input
    )
    .handler(async ({ data }) => {
        const client = await connectARI();
        // DELETE /channels/{channelId}
        await client.channels.hangup({
            channelId: data.channelId,
            reason: data.reason,
            reason_code: data.reason_code,
        });
        return { success: true };
    });

// ---------- DIALPLAN / APP MOVEMENT ----------

export const continueInDialplan = createServerFn({ method: "POST" })
    .validator(
        (input: {
            channelId: string;
            context?: string;
            extension?: string;
            priority?: number;
            label?: string;
        }) => input
    )
    .handler(async ({ data }) => {
        const client = await connectARI();
        // POST /channels/{channelId}/continue
        await client.channels.continueInDialplan(data);
        return { success: true };
    });

export const moveChannel = createServerFn({ method: "POST" })
    .validator((input: { channelId: string; app: string; appArgs?: string }) => input)
    .handler(async ({ data }) => {
        const client = await connectARI();
        // POST /channels/{channelId}/move
        await client.channels.move(data);
        return { success: true };
    });

export const redirectChannel = createServerFn({ method: "POST" })
    .validator((input: { channelId: string; endpoint: string }) => input)
    .handler(async ({ data }) => {
        const client = await connectARI();
        // POST /channels/{channelId}/redirect
        await client.channels.redirect(data);
        return { success: true };
    });

// ---------- SIGNALING ----------

export const answerChannel = createServerFn({ method: "POST" })
    .validator((channelId: string) => channelId)
    .handler(async ({ data: channelId }) => {
        const client = await connectARI();
        // POST /channels/{channelId}/answer
        await client.channels.answer({ channelId });
        return { success: true };
    });

export const ringChannel = createServerFn({ method: "POST" })
    .validator((channelId: string) => channelId)
    .handler(async ({ data: channelId }) => {
        const client = await connectARI();
        // POST /channels/{channelId}/ring
        await client.channels.ring({ channelId });
        return { success: true };
    });

export const ringStopChannel = createServerFn({ method: "POST" })
    .validator((channelId: string) => channelId)
    .handler(async ({ data: channelId }) => {
        const client = await connectARI();
        // DELETE /channels/{channelId}/ring
        await client.channels.ringStop({ channelId });
        return { success: true };
    });

export const progressChannel = createServerFn({ method: "POST" })
    .validator((channelId: string) => channelId)
    .handler(async ({ data: channelId }) => {
        const client = await connectARI();
        // POST /channels/{channelId}/progress
        await client.channels.progress({ channelId });
        return { success: true };
    });

export const sendDTMF = createServerFn({ method: "POST" })
    .validator(
        (input: {
            channelId: string;
            dtmf: string;
            before?: number;
            between?: number;
            duration?: number;
            after?: number;
        }) => input
    )
    .handler(async ({ data }) => {
        const client = await connectARI();
        // POST /channels/{channelId}/dtmf
        await client.channels.sendDTMF(data);
        return { success: true };
    });

// ---------- MUTE / HOLD / MOH / SILENCE ----------

export const muteChannel = createServerFn({ method: "POST" })
    .validator((input: { channelId: string; direction?: "both" | "in" | "out" }) => input)
    .handler(async ({ data }) => {
        const client = await connectARI();
        // POST /channels/{channelId}/mute
        await client.channels.mute(data);
        return { success: true };
    });

export const unmuteChannel = createServerFn({ method: "POST" })
    .validator((input: { channelId: string; direction?: "both" | "in" | "out" }) => input)
    .handler(async ({ data }) => {
        const client = await connectARI();
        // DELETE /channels/{channelId}/mute
        await client.channels.unmute(data);
        return { success: true };
    });

export const holdChannel = createServerFn({ method: "POST" })
    .validator((channelId: string) => channelId)
    .handler(async ({ data: channelId }) => {
        const client = await connectARI();
        // POST /channels/{channelId}/hold
        await client.channels.hold({ channelId });
        return { success: true };
    });

export const unholdChannel = createServerFn({ method: "POST" })
    .validator((channelId: string) => channelId)
    .handler(async ({ data: channelId }) => {
        const client = await connectARI();
        // DELETE /channels/{channelId}/hold
        await client.channels.unhold({ channelId });
        return { success: true };
    });

export const startMoh = createServerFn({ method: "POST" })
    .validator((input: { channelId: string; mohClass?: string }) => input)
    .handler(async ({ data }) => {
        const client = await connectARI();
        // POST /channels/{channelId}/moh
        await client.channels.startMoh(data);
        return { success: true };
    });

export const stopMoh = createServerFn({ method: "POST" })
    .validator((channelId: string) => channelId)
    .handler(async ({ data: channelId }) => {
        const client = await connectARI();
        // DELETE /channels/{channelId}/moh
        await client.channels.stopMoh({ channelId });
        return { success: true };
    });

export const startSilence = createServerFn({ method: "POST" })
    .validator((channelId: string) => channelId)
    .handler(async ({ data: channelId }) => {
        const client = await connectARI();
        // POST /channels/{channelId}/silence
        await client.channels.startSilence({ channelId });
        return { success: true };
    });

export const stopSilence = createServerFn({ method: "POST" })
    .validator((channelId: string) => channelId)
    .handler(async ({ data: channelId }) => {
        const client = await connectARI();
        // DELETE /channels/{channelId}/silence
        await client.channels.stopSilence({ channelId });
        return { success: true };
    });

// ---------- MEDIA: PLAY / RECORD ----------

export const playMedia = createServerFn({ method: "POST" })
    .validator(
        (input: {
            channelId: string;
            media: string; // ex: "sound:hello-world"
            lang?: string;
            offsetms?: number;
            skipms?: number;
            playbackId?: string;
        }) => input
    )
    .handler(async ({ data }) => {
        const client = await connectARI();
        // POST /channels/{channelId}/play  (ou /play/{playbackId} se playbackId for passado)
        return client.channels.play(data);
    });

export const recordChannel = createServerFn({ method: "POST" })
    .validator(
        (input: {
            channelId: string;
            name: string;
            format: string; // ex: "wav", "gsm"
            maxDurationSeconds?: number;
            maxSilenceSeconds?: number;
            ifExists?: "fail" | "overwrite" | "append";
            beep?: boolean;
            terminateOn?: "none" | "any" | "*" | "#";
        }) => input
    )
    .handler(async ({ data }) => {
        const client = await connectARI();
        // POST /channels/{channelId}/record
        return client.channels.record(data);
    });

// ---------- VARIABLES ----------

export const getChannelVar = createServerFn({ method: "GET" })
    .validator((input: { channelId: string; variable: string }) => input)
    .handler(async ({ data }) => {
        const client = await connectARI();
        // GET /channels/{channelId}/variable
        return client.channels.getChannelVar(data);
    });

export const setChannelVar = createServerFn({ method: "POST" })
    .validator(
        (input: {
            channelId: string;
            variable: string;
            value?: string;
            report_events?: boolean;
        }) => input
    )
    .handler(async ({ data }) => {
        const client = await connectARI();
        // POST /channels/{channelId}/variable
        await client.channels.setChannelVar(data);
        return { success: true };
    });

export const getChannelVars = createServerFn({ method: "GET" })
    .validator((input: { channelId: string; variables: string[] }) => input)
    .handler(async ({ data }) => {
        const client = await connectARI();
        // GET /channels/{channelId}/variables
        return client.channels.getChannelVars(data);
    });

export const setChannelVars = createServerFn({ method: "POST" })
    .validator(
        (input: { channelId: string; variables: Record<string, string> }) => input
    )
    .handler(async ({ data }) => {
        const client = await connectARI();
        // POST /channels/{channelId}/variables
        await client.channels.setChannelVars(data);
        return { success: true };
    });

// ---------- SNOOP / DIAL ----------

export const snoopChannel = createServerFn({ method: "POST" })
    .validator(
        (input: {
            channelId: string;
            spy?: "none" | "both" | "out" | "in";
            whisper?: "none" | "both" | "out" | "in";
            app: string;
            appArgs?: string;
            snoopId?: string;
        }) => input
    )
    .handler(async ({ data }) => {
        const client = await connectARI();
        // POST /channels/{channelId}/snoop (ou /snoop/{snoopId})
        return client.channels.snoopChannel(data);
    });

export const dialChannel = createServerFn({ method: "POST" })
    .validator((input: { channelId: string; caller?: string; timeout?: number }) => input)
    .handler(async ({ data }) => {
        const client = await connectARI();
        // POST /channels/{channelId}/dial
        await client.channels.dial(data);
        return { success: true };
    });

// ---------- STATS / EXTERNAL MEDIA / TRANSFER ----------

export const getRtpStatistics = createServerFn({ method: "GET" })
    .validator((channelId: string) => channelId)
    .handler(async ({ data: channelId }) => {
        const client = await connectARI();
        // GET /channels/{channelId}/rtp_statistics
        return client.channels.rtpstatistics({ channelId });
    });

export const externalMedia = createServerFn({ method: "POST" })
    .validator(
        (input: {
            app: string;
            external_host?: string;
            format: string;
            encapsulation?: "rtp" | "audiosocket" | "none";
            transport?: "udp" | "tcp" | "websocket";
            connection_type?: "client" | "server";
            channelId?: string;
            direction?: "both";
            data?: string;
            transport_data?: string;
            variables?: Record<string, string>;
        }) => input
    )
    .handler(async ({ data }) => {
        const client = await connectARI();
        // POST /channels/externalMedia
        return client.channels.externalMedia(data);
    });

export const transferProgress = createServerFn({ method: "POST" })
    .validator((input: { channelId: string; states: string }) => input)
    .handler(async ({ data }) => {
        const client = await connectARI();
        // POST /channels/{channelId}/transfer_progress
        await client.channels.transfer_progress(data);
        return { success: true };
    });