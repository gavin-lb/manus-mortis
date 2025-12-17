import { api } from "@/api";
import { ApplicationForm, ApplicationFormRef } from "@/components/application-form";
import { ApplicationQuestions, QuestionsRef } from "@/components/application-questions";
import { QuestionType, StringSelectOption } from "@/components/application-questions-question";
import { FormSelector } from "@/components/form-selector";
import { ApplicationRecord, QuestionRecord } from "@gadget-client/manus-mortis";
import { useAction, useFindBy } from "@gadgetinc/react";
import { AutoForm, AutoHiddenInput, AutoSubmit, AutoTable } from "@gadgetinc/react/auto/polaris";
import { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  ActionList,
  BlockStack,
  Box,
  Button,
  Card,
  Divider,
  InlineGrid,
  InlineStack,
  List,
  Modal,
  Page,
  Popover,
  SkeletonBodyText,
  SkeletonDisplayText,
  Tag,
  Text,
  Tooltip,
} from "@shopify/polaris";
import {
  DeleteIcon,
  EditIcon,
  MenuHorizontalIcon,
  PlusIcon,
  SaveIcon,
  SendIcon,
} from "@shopify/polaris-icons";
import { APIChannel, APIRole, ChannelType } from "discord.js";
import { Emoji, EmojiStyle } from "emoji-picker-react";
import { AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";

export type FormSubmitResult = {
  fetching: boolean;
  stale: boolean;
  data?: any;
  error?:
    | {
        message: string;
        executionErrors: Error[];
        networkError?: Error | undefined;
        response?: any;
        name: string;
        stack?: string | undefined;
        cause?: unknown;
      }
    | undefined;
  extensions?: { [x: string]: any } | undefined;
  operation?: unknown | undefined;
};
export type FormValidate = () => Promise<boolean>;

export type FormSubmit = () => Promise<FormSubmitResult>;

export const loader = (async ({ context }) => {
  const [roles, channels]: [APIRole[], APIChannel[]] = await Promise.all([
    context.api.getRoles(),
    context.api.getChannels(),
  ]);

  return {
    roles,
    channels: channels.filter((channel) =>
      [ChannelType.GuildText, ChannelType.GuildAnnouncement].includes(channel.type),
    ),
    serverId: process.env.SERVER_ID!,
  };
}) satisfies LoaderFunction;

export default function () {
  const [modalActive, setModalActive] = useState<boolean>(false);
  const [deleteConfirmActive, setDeleteConfirmActive] = useState<boolean>(false);
  const [closeConfirmActive, setCloseConfirmActive] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<ApplicationRecord | undefined>(undefined);
  const [popoverId, setPopoverId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { serverId } = useLoaderData<typeof loader>();

  const [{ data: guildRecord }] = useFindBy(api.guild.findByServerId, serverId);

  const buttonRef = useRef<HTMLDivElement>(null!);
  const applicationFormRef = useRef<ApplicationFormRef>(null);
  const questionsRef = useRef<QuestionsRef>(null);

  const [{ fetching: deleteFetching }, useDelete] = useAction(api.application.delete);

  const toggleModal = () => {
    setModalActive((active) => !active);
  };

  const toggleDeleteConfirm = () => setDeleteConfirmActive((active) => !active);
  const toggleCloseConfirm = () => setCloseConfirmActive((active) => !active);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const applicationIsValid = await applicationFormRef.current?.validate();
    const questionsIsValid = await questionsRef.current?.validate();

    if (applicationIsValid && questionsIsValid) {
      const resp = await applicationFormRef.current?.submit();
      if (resp?.data) {
        await Promise.all(questionsRef.current?.submit(resp.data.id)!);
        toggleModal();
      }
    }
    setIsSubmitting(false);
  };

  const handleClose = () => {
    const applicationDirty = applicationFormRef.current?.showDirty();
    const questionsDirty = questionsRef.current?.showDirty();
    if (applicationDirty || questionsDirty) {
      toggleCloseConfirm();
    } else {
      toggleModal();
    }
  };

  const ActionMenu = ({ record }: { record: ApplicationRecord }) => (
    <InlineStack align="end">
      <Popover
        active={popoverId == record.id}
        activator={
          <Button
            variant="plain"
            icon={MenuHorizontalIcon}
            disclosure={popoverId == record.id ? "down" : "up"}
          />
        }
        onClose={() => setPopoverId(null)}
      >
        <ActionList
          actionRole="menuitem"
          items={[
            {
              content: "Edit",
              icon: EditIcon,
              onAction: () => {
                setSelectedRecord(record);
                toggleModal();
              },
            },
            {
              content: "Delete",
              destructive: true,
              icon: DeleteIcon,
              onAction: () => {
                setSelectedRecord(record);
                toggleDeleteConfirm();
              },
            },
          ]}
        />
      </Popover>
    </InlineStack>
  );

  const TitleColumn = ({ record }: { record: ApplicationRecord }) => {
    const emoji = record?.emoji as { id: string; name: string } | null;
    return (
      <InlineStack gap="200" blockAlign="center">
        {emoji && <Emoji unified={emoji.id} emojiStyle={EmojiStyle.TWITTER} size={16} />}
        {record.title}
      </InlineStack>
    );
  };

  const RoleColumn = ({ record }: { record: ApplicationRecord }) => {
    const role = record.handlerRole as { name: string; id: string } | null;
    return role?.name ? <Tag>@{role.name}</Tag> : null;
  };

  const ChannelColumn = ({ record }: { record: ApplicationRecord }) => {
    const channel = record.channel as { name: string; id: string } | null;
    return channel?.name ? <Tag>#{channel.name}</Tag> : null;
  };

  const QuestionsColumn = ({
    record: {
      id,
      questions: { edges },
    },
  }: {
    record: { id: string; questions: { edges: { node: QuestionRecord }[] } };
  }) => {
    return edges
      .toSorted((a, b) => a.node.index - b.node.index)
      .map(({ node: question }) => (
        <Tooltip
          key={"tooltip" + id + question.index}
          width="wide"
          content={
            <BlockStack gap="100">
              <Text as="h1" variant="headingSm">
                {question.title}
              </Text>
              {question.description && (
                <Text as="p" variant="bodySm">
                  {question.description}
                </Text>
              )}
              {question.type === QuestionType.StringSelect && (
                <List>
                  {(question.stringSelectOptions as StringSelectOption[] | null)?.map(
                    (option, index) => (
                      <List.Item key={`option ${question.index}.${index}`}>
                        {option.label}
                      </List.Item>
                    ),
                  )}
                </List>
              )}
              <div>
                <Tag key={"questionType" + id + question.index} size="large">
                  <Text as="p" fontWeight="bold">
                    {
                      {
                        3: "Multiple choice",
                        4: "Text response",
                        5: "User referral",
                        19: "File upload",
                      }[question.type]
                    }
                  </Text>
                </Tag>
              </div>
            </BlockStack>
          }
        >
          <Tag key={"questionTag" + id + question.index}>Q{question.index + 1}</Tag>
        </Tooltip>
      ));
  };

  return (
    <Box paddingInline="3200">
      <Page
        title="Tickets & Applications"
        subtitle="Configure settings for tickets and applications"
        backAction={{ content: "Back", url: "/" }}
      >
        <BlockStack gap="500">
          <InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
            <Box>
              <Text as="h2" variant="headingMd">
                General
              </Text>
              <Text as="p" variant="bodyMd">
                Configure general settings
              </Text>
            </Box>
            <Card>
              {guildRecord ? (
                <AutoForm action={api.guild.update} record={guildRecord}>
                  <FormSelector
                    label="Post Channel"
                    helpText="Channel with post to open new tickets or applications"
                    field="postChannel"
                    model="guild"
                    loaderData="channels"
                    record={guildRecord}
                    required
                  />
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
                Tickets
              </Text>
              <Text as="p" variant="bodyMd">
                Configure settings for tickets
              </Text>
            </Box>
            <Card>
              {guildRecord ? (
                <AutoForm action={api.guild.update} record={guildRecord}>
                  <FormSelector
                    label="Tickets Channel"
                    field="ticketsChannel"
                    model="guild"
                    loaderData="channels"
                    record={guildRecord}
                    required
                    helpText="The channel which new ticket threads will be created in"
                  />
                  <FormSelector
                    label="Tickets Handler"
                    field="ticketsHandler"
                    model="guild"
                    loaderData="roles"
                    record={guildRecord}
                    required
                    helpText="The role which will handle tickets"
                  />
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
                Applications
              </Text>
              <Text as="p" variant="bodyMd">
                Configure settings for applications
              </Text>
            </Box>
            <Card>
              <BlockStack gap="500">
                <AutoTable
                  live
                  model={api.application}
                  selectable={false}
                  searchable={false}
                  paginate={false}
                  onClick={(_row, record: ApplicationRecord) =>
                    setPopoverId(popoverId == record.id ? null : record.id)
                  }
                  columns={[
                    { header: "Title", render: TitleColumn },
                    { header: "Handler", render: RoleColumn },
                    { header: "Channel", render: ChannelColumn },
                    {
                      header: "Questions",
                      render: QuestionsColumn,
                    },
                    { header: "", render: ActionMenu },
                  ]}
                  select={{
                    id: true,
                    title: true,
                    emoji: true,
                    description: true,
                    handlerRole: true,
                    channel: true,
                    roles: true,
                    questions: {
                      edges: {
                        node: {
                          title: true,
                          type: true,
                          index: true,
                          description: true,
                          stringSelectOptions: true,
                        },
                      },
                    },
                  }}
                  initialSort={{ title: "Ascending" }}
                />

                <InlineStack align="end">
                  <div ref={buttonRef}>
                    <Button
                      variant="secondary"
                      icon={PlusIcon}
                      onClick={() => {
                        setSelectedRecord(undefined);
                        toggleModal();
                      }}
                    >
                      Add
                    </Button>
                  </div>
                </InlineStack>
              </BlockStack>
            </Card>
          </InlineGrid>
        </BlockStack>
        <Modal
          activator={buttonRef}
          open={modalActive}
          onClose={handleClose}
          title={selectedRecord ? "Edit the Application" : "Create an Application"}
          primaryAction={{
            content: selectedRecord ? "Save" : "Submit",
            onAction: handleSubmit,
            icon: selectedRecord ? SaveIcon : SendIcon,
            loading: isSubmitting,
          }}
        >
          <AnimatePresence>
            <Modal.Section key="applicationSection">
              <AutoForm
                action={selectedRecord ? api.application.update : api.application.create}
                record={selectedRecord as ApplicationRecord}
              >
                <ApplicationForm
                  ref={applicationFormRef}
                  selectedRecord={selectedRecord as ApplicationRecord}
                />
                {!selectedRecord && guildRecord && (
                  <AutoHiddenInput field="guild" value={guildRecord.id} />
                )}
              </AutoForm>
            </Modal.Section>
            <Modal.Section key="questionSection">
              <ApplicationQuestions
                ref={questionsRef}
                isSubmitting={isSubmitting}
                applicationId={selectedRecord?.id}
              />
            </Modal.Section>
          </AnimatePresence>
        </Modal>
        <Modal
          key="deleteConfirm"
          open={deleteConfirmActive}
          onClose={toggleDeleteConfirm}
          size="small"
          title="Please confirm"
          primaryAction={{
            content: "Confirm",
            icon: DeleteIcon,
            onAction: () => useDelete(selectedRecord!).finally(toggleDeleteConfirm),
            loading: deleteFetching,
          }}
          secondaryActions={[
            {
              content: "Cancel",
              onAction: toggleDeleteConfirm,
            },
          ]}
        >
          <Modal.Section>Are you sure you want to delete this application?</Modal.Section>
        </Modal>
        <Modal
          key="closeConfirm"
          open={closeConfirmActive}
          onClose={toggleCloseConfirm}
          size="small"
          title="You have unsaved changes!"
          primaryAction={{
            content: "Discard",
            icon: DeleteIcon,
            onAction: () => toggleCloseConfirm() ?? toggleModal(),
          }}
          secondaryActions={[
            {
              content: "Cancel",
              onAction: toggleCloseConfirm,
            },
          ]}
        >
          <Modal.Section>Are you sure you want discard unsaved changes?</Modal.Section>
        </Modal>
      </Page>
    </Box>
  );
}
