import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

// Raiz onde moram `convex/` e o `.env.local` do CLI. Workspace: "../../.." (este arquivo fica em apps/web/e2e).
const CONVEX_ROOT = resolve(__dirname, "..");

// globalSetup do Playwright: zera o deployment local antes de cada execução do e2e,
// para os testes começarem do banco vazio, como na CI. Apaga os dados do dev local.
export default function resetConvex() {
  // Trava: nunca zera um deployment de nuvem. O CLI dá precedência às variáveis de
  // ambiente sobre o `.env.local`, então elas são checadas primeiro.
  if (process.env.CONVEX_DEPLOY_KEY || process.env.CONVEX_SELF_HOSTED_URL) {
    throw new Error("reset-convex: recusando zerar; há chave de deploy ou URL self-hosted no ambiente");
  }
  const envFile = readFileSync(join(CONVEX_ROOT, ".env.local"), "utf8");
  const deployment =
    process.env.CONVEX_DEPLOYMENT ?? envFile.match(/^CONVEX_DEPLOYMENT=(.*)$/m)?.[1]?.trim() ?? "";
  if (!/^(anonymous|local):/.test(deployment)) {
    throw new Error(
      `reset-convex: recusando zerar "${deployment}"; o e2e só roda contra deployment local`,
    );
  }
  // Zip sem entradas + --replace-all = todas as tabelas vazias, sem listar nenhuma.
  const dir = mkdtempSync(join(tmpdir(), "convex-reset-"));
  try {
    const zip = join(dir, "empty.zip");
    writeFileSync(zip, Buffer.concat([Buffer.from("PK\x05\x06"), Buffer.alloc(18)]));
    execFileSync("npx", ["convex", "import", "--replace-all", "-y", zip], {
      cwd: CONVEX_ROOT,
      env: { ...process.env, CONVEX_AGENT_MODE: "anonymous" },
      stdio: ["ignore", "ignore", "inherit"],
    });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
