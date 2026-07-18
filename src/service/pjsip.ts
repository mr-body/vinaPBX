import { createServerFn } from "@tanstack/react-start";
import { connectARI } from "@/lib/ari.server";
import { amiAction } from "@/lib/asterisk-manager";
import { mkdir, writeFile, unlink, access, readFile } from "node:fs/promises";
import path from "node:path";

const contactsPath = path.resolve(process.cwd(), "../config/pjsip.d");

const SAFE_NAME = /^[a-zA-Z0-9_.-]{1,64}$/;

function assertSafeUsername(username: string) {
  if (!SAFE_NAME.test(username)) {
    throw new Error(`Username inválido: ${username}`);
  }
}

function assertSafeConfigValue(value: string, label: string) {
  if (/[\r\n\[\]]/.test(value)) {
    throw new Error(`${label} contém caracteres inválidos`);
  }
}

async function ensureDirectory() {
  await mkdir(contactsPath, { recursive: true });
}

async function fileExists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function generatePjsipConfig(username: string, password: string) {
  return `
; Auto generated contact ${username}

[${username}]
type=aor
max_contacts=1

[${username}-auth]
type=auth
auth_type=userpass
username=${username}
password=${password}

[${username}]
type=endpoint
context=from-internal
disallow=all
allow=ulaw
auth=${username}-auth
aors=${username}
`;
}

export const reloadPjsip = createServerFn({ method: "POST" }).handler(async () => {
  await amiAction({ action: "Command", command: "pjsip reload" });
  return { success: true };
});

// LIST — via ARI, mostra os endpoints PJSIP realmente carregados pelo Asterisk
export const listAsteriskContacts = createServerFn({ method: "GET" }).handler(
  async () => {
    const client = await connectARI();
    const endpoints = await client.endpoints.list();

    return endpoints
      .filter((e: any) => e.technology === "PJSIP")
      .map((e: any) => ({
        username: e.resource,
        state: e.state, // "online" | "offline" | "unknown"
        channelIds: e.channel_ids ?? [],
      }));
  }
);

// CREATE
export const createAsteriskContact = createServerFn({ method: "POST" })
  .validator((data: { username: string; password: string }) => data)
  .handler(async ({ data }) => {
    const { username, password } = data;

    assertSafeUsername(username);
    assertSafeConfigValue(password, "Password");

    await ensureDirectory();

    const filePath = path.join(contactsPath, `${username}.conf`);

    if (await fileExists(filePath)) {
      throw new Error(`Contacto ${username} já existe`);
    }

    await writeFile(filePath, generatePjsipConfig(username, password), "utf-8");
    await reloadPjsip();

    return { success: true, message: `Contacto ${username} criado` };
  });

// UPDATE
export const updateAsteriskContact = createServerFn({ method: "POST" })
  .validator((data: { username: string; password: string }) => data)
  .handler(async ({ data }) => {
    const { username, password } = data;

    assertSafeUsername(username);
    assertSafeConfigValue(password, "Password");

    const filePath = path.join(contactsPath, `${username}.conf`);

    if (!(await fileExists(filePath))) {
      throw new Error(`Contacto ${username} não encontrado`);
    }

    await writeFile(filePath, generatePjsipConfig(username, password), "utf-8");
    await reloadPjsip();

    return { success: true, message: `Contacto ${username} atualizado` };
  });

// DELETE
export const deleteAsteriskContact = createServerFn({ method: "POST" })
  .validator((data: { username: string }) => data)
  .handler(async ({ data }) => {
    const { username } = data;

    assertSafeUsername(username);

    const filePath = path.join(contactsPath, `${username}.conf`);

    try {
      await unlink(filePath);
    } catch {
      throw new Error(`Contacto ${username} não encontrado`);
    }

    await reloadPjsip();

    return { success: true, message: `Contacto ${username} removido` };
  });