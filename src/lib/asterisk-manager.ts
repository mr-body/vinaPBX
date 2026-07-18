// src/lib/asterisk-manager.server.ts

// @ts-ignore - asterisk-manager não possui tipos TypeScript nativos
import AsteriskManager from "asterisk-manager";

// Forçamos o TypeScript a tratar o construtor como 'any' para aceitar o 'new'
const Manager = AsteriskManager;

const AMI_HOST = process.env.ASTERISK_HOST || "212.85.1.223";
const ARI_USER = process.env.ARI_USER || "seu_usuario";
const ARI_PASS = process.env.ARI_PASSWORD || "sua_senha";

// Agora o TypeScript não vai reclamar do 'new'
export const ami = new Manager(8088, "212.85.1.223", "hellena","Km_HSHkh.rY$8X&", true);

export function amiAction<T = any>(action: Record<string, unknown>): Promise<T> {
  return new Promise((resolve, reject) => {
    ami.action(action, (err: unknown, res: T) => {
      if (err) return reject(err);
      resolve(res);
    });
  });
}