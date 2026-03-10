import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

// Read variables from .env.development
const envContent = readFileSync(".env.development", "utf-8");
const env = {};
for (const line of envContent.split("\n")) {
    const [key, ...valueMatches] = line.split("=");
    if (key && valueMatches.length > 0) {
        env[key.trim()] = valueMatches.join("=").trim().replace(/^['"]|['"]$/g, "");
    }
}

const reqSupabase = createClient(
    env.PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE
);

async function run() {
    const { data, error } = await reqSupabase.from("profiles").insert({
        id: "3a5cf1f5-4b6a-4d42-8fc5-b8e9e5052999",
        tenant_id: "4a254f52-99bd-43dd-86e2-ec031d279999",
        nome: "Test Debug 2",
        email: "debug2@example.com",
        telefone: "11998876655",
        cpf: "12345678901",
        tipo_usuario: "parceiro"
    });

    if (error) {
        console.log("INSERT_ERROR:", JSON.stringify(error, null, 2));
    } else {
        console.log("INSERT_SUCCESS");
    }
}

run();
