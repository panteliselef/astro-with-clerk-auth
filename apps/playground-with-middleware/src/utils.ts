import type { Entry } from "./atoms/enties";
import { queryBuilder } from "./db/planetscale";

export async function getGuestbook() {
  const data = await queryBuilder
    .selectFrom("guestbook")
    .select(["id", "message", "created_by"])
    .orderBy("updatedAt", "desc")
    .limit(100)
    .execute();

  return data as Entry[];
}

export const clerkAppearance = {
  "variables": {
    "colorPrimary": "#1f9ea3",
    "colorBackground": "#19191A",
    "colorInputBackground": "#19191A",
    "colorAlphaShade": "white",
    "colorText": "white",
    "colorInputText": "white"
  },
  "elements": {
    "logoImage": {
      "filter": "brightness(0) invert(1)"
    },
    "socialButtonsProviderIcon__github": {
      "filter": "brightness(0) invert(1)"
    },
    "footer": {
      "& + div": {
        "background": "rgb(54, 69, 79)"
      }
    }
  }
};
