import { api } from "@/api";
import { ApplicationRecord, SubmittedApplicationsRecord } from "@gadget-client/manus-mortis";
import { AutoTable } from "@gadgetinc/react/auto/polaris";
import { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Avatar,
  BlockStack,
  Box,
  Button,
  Card,
  InlineStack,
  Link,
  Page,
  ResourceItem,
  Select,
  Tag,
  Text,
} from "@shopify/polaris";
import { FolderDownIcon } from "@shopify/polaris-icons";
import { APIGuildMember } from "discord.js";
import { useState } from "react";

const COLUMN_ROW = [
  "createdAt",
  "application",
  "ownerId",
  "ownerName",
  "threadId",
  "status",
  "answers",
] as const;

export const loader = (async ({ context }) => {
  const [members, applications]: [APIGuildMember[], ApplicationRecord[]] = await Promise.all([
    context.api.getMembers(),
    api.application.findMany(),
  ]);

  return {
    serverId: process.env.SERVER_ID!,
    members,
    applications,
  };
}) satisfies LoaderFunction;

export default function () {
  const { members, serverId, applications } = useLoaderData<typeof loader>();
  const [exporting, setExporting] = useState(false);
  const [pageSize, setPageSize] = useState<number>(10);
  const [applicationType, setApplicationType] = useState("");

  const applicationOptions = [
    { label: "All", value: "" },
    ...applications.map((application) => ({
      label: application.title ?? "Untitled",
      value: application.id,
    })),
  ];

  const memberMap = Object.fromEntries(members.map((member) => [member.user.id, member]));

  const handleExport = async () => {
    setExporting(true);
    let records = await api.submittedApplications.findMany({
      first: 250,
      select: {
        createdAt: true,
        ownerId: true,
        ownerName: true,
        threadId: true,
        status: true,
        answers: true,
        application: { title: true },
      },
      filter: applicationType
        ? {
            applicationId: { equals: applicationType },
          }
        : undefined,
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
    link.download = `${
      applicationOptions
        .find((o) => o.value === applicationType)
        ?.label.toLowerCase()
        .replace(" ", "-") || "all"
    }-submitted-applications-${new Date().toISOString()}.csv`;
    link.click();
    setExporting(false);
  };

  const UserColumn = ({
    record: { ownerId, ownerName },
  }: {
    record: SubmittedApplicationsRecord;
  }) => {
    const user = memberMap[ownerId]?.user;

    return (
      <ResourceItem
        id={user?.id ?? ownerId}
        media={
          <Avatar
            source={
              user?.avatar
                ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
                : undefined
            }
            size="lg"
            name={user?.username ?? ownerName ?? undefined}
          />
        }
        onClick={() => {}}
      >
        <BlockStack>
          <Text variant="bodyMd" fontWeight="bold" as="h3">
            {user?.global_name ?? user?.username ?? ownerName}
          </Text>
          <div>{user?.global_name && `(${user.username})`}</div>
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
          <InlineStack gap="400" align="start" blockAlign="end" wrap={false}>
            <Box width="50%">
              <Select
                label="Application type"
                options={applicationOptions}
                value={applicationType}
                onChange={setApplicationType}
              />
            </Box>

            <Box width="50%">
              <Select
                label="Page size"
                value={String(pageSize)}
                onChange={(size) => setPageSize(Number(size))}
                options={["10", "15", "20", "25", "50", "100"]}
              />
            </Box>
          </InlineStack>

          <AutoTable
            live
            model={api.submittedApplications}
            selectable={false}
            pageSize={pageSize}
            columns={[
              "createdAt",
              "application.title",
              { header: "User", render: UserColumn },
              { header: "Thread", render: ThreadColumn },
              "status",
              "answers",
            ]}
            initialSort={{ createdAt: "Descending" }}
            filter={
              applicationType
                ? {
                    applicationId: { equals: applicationType },
                  }
                : undefined
            }
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
