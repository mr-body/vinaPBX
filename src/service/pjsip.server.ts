// src/service/pjsip.server.ts
import { mkdir, writeFile, unlink, access } from "node:fs/promises";
import path from "node:path";
import { connectARI } from "@/lib/ari.server";
import { exec } from "node:child_process";
import { promisify } from "node:util";

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

[${username}]
type=auth
auth_type=userpass
username=${username}
password=${password}

[${username}]
type=endpoint
context=from-internal
disallow=all
allow=ulaw
auth=${username}
aors=${username}
`;
}


// Funções utilitárias puras de servidor que serão chamadas pelas Server Functions
export async function srvReloadPjsip() {
    // await amiAction({ action: "Command", command: "pjsip reload" });.

    const execAsync = promisify(exec);
    const { stdout, stderr } = await execAsync(
        'docker exec asterisk asterisk -rx "pjsip reload"'
    );

    if (stderr) {
        console.warn(stderr);
    }

    return stdout;
}

export async function srvListContacts() {
    const client = await connectARI();
    const endpoints = await client.endpoints.list();

    return endpoints
        .filter((e: any) => e.technology === "PJSIP")
        .map((e: any) => ({
            username: e.resource,
            state: e.state,
            channelIds: e.channel_ids ?? [],
        }));
}

export async function srvCreateContact(username: string, password: string) {
    assertSafeUsername(username);
    assertSafeConfigValue(password, "Password");

    await ensureDirectory();
    const filePath = path.join(contactsPath, `${username}.conf`);

    if (await fileExists(filePath)) {
        throw new Error(`Contacto ${username} já existe`);
    }

    await writeFile(filePath, generatePjsipConfig(username, password), "utf-8");
    await srvReloadPjsip();
}

export async function srvUpdateContact(username: string, password: string) {
    assertSafeUsername(username);
    assertSafeConfigValue(password, "Password");

    const filePath = path.join(contactsPath, `${username}.conf`);

    if (!(await fileExists(filePath))) {
        throw new Error(`Contacto ${username} não encontrado`);
    }

    await writeFile(filePath, generatePjsipConfig(username, password), "utf-8");
    await srvReloadPjsip();
}

export async function srvDeleteContact(username: string) {
    assertSafeUsername(username);

    const filePath = path.join(contactsPath, `${username}.conf`);

    try {
        await unlink(filePath);
    } catch {
        throw new Error(`Contacto ${username} não encontrado`);
    }

    await srvReloadPjsip();
}