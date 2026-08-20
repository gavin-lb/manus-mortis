import { api } from "@/api";
import { AutoTable } from "@gadgetinc/react/auto/polaris";
import { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  BlockStack,
  Button,
  Card,
  InlineStack,
  Page
} from "@shopify/polaris";
import { FolderDownIcon } from "@shopify/polaris-icons";
import { useState } from "react";

const COLUMN_ROW = [
  "ownerId",
  "ownerName",
  "threadId",
  "status",
  "answers"
] as const;

export const loader = (async ({ context }) => {
  return {
    serverId: process.env.SERVER_ID!,
  };
}) satisfies LoaderFunction;

export default function () {
  const { serverId } = useLoaderData<typeof loader>();

  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    let records = await api.submittedApplications.findMany({
      first: 250,
      select: {
        ownerId: true,
        ownerName: true,
        threadId: true,
        status: true,
        answers: true
      },
    });

    const allRecords = [...records];
    while (records.hasNextPage) {
      records = await records.nextPage();
      allRecords.push(...records);
    }

    const rows = [
      [...COLUMN_ROW],
      ...allRecords.map((record) => COLUMN_ROW.map((column) => record[column] ?? 0)),
    ];

    const csv = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `submitted-applications-${new Date().toISOString()}.csv`;
    link.click();
    setExporting(false);
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
            columns={[
              "ownerId",
              "ownerName",
              "threadId",
              "status",
              "answers"
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
