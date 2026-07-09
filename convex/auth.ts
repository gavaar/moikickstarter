import { ConvexCredentials } from "@convex-dev/auth/providers/ConvexCredentials";
import { convexAuth, createAccount, retrieveAccount } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    ConvexCredentials({
      authorize: async (params, ctx) => {
        const username = params.username as string;
        const password = params.password as string;
        const flow = params.flow as string;

        if (!username || !password) {
          throw new Error("Username and password are required");
        }

        // todo: separate signIn and signUp flows into different endpoints, so we don't have to check the flow here
        if (flow === "signUp") {
          const result = await createAccount(ctx, {
            provider: "convex-credentials",
            account: { id: username, secret: password },
            profile: { username },
          });
          if (!result) return null;
          return { userId: result.user._id };
        }

        if (flow === "signIn") {
          const result = await retrieveAccount(ctx, {
            provider: "convex-credentials",
            account: { id: username, secret: password },
          });
          if (!result) return null;
          return { userId: result.user._id };
        }

        return null;
      },
    }),
  ],
});
