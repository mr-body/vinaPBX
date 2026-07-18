// service/asterisk/asterisk.ts
import { createServerFn } from "@tanstack/react-start";
import { connectARI } from "@/lib/ari.server";

// ---------- INFO / PING ----------

export const getAsteriskInfo = createServerFn({ method: "GET" }).handler(
    async () => {
        const client = await connectARI();
        // GET /asterisk/info
        return client.asterisk.getInfo();
    }
);

export const getPing = createServerFn({ method: "GET" }).handler(async () => {
    const client = await connectARI();
    // GET /asterisk/ping
    return client.asterisk.ping();
});

// ---------- MODULES ----------

export const getModules = createServerFn({ method: "GET" }).handler(
    async () => {
        const client = await connectARI();
        // GET /asterisk/modules
        return client.asterisk.listModules();
    }
);

export const getModule = createServerFn({ method: "GET" })
    .validator((moduleName: string) => moduleName)
    .handler(async ({ data: moduleName }) => {
        const client = await connectARI();
        // GET /asterisk/modules/{moduleName}
        return client.asterisk.getModule({ moduleName });
    });

export const loadModule = createServerFn({ method: "POST" })
    .validator((moduleName: string) => moduleName)
    .handler(async ({ data: moduleName }) => {
        const client = await connectARI();
        // POST /asterisk/modules/{moduleName}
        await client.asterisk.loadModule({ moduleName });
        return { success: true };
    });

export const unloadModule = createServerFn({ method: "POST" })
    .validator((moduleName: string) => moduleName)
    .handler(async ({ data: moduleName }) => {
        const client = await connectARI();
        // DELETE /asterisk/modules/{moduleName}
        await client.asterisk.unloadModule({ moduleName });
        return { success: true };
    });

export const reloadModule = createServerFn({ method: "POST" })
    .validator((moduleName: string) => moduleName)
    .handler(async ({ data: moduleName }) => {
        const client = await connectARI();
        // PUT /asterisk/modules/{moduleName}
        await client.asterisk.reloadModule({ moduleName });
        return { success: true };
    });

// ---------- LOGGING ----------

export const getLogChannels = createServerFn({ method: "GET" }).handler(
    async () => {
        const client = await connectARI();
        // GET /asterisk/logging
        return client.asterisk.listLogChannels();
    }
);

export const addLogChannel = createServerFn({ method: "POST" })
    .validator((input: { logChannelName: string; configuration: string }) => input)
    .handler(async ({ data }) => {
        const client = await connectARI();
        // POST /asterisk/logging/{logChannelName}
        // "configuration" ex: "notice,warning,error"
        await client.asterisk.addLog({
            logChannelName: data.logChannelName,
            configuration: data.configuration,
        });
        return { success: true };
    });

export const deleteLogChannel = createServerFn({ method: "POST" })
    .validator((logChannelName: string) => logChannelName)
    .handler(async ({ data: logChannelName }) => {
        const client = await connectARI();
        // DELETE /asterisk/logging/{logChannelName}
        await client.asterisk.deleteLog({ logChannelName });
        return { success: true };
    });

export const rotateLogChannel = createServerFn({ method: "POST" })
    .validator((logChannelName: string) => logChannelName)
    .handler(async ({ data: logChannelName }) => {
        const client = await connectARI();
        // PUT /asterisk/logging/{logChannelName}/rotate
        await client.asterisk.rotateLog({ logChannelName });
        return { success: true };
    });

// ---------- GLOBAL VARIABLES ----------

export const getGlobalVar = createServerFn({ method: "GET" })
    .validator((variable: string) => variable)
    .handler(async ({ data: variable }) => {
        const client = await connectARI();
        // GET /asterisk/variable
        return client.asterisk.getGlobalVar({ variable });
    });

export const setGlobalVar = createServerFn({ method: "POST" })
    .validator((input: { variable: string; value?: string }) => input)
    .handler(async ({ data }) => {
        const client = await connectARI();
        // POST /asterisk/variable
        await client.asterisk.setGlobalVar({
            variable: data.variable,
            value: data.value,
        });
        return { success: true };
    });

// ---------- DYNAMIC CONFIG ----------

export const getDynamicConfig = createServerFn({ method: "GET" })
    .validator(
        (input: { configClass: string; objectType: string; id: string }) => input
    )
    .handler(async ({ data }) => {
        const client = await connectARI();
        // GET /asterisk/config/dynamic/{configClass}/{objectType}/{id}
        return client.asterisk.getObject({
            configClass: data.configClass,
            objectType: data.objectType,
            id: data.id,
        });
    });

export const updateDynamicConfig = createServerFn({ method: "POST" })
    .validator(
        (input: {
            configClass: string;
            objectType: string;
            id: string;
            fields: { attribute: string; value: string }[];
        }) => input
    )
    .handler(async ({ data }) => {
        const client = await connectARI();
        // PUT /asterisk/config/dynamic/{configClass}/{objectType}/{id}
        return client.asterisk.updateObject({
            configClass: data.configClass,
            objectType: data.objectType,
            id: data.id,
            fields: data.fields,
        });
    });

export const deleteDynamicConfig = createServerFn({ method: "POST" })
    .validator(
        (input: { configClass: string; objectType: string; id: string }) => input
    )
    .handler(async ({ data }) => {
        const client = await connectARI();
        // DELETE /asterisk/config/dynamic/{configClass}/{objectType}/{id}
        await client.asterisk.deleteObject({
            configClass: data.configClass,
            objectType: data.objectType,
            id: data.id,
        });
        return { success: true };
    });
