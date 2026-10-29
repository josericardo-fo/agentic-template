import { v } from "convex/values";
import { query } from "./_generated/server";

// Consulta mínima para confirmar que o cliente alcança o backend.
export const ping = query({
  args: {},
  returns: v.literal("ok"),
  handler: async () => "ok" as const,
});
