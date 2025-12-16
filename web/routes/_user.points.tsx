import { api } from "@/api";
import { PointRecord } from "@gadget-client/manus-mortis-v2";
import { useFindBy } from "@gadgetinc/react";
import { AutoForm, AutoNumberInput, AutoSubmit, AutoTable } from "@gadgetinc/react/auto/polaris";
import { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Avatar,
  BlockStack,
  Box,
  Button,
  ButtonGroup,
  Card,
  Divider,
  DropZone,
  FormLayout,
  InlineError,
  InlineGrid,
  InlineStack,
  Modal,
  Page,
  ResourceItem,
  SkeletonBodyText,
  SkeletonDisplayText,
  Text,
  Thumbnail,
} from "@shopify/polaris";
import {
  DeleteIcon,
  FolderDownIcon,
  FolderUpIcon,
  NoteIcon,
  SaveIcon,
} from "@shopify/polaris-icons";
import { APIGuildMember } from "discord.js";
import _ from "lodash";
import { useCallback, useState } from "react";

const COLUMN_ROW = [
  "userId",
  "messageCount",
  "referralCount",
  "secondsInVoice",
  "reactCount",
] as const;

export const loader = (async ({ context }) => {
  return {
    serverId: process.env.SERVER_ID!,
    members: (await context.api.getMembers()) as APIGuildMember[],
  };
}) satisfies LoaderFunction;

export default function () {
  const { serverId, members } = useLoaderData<typeof loader>();
  const [{ data: guildRecord }] = useFindBy(api.guild.findByServerId, serverId);
  const [importActive, setImportActive] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const toggleImport = () => setImportActive(!importActive);
  const [file, setFile] = useState<File>();
  const [fileError, setFileError] = useState<string>();

  const memberById = Object.fromEntries(members.map((member) => [member.user.id, member]));

  const handleDropZoneDrop = useCallback(
    (_dropFiles: File[], acceptedFiles: File[], _rejectedFiles: File[]) => {
      setFile(acceptedFiles[0]);
      setFileError(undefined);
    },
    [],
  );

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    const text = await file.text();
    const [header, ...rows]: string[][] = text
      .replace(/\r/g, "") // prune carriage returns from windows
      .replace(/^(\,|\n)+|(\,|\n)+$/g, "") // trim trailing/leading commas/newlines
      .split("\n")
      .map((line) => line.split(","));

    const invalidColumns = new Set(header).difference(new Set(COLUMN_ROW));

    if (invalidColumns.size > 0) {
      setImporting(false);
      setFileError("Invalid columns: " + Array.from(invalidColumns).join(", "));
      return;
    }

    let records;
    try {
      records = rows.map((row) =>
        Object.fromEntries(
          header.map((key, index) => [key, key === "userId" ? row[index] : Number(row[index])]),
        ),
      );
    } catch (err) {
      setImporting(false);
      setFileError("Malformed file data");
      return;
    }

    let users = await api.point.findMany({
      first: 250,
      select: {
        id: true,
        userId: true,
      },
    });

    const allUsers = [...users];
    while (users.hasNextPage) {
      users = await users.nextPage();
      allUsers.push(...users);
    }

    const pointIdByUserId = Object.fromEntries(allUsers.map((user) => [user.userId, user.id]));

    const toUpdate: (Partial<PointRecord> & { id: string })[] = [];
    const toCreate: Partial<PointRecord>[] = [];
    records.forEach((record) => {
      const id = pointIdByUserId?.[record.userId as string];
      if (id) {
        toUpdate.push({ ...record, id });
      } else {
        toCreate.push(record);
      }
    });

    await api.point.bulkUpdate(toUpdate);
    await api.point.bulkCreate(toCreate);
    toggleImport();
    setFile(undefined);
    setImporting(false);
  };

  const handleExport = async () => {
    setExporting(true);
    let records = await api.point.findMany({
      first: 250,
      select: {
        userId: true,
        messageCount: true,
        referralCount: true,
        reactCount: true,
        secondsInVoice: true,
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
    link.download = `points-${new Date().toISOString()}.csv`;
    link.click();
    setExporting(false);
  };

  const UserColumn = ({ record }: { record: PointRecord }) => {
    const member = memberById[record.userId];

    let name: string, username: string, avatar: string | undefined;
    if (!member) {
      name = "Unknown user";
      username = `(id: ${record.userId})`;
    } else {
      name = member.user.global_name ?? member.user.username;
      username = member.user.global_name ? `(${member.user.username})` : "";
      avatar = `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.png`;
    }

    return (
      <ResourceItem
        id={record.userId}
        media={<Avatar source={avatar} size="lg" name={name} />}
        onClick={() => {}}
      >
        <BlockStack>
          <Text variant="bodyMd" fontWeight="bold" as="h3">
            {name}
          </Text>
          <Text as="p">{username}</Text>
        </BlockStack>
      </ResourceItem>
    );
  };

  return (
    <Box paddingInline="3200">
      <Page
        title="Points"
        subtitle="View members point values and configure related settings"
        backAction={{ content: "Back", url: "/" }}
      >
        <BlockStack gap="500">
          <InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
            <Box>
              <Text as="h2" variant="headingMd">
                Settings
              </Text>
              <Text as="p" variant="bodyMd">
                Configure settings for points
              </Text>
            </Box>
            <Card>
              {guildRecord ? (
                <AutoForm action={api.guild.update} record={guildRecord}>
                  <FormLayout.Group>
                    <AutoNumberInput
                      field="reactPoints"
                      label="Reaction points"
                      helpText="Number of points per reaction bounty"
                    />
                    <AutoNumberInput
                      field="referralPoints"
                      helpText="Number of points per referral"
                    />
                    <AutoNumberInput
                      field="messagePoints"
                      helpText="Number of messages per point"
                    />
                    <AutoNumberInput
                      field="voicePoints"
                      helpText="Number minutes in voice per point"
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
                Points
              </Text>
              <Text as="p" variant="bodyMd">
                View server members point values
              </Text>
            </Box>
            <Card>
              <AutoTable
                model={api.point}
                live
                selectable={false}
                searchable={false}
                pageSize={10}
                columns={[
                  { header: "User", render: UserColumn },
                  { field: "messageCount", sortable: true },
                  { field: "referralCount", sortable: true },
                  { field: "reactCount", sortable: true },
                  { field: "secondsInVoice", sortable: true },
                  { field: "points", sortable: true },
                ]}
                initialSort={{ points: "Descending" }}
              />
              <InlineStack align="end">
                <ButtonGroup variant="segmented" connectedTop>
                  <Button icon={FolderUpIcon} onClick={toggleImport}>
                    Import
                  </Button>
                  <Button icon={FolderDownIcon} onClick={handleExport} loading={exporting}>
                    Export
                  </Button>
                </ButtonGroup>
              </InlineStack>
            </Card>
          </InlineGrid>
        </BlockStack>
      </Page>

      <Modal
        open={importActive}
        onClose={toggleImport}
        size="small"
        title="Import points"
        primaryAction={{
          content: "Import",
          icon: FolderUpIcon,
          onAction: handleImport,
          disabled: !file || !!fileError,
          loading: importing,
        }}
      >
        <Modal.Section>
          <DropZone
            allowMultiple={false}
            onDrop={handleDropZoneDrop}
            dropOnPage
            variableHeight
            accept="text/csv"
            label="Upload CSV"
            onClick={!file ? undefined : () => {}}
          >
            {file ? (
              <>
                <InlineGrid columns="1fr 5fr 1fr" gap="100" alignItems="center">
                  <Thumbnail size="small" alt={file.name} source={NoteIcon} />
                  <Text as="p">{_.truncate(file.name, { length: 40 })}</Text>
                  <Button
                    icon={DeleteIcon}
                    variant="plain"
                    onClick={() => {
                      setFile(undefined);
                      setFileError(undefined);
                    }}
                  />
                </InlineGrid>
              </>
            ) : (
              <DropZone.FileUpload
                actionTitle="Browse files"
                actionHint="Or drop .csv file to upload"
              />
            )}
          </DropZone>
          {fileError && <InlineError fieldID="file" message={fileError} />}
        </Modal.Section>
      </Modal>
    </Box>
  );
}
