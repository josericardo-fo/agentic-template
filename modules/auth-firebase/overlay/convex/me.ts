import { v } from "convex/values";
import { query } from "./_generated/server";

// Identidade vista pelo Convex; usada no smoke test do login.
export const viewer = query({
  args: {},
  returns: v.union(
    v.null(),
    v.object({
      subject: v.string(),
      issuer: v.string(),
      tokenIdentifier: v.string(),
      email: v.optional(v.string()),
    }),
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) return null;
    return {
      subject: identity.subject,
      issuer: identity.issuer,
      tokenIdentifier: identity.tokenIdentifier,
      email: identity.email,
    };
  },
});
