import {
  APIInteractionResponse,
  ContainerBuilder,
  InteractionResponseType,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  MessageFlags,
  TextDisplayBuilder,
} from "discord.js";
import { MM_EMOJI } from "../utils";

const components = [
  new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# ${MM_EMOJI} How To Claim Bounties ${MM_EMOJI}`),
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        "### Follow these 4 simple steps to lend your reaction to our noble cause and claim " +
          "your glorious points!",
      ),
      new TextDisplayBuilder().setContent(
        "### 1️⃣ (Once only) Add Manus Mortis Bot as a User App to your Discord account",
      ),
      new TextDisplayBuilder().setContent(
        "**You only need to do this step the first time you claim a bounty, not every time**",
      ),
      new TextDisplayBuilder().setContent(
        "Click on the name/user of Manus Mortis Bot, press the `+ Add App` button and then " +
          "the `Authorize` button on the popup.",
      ),
      new TextDisplayBuilder().setContent("### 2️⃣ Follow a link from a posted bounty"),
      new TextDisplayBuilder().setContent(
        "**Click on one of the links to a reaction bounty post listed in this channel.**",
      ),
      new TextDisplayBuilder().setContent(
        "You will need to be a member of the server which the bounty is in, so feel free " +
          "to ask for a link to and make sure you join the offical Anvil Empires discord, etc.",
      ),
      new TextDisplayBuilder().setContent("### 3️⃣ React to the post"),
      new TextDisplayBuilder().setContent("**The most important part!**"),
      new TextDisplayBuilder().setContent("Click the icon below the post to react to it."),
      new TextDisplayBuilder().setContent("### 4️⃣ Right click, then Apps > Claim Bounty"),
      new TextDisplayBuilder().setContent(
        "**Use the Manus Mortis Bot User App to claim your bounty.**",
      ),
      new TextDisplayBuilder().setContent(
        "Since you added Manus Mortis Bot as a User App to your discord account in Step 1, " +
          "you can now right click the post you reacted to and will see a Claim Bounty " +
          "option under the Apps section of your right click menu.",
      ),
    )
    .addMediaGalleryComponents(
      new MediaGalleryBuilder().addItems(
        new MediaGalleryItemBuilder()
          .setURL("https://i.postimg.cc/ZR3D3FKG/bounty-how-to-1.png")
          .setDescription("Step 1"),
        new MediaGalleryItemBuilder()
          .setURL("https://i.postimg.cc/DZsYsdyR/bounty-how-to-2.png")
          .setDescription("Step 2"),
        new MediaGalleryItemBuilder()
          .setURL("https://i.postimg.cc/cC0Tnpzt/bounty-how-to-3.png")
          .setDescription("Step 3"),
        new MediaGalleryItemBuilder()
          .setURL("https://i.postimg.cc/C1D6DHxy/bounty-how-to-4.png")
          .setDescription("Step 4"),
      ),
    )
    .toJSON(),
];

export default async (): Promise<APIInteractionResponse> => {
  return {
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
      components,
    },
  };
};
