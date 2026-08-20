import { api } from "@/api";
import { SubmittedApplicationsRecord } from "@gadget-client/manus-mortis";
import { AutoTable } from "@gadgetinc/react/auto/polaris";
import { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Avatar,
  BlockStack,
  Button,
  Card,
  InlineStack,
  Link,
  Page,
  ResourceItem,
  Tag,
  Text,
} from "@shopify/polaris";
import { FolderDownIcon } from "@shopify/polaris-icons";
import { APIGuildMember } from "discord.js";
import { useState } from "react";

const COLUMN_ROW = [
  "application",
  "ownerId",
  "ownerName",
  "threadId",
  "status",
  "answers",
] as const;

export const loader = (async ({ context }) => {
  const [members]: [APIGuildMember[]] = await Promise.all([context.api.getMembers()]);

  return {
    serverId: process.env.SERVER_ID!,
    members,
  };
}) satisfies LoaderFunction;

export default function () {
  const { members, serverId } = useLoaderData<typeof loader>();
  const [exporting, setExporting] = useState(false);

  const memberMap = Object.fromEntries(members.map((member) => [member.user.id, member]));

  const handleExport = async () => {
    setExporting(true);
    let records = await api.submittedApplications.findMany({
      first: 250,
      select: {
        ownerId: true,
        ownerName: true,
        threadId: true,
        status: true,
        answers: true,
        application: { title: true },
      },
    });

    const allRecords = [...records];
    while (records.hasNextPage) {
      records = await records.nextPage();
      allRecords.push(...records);
    }

    const data = allRecords.map(({ application, ...rest }) => ({
      ...rest,
      application: application?.title,
    }));
    const rows = [
      [...COLUMN_ROW],
      ...data.map((record) => COLUMN_ROW.map((column) => record[column] ?? 0)),
    ];

    const csv = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `submitted-applications-${new Date().toISOString()}.csv`;
    link.click();
    setExporting(false);
  };

  const UserColumn = ({
    record: { ownerId, threadId },
  }: {
    record: SubmittedApplicationsRecord;
  }) => {
    const user = memberMap[ownerId]?.user;

    if (!user) {
      return <Text as="p">Unknown User (id: {ownerId})</Text>;
    }
    return (
      <ResourceItem
        id={user.id}
        media={
          <Avatar
            source={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
            size="lg"
            name={user.username ?? undefined}
          />
        }
        url={`https://discord.com/channels/${serverId}/${threadId}`}
      >
        <BlockStack>
          <Text variant="bodyMd" fontWeight="bold" as="h3">
            {user.global_name ?? user.username}
          </Text>
          <div>{user.global_name && `(${user.username})`}</div>
        </BlockStack>
      </ResourceItem>
    );
  };

  const ThreadColumn = ({ record: { threadId } }: { record: SubmittedApplicationsRecord }) => {
    return (
      <Tag>
        <Link
          url={`https://discord.com/channels/${serverId}/${threadId}`}
          target="_blank"
          monochrome
        >
          View Thread
        </Link>
      </Tag>
    );
  };

  return (
    <Page
      title="Submitted Applications"
      subtitle="View the applications submitted by users"
      backAction={{ content: "Back", url: "/" }}
    >
      <Card>
        <BlockStack gap="200">
          <AutoTable
            live
            model={api.submittedApplications}
            selectable={false}
            pageSize={20}
            columns={[
              "application.title",
              { header: "User", render: UserColumn },
              { header: "Thread", render: ThreadColumn },
              "status",
              "answers",
            ]}
          ></AutoTable>
          <InlineStack align="end">
            <Button icon={FolderDownIcon} onClick={handleExport} loading={exporting}>
              Export
            </Button>
          </InlineStack>
        </BlockStack>
      </Card>
    </Page>
  );
}
