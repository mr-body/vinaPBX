// service/asterisk/endpoints.ts
import { createServerFn } from "@tanstack/react-start";
import { connectARI } from "@/lib/ari.server";

// ---------- QUERIES ----------

export const getEndpoints = createServerFn({ method: "GET" }).handler(
    async () => {
        const client = await connectARI();
        const endpoints = await client.endpoints.list();
        return endpoints.map((e) => ({
            resource: e.resource,
            technology: e.technology,
            state: e.state,
            channel_ids: e.channel_ids,
        }));
    }
);

export const getEndpointsByTech = createServerFn({ method: "GET" })
    .validator((tech: string) => tech)
    .handler(async ({ data: tech }) => {
        const client = await connectARI();
        // GET /endpoints/{tech}
        const endpoints = await client.endpoints.listByTech({ tech });
        return endpoints.map((e) => ({
            resource: e.resource,
            technology: e.technology,
            state: e.state,
            channel_ids: e.channel_ids,
        }));
    });

export const getEndpointDetails = createServerFn({ method: "GET" })
    .validator((input: { tech: string; resource: string }) => input)
    .handler(async ({ data }) => {
        const client = await connectARI();
        // GET /endpoints/{tech}/{resource}
        const endpoint = await client.endpoints.get({
            tech: data.tech,
            resource: data.resource,
        });
        return endpoint;
    });

// ---------- MUTATIONS ----------

export const sendMessage = createServerFn({ method: "POST" })
    .validator(
        (input: {
            to: string;
            from: string;
            body?: string;
            variables?: Record<string, string>;
        }) => input
    )
    .handler(async ({ data }) => {
        const client = await connectARI();
        // PUT /endpoints/sendMessage
        await client.endpoints.sendMessage({
            to: data.to,
            from: data.from,
            body: data.body,
            variables: data.variables,
        });
        return { success: true };
    });

export const sendMessageToEndpoint = createServerFn({ method: "POST" })
    .validator(
        (input: {
            tech: string;
            resource: string;
            from: string;
            body?: string;
            variables?: Record<string, string>;
        }) => input
    )
    .handler(async ({ data }) => {
        const client = await connectARI();
        // PUT /endpoints/{tech}/{resource}/sendMessage
        await client.endpoints.sendMessageToEndpoint({
            tech: data.tech,
            resource: data.resource,
            from: data.from,
            body: data.body,
            variables: data.variables,
        });
        return { success: true };
    });

export const referEndpoint = createServerFn({ method: "POST" })
    .validator(
        (input: {
            to: string;
            from: string;
            refer_to: string;
            to_self?: boolean;
            variables?: Record<string, string>;
        }) => input
    )
    .handler(async ({ data }) => {
        const client = await connectARI();
        // POST /endpoints/refer
        await client.endpoints.refer({
            to: data.to,
            from: data.from,
            refer_to: data.refer_to,
            to_self: data.to_self,
            variables: data.variables,
        });
        return { success: true };
    });

export const referToEndpoint = createServerFn({ method: "POST" })
    .validator(
        (input: {
            tech: string;
            resource: string;
            from: string;
            refer_to: string;
            to_self?: boolean;
            variables?: Record<string, string>;
        }) => input
    )
    .handler(async ({ data }) => {
        const client = await connectARI();
        // POST /endpoints/{tech}/{resource}/refer
        await client.endpoints.referToEndpoint({
            tech: data.tech,
            resource: data.resource,
            from: data.from,
            refer_to: data.refer_to,
            to_self: data.to_self,
            variables: data.variables,
        });
        return { success: true };
    });