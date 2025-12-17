import { api } from "@/api";
import { FormSelector } from "@/components/form-selector";
import { BountyRecord } from "@gadget-client/manus-mortis";
import { useFindBy } from "@gadgetinc/react";
import {
  AutoForm,
  AutoNumberInput,
  AutoStringInput,
  AutoSubmit,
  AutoTable,
} from "@gadgetinc/react/auto/polaris";
import { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  BlockStack,
  Box,
  Card,
  Divider,
  FormLayout,
  InlineGrid,
  InlineStack,
  Link,
  Page,
  SkeletonBodyText,
  SkeletonDisplayText,
  Tag,
  Text,
} from "@shopify/polaris";
import { SaveIcon } from "@shopify/polaris-icons";
import { APIGuildChannel, APIRole, ChannelType } from "discord.js";
import Markdown from "react-markdown";

export const loader = (async ({ context }) => {
  return {
    serverId: process.env.SERVER_ID!,
    roles: (await context.api.getRoles()) as APIRole[],
    channels: ((await context.api.getChannels()) as APIGuildChannel[]).filter((channel) =>
      [ChannelType.GuildText, ChannelType.GuildAnnouncement].includes(channel.type),
    ),
  };
}) satisfies LoaderFunction;

export default function () {
  const { serverId } = useLoaderData<typeof loader>();
  const [{ data: guildRecord }] = useFindBy(api.guild.findByServerId, serverId);

  const MessageColumn = ({
    record: { guildId, channelId, messageId, formattedMessage },
  }: {
    record: BountyRecord;
  }) => {
    return (
      <Tag>
        <Link
          url={`https://discord.com/channels/${guildId}/${channelId}/${messageId}`}
          target="_blank"
          removeUnderline
          monochrome
        >
          <Markdown>{formattedMessage}</Markdown>
        </Link>
      </Tag>
    );
  };

  return (
    <Box paddingInline="3200">
      <Page
        title="Reaction bounties"
        subtitle="View posted reaction bounties and configure related settings"
        backAction={{ content: "Back", url: "/" }}
      >
        <BlockStack gap="500">
          <InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
            <Box>
              <Text as="h2" variant="headingMd">
                Settings
              </Text>
              <Text as="p" variant="bodyMd">
                Configure settings for reaction bounties
              </Text>
            </Box>
            <Card>
              {guildRecord ? (
                <AutoForm action={api.guild.update} record={guildRecord}>
                  <FormLayout.Group>
                    <FormSelector
                      field="bountyPoster"
                      model="guild"
                      loaderData="roles"
                      label="Bounty Poster Role"
                      helpText="Users with this role will be allowed to post reaction bounties"
                      record={guildRecord}
                    />
                    <FormSelector
                      field="bountyHunter"
                      model="guild"
                      loaderData="roles"
                      label="Bounty Hunter Role"
                      helpText="The role pinged when a new reaction bounty is posted"
                      record={guildRecord}
                    />
                    <FormSelector
                      field="bountyChannel"
                      model="guild"
                      loaderData="channels"
                      label="Bounty Channel"
                      helpText="The channel where reaction bounties are announced"
                      record={guildRecord}
                    />
                    <AutoNumberInput
                      field="bountyHours"
                      helpText="The number of hours a bounty will stay active for after being posted"
                      suffix="hours"
                    />
                    <AutoStringInput
                      field="bountyMessage"
                      helpText="The message displayed on the main post to explain bounties"
                      multiline
                    />
                  </FormLayout.Group>

                  <InlineStack align="end">
                    <AutoSubmit icon={SaveIcon}>Save</AutoSubmit>
                  </InlineStack>
                </AutoForm>
              ) : (
                <BlockStack gap="400">
                  <SkeletonDisplayText />
                  <SkeletonBodyText />
                </BlockStack>
              )}
            </Card>
          </InlineGrid>
          <Divider />
          <InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
            <Box>
              <Text as="h2" variant="headingMd">
                Posted bounties
              </Text>
              <Text as="p" variant="bodyMd">
                View the posted bounties
              </Text>
            </Box>
            <Card>
              <AutoTable
                model={api.bounty}
                live
                columns={[
                  "status",
                  { header: "Posted at", field: "createdAt" },
                  "expiresAt",
                  { header: "Message", render: MessageColumn },
                ]}
                selectable={false}
                searchable={false}
                pageSize={10}
              />
            </Card>
          </InlineGrid>
        </BlockStack>
      </Page>
    </Box>
  );
}
