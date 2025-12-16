import { Emoji, EmojiPicker } from "@/components/emoji-picker";
import { FormSelector } from "@/components/form-selector";
import { RoleMultiselector } from "@/components/role-multiselector";
import { FormSubmit, FormValidate } from "@/routes/_user.tickets-applications";
import { ApplicationRecord } from "@gadget-client/manus-mortis";
import { useFormContext } from "@gadgetinc/react";
import {
  AutoHiddenInput,
  AutoStringInput,
  useAutoFormMetadata,
} from "@gadgetinc/react/auto/polaris";
import { useLoaderData } from "@remix-run/react";
import { APIRole } from "discord.js";
import { forwardRef, useImperativeHandle } from "react";

export interface ApplicationFormRef {
  submit: FormSubmit;
  validate: FormValidate;
  showDirty: () => boolean;
}

export interface ApplicationFormProps {
  selectedRecord?: ApplicationRecord;
}

export const ApplicationForm = forwardRef<ApplicationFormRef, ApplicationFormProps>(
  ({ selectedRecord }, ref) => {
    const { trigger: validate, formState, setError, setValue, clearErrors } = useFormContext();
    const { submit } = useAutoFormMetadata();
    const { roles } = useLoaderData<{ roles: APIRole[] }>();

    useImperativeHandle(
      ref,
      () => ({
        submit: submit as unknown as FormSubmit, // TS struggles to resolves this type
        validate,
        showDirty,
      }),
      [validate, submit, formState],
    );

    const showDirty = () => {
      const dirty = formState.dirtyFields.application;
      clearErrors();
      if (dirty) {
        Object.keys(dirty).forEach((field) =>
          setError(`application.${field}`, { message: "has unsaved changes!" }),
        );
        return true;
      }
      return false;
    };

    return (
      <>
        <AutoHiddenInput field="emoji" value={selectedRecord?.emoji} />

        <AutoStringInput
          helpText="A title for the application"
          field="title"
          maxLength={45}
          showCharacterCount
          connectedLeft={
            <EmojiPicker
              onChange={(emoji) => setValue("application.emoji", emoji, { shouldDirty: true })}
              initial={(selectedRecord?.emoji as Emoji | null) ?? undefined}
            />
          }
        />
        <AutoStringInput
          helpText="(Optional) A brief description of the application type"
          field="description"
          maxLength={100}
          showCharacterCount
        />

        <FormSelector
          label="Handler"
          helpText="The role which will handle this type of application"
          model="application"
          field="handlerRole"
          loaderData="roles"
          record={selectedRecord}
        />

        <FormSelector
          label="Channel"
          helpText="The channel which applicant threads will be created in"
          model="application"
          field="channel"
          loaderData="channels"
          record={selectedRecord}
        />

        <RoleMultiselector
          label="Roles"
          helpText="(Optional) The roles which will be given to a successful applicant"
          roles={roles}
          onSelectionChange={(newRoles) => {
            setValue("application.roles", newRoles, { shouldDirty: true });
          }}
          selected={(selectedRecord?.roles as APIRole[] | null) ?? undefined}
          error={(formState.errors.application as any)?.roles?.message}
        />
        <AutoHiddenInput field="roles" value={selectedRecord?.roles} />
      </>
    );
  },
);
