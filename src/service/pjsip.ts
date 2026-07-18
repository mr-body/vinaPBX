// src/service/pjsip.ts
import { createServerFn } from "@tanstack/react-start";
import {
  srvListContacts,
  srvCreateContact,
  srvUpdateContact,
  srvDeleteContact,
  srvReloadPjsip
} from "./pjsip.server";

export const reloadPjsip = createServerFn({ method: "POST" })
  .handler(async () => {
    await srvReloadPjsip();
    return { success: true };
  });

export const listAsteriskContacts = createServerFn({ method: "GET" })
  .handler(async () => {
    return await srvListContacts();
  });

export const createAsteriskContact = createServerFn({ method: "POST" })
  .validator((data: { username: string; password: string }) => data)
  .handler(async ({ data }) => {
    await srvCreateContact(data.username, data.password);
    return { success: true, message: `Contacto ${data.username} criado` };
  });

export const updateAsteriskContact = createServerFn({ method: "POST" })
  .validator((data: { username: string; password: string }) => data)
  .handler(async ({ data }) => {
    await srvUpdateContact(data.username, data.password);
    return { success: true, message: `Contacto ${data.username} atualizado` };
  });

export const deleteAsteriskContact = createServerFn({ method: "POST" })
  .validator((data: { username: string }) => data)
  .handler(async ({ data }) => {
    await srvDeleteContact(data.username);
    return { success: true, message: `Contacto ${data.username} removido` };
  });