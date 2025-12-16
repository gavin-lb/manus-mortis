import { api } from "@/api";
import { FormSelector } from "@/components/form-selector";
import { WelcomeMessageRecord } from "@gadget-client/manus-mortis";
import { useAction } from "@gadgetinc/react";
import {
  AutoEnumInput,
  AutoForm,
  AutoHiddenInput,
  AutoInput,
  AutoStringInput,
  AutoTable,
} from "@gadgetinc/react/auto/polaris";
import { LoaderFunction } from "@remix-run/node";
import {
  ActionList,
  BlockStack,
  Button,
  Card,
  InlineStack,
  Modal,
  Page,
  Popover,
  Tag,
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
import { useRef, useState } from "react";

export const loader = (async ({ context }) => {
  const [roles, channels]: [APIRole[], APIChannel[]] = await Promise.all([
    context.api.getRoles(),
    context.api.getChannels(),
  ]);

  return {
    roles,
    channels: channels.filter(
      (channel: APIChannel) =>
        channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildAnnouncement,
    ),
  };
}) satisfies LoaderFunction;

export default function () {
  const [modalActive, setModalActive] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [deleteConfirmActive, setDeleteConfirmActive] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<WelcomeMessageRecord | undefined>(undefined);
  const [selectedType, setSelectedType] = useState<WelcomeMessageRecord["type"] | null>(null);
  const [popoverId, setPopoverId] = useState<string | null>(null);
  const buttonRef = useRef<HTMLDivElement>(null!);

  const [{ fetching: deleteFetching }, useDelete] = useAction(api.welcomeMessage.delete);

  const toggleModal = () => {
    setSelectedType(null);
    setModalActive((active) => !active);
  };
  const toggleDeleteConfirm = () => setDeleteConfirmActive((active) => !active);

  const ActionMenu = ({ record }: { record: WelcomeMessageRecord }) => (
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

  const RoleColumn = ({ record }: { record: WelcomeMessageRecord }) => {
    const role = record.role as { name: string; id: string } | undefined;
    return role?.name ? <Tag>@{role.name}</Tag> : "";
  };

  const ChannelColumn = ({ record }: { record: WelcomeMessageRecord }) => {
    const channel = record.channel as { name: string; id: string };
    return <Tag>#{channel.name}</Tag>;
  };

  return (
    <Page
      title="Welcome Messages"
      subtitle="Configure the welcome messages the bot sends for new users or roles"
      backAction={{ content: "Back", url: "/" }}
    >
      <Card>
        <BlockStack gap="200">
          <AutoTable
            live
            model={api.welcomeMessage}
            selectable={false}
            onClick={(_row, record) => setPopoverId(popoverId == record.id ? null : record.id)}
            columns={[
              "type",
              { header: "Role", render: RoleColumn },
              { header: "Channel", render: ChannelColumn },
              "title",
              "message",
              "image",
              { header: "", render: ActionMenu },
            ]}
          ></AutoTable>
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
      <Modal
        activator={buttonRef}
        open={modalActive}
        onClose={toggleModal}
        title={selectedRecord ? "Edit the Welcome Message" : "Add a Welcome Message"}
        primaryAction={{
          content: selectedRecord ? "Save" : "Submit",
          onAction: () => {
            setIsSubmitting(true);
            document.forms[0].requestSubmit();
          },
          icon: selectedRecord ? SaveIcon : SendIcon,
          loading: isSubmitting,
        }}
      >
        <Modal.Section>
          <AutoForm
            action={selectedRecord ? api.welcomeMessage.update : api.welcomeMessage.create}
            record={selectedRecord as WelcomeMessageRecord}
            onSuccess={() => {
              toggleModal();
              setIsSubmitting(false);
            }}
            onFailure={() => setIsSubmitting(false)}
          >
            <BlockStack gap="200">
              <AutoEnumInput field="type" afterChange={setSelectedType} />
              {(selectedType ?? selectedRecord?.type) === "role" ? (
                <FormSelector
                  label="Role"
                  model="welcomeMessage"
                  field="role"
                  loaderData="roles"
                  record={selectedRecord}
                />
              ) : (
                <AutoHiddenInput field="role" value={{}} />
              )}
            </BlockStack>
            <FormSelector
              label="Channel"
              model="welcomeMessage"
              field="channel"
              loaderData="channels"
              record={selectedRecord}
            />
            <AutoInput field="title" />
            <AutoStringInput
              field="message"
              multiline={4}
              helpText="You can use ${USER} as a placeholder and it'll be replaced with the member's username in the welcome message"
            />
            <AutoInput field="image" />
          </AutoForm>
        </Modal.Section>
      </Modal>
      <Modal
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
        <Modal.Section>Are you sure you want to delete this Welcome Message?</Modal.Section>
      </Modal>
    </Page>
  );
}
