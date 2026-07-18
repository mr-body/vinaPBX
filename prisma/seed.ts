import { auth } from "@/lib/auth";
import dotenv from "dotenv";

dotenv.config();

async function seed() {
  console.log("🌱 Iniciando seed do usuário admin...");

  const email ="admin@admin.com";
  const name =  "admin";
  const password = "admin123";

  if (!email || !name || !password) {
    console.error("❌ Missing required environment variables");
    return;
  }

  try {
    // tenta signup
    const data = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
    });

    if (data.user) {
      console.log("✅ Utilizador criado com sucesso:");
      console.log(data.user);
    }

    console.log("🎉 Seed concluído com sucesso!");
  } catch (err: any) {
    // Better Auth: utilizador já existe
    if (
      err?.body?.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"
    ) {
      console.log(`ℹ️ O utilizador ${email} já existe.`);
      console.log("✅ Seed ignorado com sucesso.");
      return;
    }

    console.error("💥 Erro inesperado no seed");
    console.error(err);
  }
}

seed().then(() =>
  console.log("🏁 Processo de seed finalizado.")
);