import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { internal } from "./_generated/api";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password],
  callbacks: {
    async afterUserCreatedOrUpdated(ctx, { userId, existingUserId }) {
      if (!existingUserId) {
        await ctx.runMutation(internal.users.setInitialRole, { userId });
      }
    },
    async beforeSessionCreation(ctx, { userId }) {
      await ctx.runMutation(internal.users.setInitialRole, { userId });
    },
  },
});
