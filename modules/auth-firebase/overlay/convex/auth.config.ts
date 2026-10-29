import type { AuthConfig } from "convex/server";

// O ID token do Firebase é OIDC: iss = securetoken.google.com/<projectId>, aud = <projectId>.
// Defina com: npx convex env set FIREBASE_PROJECT_ID <projectId>
const projectId = process.env.FIREBASE_PROJECT_ID;
if (!projectId) {
  // O push já falha antes, com mensagem do próprio Convex; isto é a rede de segurança.
  throw new Error(
    "FIREBASE_PROJECT_ID is not set on this Convex deployment. Run: npx convex env set FIREBASE_PROJECT_ID <firebaseProjectId>",
  );
}

export default {
  providers: [
    {
      domain: `https://securetoken.google.com/${projectId}`,
      applicationID: projectId,
    },
  ],
} satisfies AuthConfig;
