import Manager from "asterisk-manager";

export const ami = new Manager(
  Number(process.env.ASTERISX_PORT),
  process.env.ASTERISX_HOST!,
  process.env.ARI_USER!,
  process.env.ARI_PASSWORD!,
  true
);

ami.keepConnected();

// Wrapper em Promise, porque a lib usa callback
export function amiAction<T = any>(action: Record<string, unknown>): Promise<T> {
  return new Promise((resolve, reject) => {
    ami.action(action, (err: unknown, res: T) => {
      if (err) return reject(err);
      resolve(res);
    });
  });
}