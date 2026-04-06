import { EmojiPicker } from "@/components/emoji-picker";
import { MinMaxSlider, MinMaxSliderProps } from "@/components/min-max-slider";
import { RoleMultiselector } from "@/components/role-multiselector";
import { SortableItemHandle } from "@/components/ui/sortable";
import { FormSubmitResult, FormValidate } from "@/routes/_user.tickets-applications";
import { QuestionRecord as GadgetQuestionRecord, GadgetRecord } from "@gadget-client/manus-mortis";
import {
  AutoBooleanInput,
  AutoHiddenInput,
  AutoStringInput,
  useAutoFormMetadata,
} from "@gadgetinc/react/auto/polaris";
import { useLoaderData } from "@remix-run/react";
import {
  BlockStack,
  Box,
  Button,
  Card,
  Collapsible,
  FormLayout,
  Icon,
  InlineError,
  InlineGrid,
  InlineStack,
  Select,
  Text,
  TextField,
  Tooltip,
} from "@shopify/polaris";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  DeleteIcon,
  DragHandleIcon,
  PlusIcon,
} from "@shopify/polaris-icons";
import { APIRole, APISelectMenuOption } from "discord.js";
import { motion } from "framer-motion";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { FieldError, useFormContext, useWatch } from "react-hook-form";

export interface ExistingQuestion extends QuestionRecord {
  isNew: false;
}

export interface NewQuestion extends Partial<QuestionRecord> {
  isNew: true;
  index: number;
}

export type Question = ExistingQuestion | NewQuestion;

export enum QuestionType {
  StringSelect = "3",
  TextInput = "4",
  UserSelect = "5",
  FileUpload = "19",
}

export enum TextInputStyle {
  Short = "1",
  Paragraph = "2",
}

export interface QuestionComponentOption {
  label: string;
  value: QuestionType;
}

export interface StringSelectOption extends APISelectMenuOption {
  emoji?: { id: string; name: string };
  roles: string[];
}

export interface QuestionRecord extends Omit<
  GadgetRecord<GadgetQuestionRecord>,
  "stringSelectOptions"
> {
  stringSelectOptions: StringSelectOption[] | null;
}

export interface QuestionRef {
  submit: (applicationId: string) => Promise<FormSubmitResult>;
  validate: FormValidate;
  showDirty: () => boolean;
}

export interface QuestionProps {
  question: Question;
  isActive: boolean;
  onToggleActive: () => void;
  onDelete: () => void;
}

export interface StringSelectQuestionProps {
  question: Question;
  errorIndices: (number | null)[];
  onOptionsChange: (options: StringSelectOption[]) => void;
}

export interface TextInputQuestionProps {
  question: Question;
}

export interface FileUploadQuestionProps {
  question: Question;
}

const QUESTION_COMPONENT_OPTIONS: QuestionComponentOption[] = [
  { label: "Multiple choice", value: QuestionType.StringSelect },
  { label: "Text response", value: QuestionType.TextInput },
  { label: "File upload", value: QuestionType.FileUpload },
  { label: "User referral", value: QuestionType.UserSelect },
];

const TEXT_INPUT_STYLE_OPTIONS = [
  { label: "Short (single-line)", value: TextInputStyle.Short },
  { label: "Paragraph (multi-line)", value: TextInputStyle.Paragraph },
];

const TRANSITION = { duration: "100ms", timingFunction: "ease-in-out" };

function AutoMinMax({
  label,
  suffix,
  min,
  max,
}: Pick<MinMaxSliderProps, "label" | "suffix" | "min" | "max">) {
  const { watch, setValue, formState } = useFormContext();
  const { question: values } = watch();

  useEffect(() => {
    setValue("question.min", values?.min ?? min);
    setValue("question.max", values?.max ?? max);
  }, []);

  return (
    <MinMaxSlider
      label={label}
      min={min}
      max={max}
      suffix={suffix}
      range={[values?.min ?? min, values?.max ?? max]}
      minError={(formState.errors.question as any)?.min?.message}
      maxError={(formState.errors.question as any)?.max?.message}
      onChange={([newMin, newMax]) => {
        setValue("question.min", newMin, {
          shouldDirty: true,
        });
        setValue("question.max", newMax, {
          shouldDirty: true,
        });
      }}
    />
  );
}

export function UserReferral({ question }: { question: Question }) {
  const { setValue, watch } = useFormContext();

  const defaultTitle = "Were you referred to us by someone?" as const;
  const defaultDescription =
    "(Optional) If so, select them from the list. If not, you can leave it blank." as const;

  // On mount React calls
  //   entry  >  exit  >  entry
  // so we use a flag to ensure exit only runs on unmount
  let isEntry = true;
  useEffect(() => {
    // On entry
    const { title, description, isRequired } =
      question.type === QuestionType.UserSelect
        ? question
        : {
            title: defaultTitle,
            description: defaultDescription,
            isRequired: false,
          };

    setValue("question.title", title, { shouldDirty: true });
    setValue("question.description", description, { shouldDirty: true });
    setValue("question.isRequired", isRequired, { shouldDirty: true });

    // On exit
    return () => {
      const { question: values } = watch();
      if (!isEntry && values.type !== QuestionType.UserSelect) {
        const { title, description, isRequired } =
          question.type === QuestionType.UserSelect
            ? { title: "", description: "", isRequired: true }
            : question;
        console.log("Setting:", title, description, isRequired);
        setValue("question.title", title);
        setValue("question.description", description);
        setValue("question.isRequired", isRequired);
      }
      isEntry = false;
    };
  }, []);

  return <></>;
}

export function TextInputQuestion({}: TextInputQuestionProps) {
  const { watch, setValue, getFieldState, clearErrors } = useFormContext();
  const { question: values } = watch();

  return (
    <Box paddingBlock="200">
      <BlockStack gap="150">
        <FormLayout.Group>
          <Select
            label="Text Input type"
            options={TEXT_INPUT_STYLE_OPTIONS}
            error={getFieldState("question.textInputStyle").error?.message}
            onChange={(textInputStyle: TextInputStyle) => {
              clearErrors("question.textInputStyle");
              setValue("question.textInputStyle", textInputStyle, {
                shouldDirty: true,
              });
            }}
            placeholder="Select text input type"
            value={values?.textInputStyle ?? undefined}
            {...{
              [values?.textInputStyle ? "labelInline" : "labelHidden"]: true,
            }}
            requiredIndicator
          />
          <Tooltip content={"If this question has a min/max character limit"} width="wide">
            <AutoBooleanInput field="isCharLimited" label="Character limited" />
          </Tooltip>
          <AutoStringInput
            field="placeholder"
            label="Placeholder"
            placeholder="(Optional) Enter placeholder text"
            prefix={values?.placeholder ? "Placeholder:" : null}
            autoComplete="off"
            selectTextOnFocus
            labelHidden
            maxLength={100}
            showCharacterCount
            helpText="The prompt shown when the text box is empty"
          />
        </FormLayout.Group>
        {values?.isCharLimited && (
          <Box paddingBlock="300">
            <AutoMinMax label="Character limit" suffix="chars" min={1} max={4000} />
          </Box>
        )}
      </BlockStack>
    </Box>
  );
}

export function StringSelectQuestion({
  question,
  errorIndices,
  onOptionsChange,
}: StringSelectQuestionProps) {
  const { roles } = useLoaderData<{ roles: APIRole[] }>();
  const { watch, formState } = useFormContext();
  const [focusedIndex, setFocusedIndex] = useState<number>();
  const [options] = useState(question.stringSelectOptions ?? [{ label: "", value: "", roles: [] }]);
  const { question: values } = watch();

  const setOptionFields = <T extends keyof StringSelectOption>(
    index: number,
    fields: Pick<StringSelectOption, T>,
  ) => {
    Object.assign(options[index], fields);
    onOptionsChange(options);
  };

  return (
    <Box paddingBlock="200">
      <AutoStringInput
        field="placeholder"
        placeholder="(Optional) Enter selection placeholder"
        prefix={values?.placeholder ? "Placeholder:" : null}
        autoComplete="off"
        selectTextOnFocus
        autoSize
        labelHidden
        maxLength={100}
        showCharacterCount
        helpText="The prompt shown when the selection box is empty"
      />
      <Box padding="200" paddingBlock="200">
        <FormLayout>
          {values?.isMultiSelect && (
            <Box paddingBlock="100">
              <AutoMinMax
                label="Number of allowed choices"
                min={1}
                max={options.length}
                suffix={{ singular: "choice", plural: "choices" }}
              />
            </Box>
          )}
          <InlineGrid columns="1fr auto">
            <Text
              as="span"
              variant="bodyMd"
              tone={
                (formState.errors.question as any)?.stringSelectOptions?.message
                  ? "critical"
                  : "base"
              }
            >
              Choices
              {(formState.errors.question as any)?.stringSelectOptions?.message && (
                <InlineError
                  fieldID="question.stringSelectOptions"
                  message={(formState.errors.question as any)?.stringSelectOptions?.message}
                />
              )}
            </Text>
            <Button
              variant="tertiary"
              icon={PlusIcon}
              onClick={() => {
                options.push({ value: "", label: "", roles: [] });
                onOptionsChange(options);
              }}
              disabled={options.length >= 25}
            >
              Add choice
            </Button>
          </InlineGrid>
          {options.map((option, index) => (
            <>
              <TextField
                label="Choices"
                labelHidden
                value={option.label}
                onChange={(label) => {
                  const idx: number = errorIndices.findIndex((i) => i === index);
                  if (idx !== -1) errorIndices[idx] = null;
                  setOptionFields(index, { label });
                }}
                onFocus={() => setFocusedIndex(index)}
                placeholder="Enter choice"
                prefix={option.label ? "Choice:" : null}
                autoComplete="off"
                maxLength={100}
                showCharacterCount
                error={errorIndices.includes(index) ? "is required" : undefined}
                connectedLeft={
                  <InlineStack>
                    <Button
                      variant="monochromePlain"
                      icon={focusedIndex === index ? ChevronDownIcon : ChevronUpIcon}
                      onClick={() => setFocusedIndex(focusedIndex === index ? undefined : index)}
                    />
                    <EmojiPicker
                      onChange={(emoji) => {
                        setOptionFields(index, { emoji });
                      }}
                      initial={option.emoji}
                    />
                  </InlineStack>
                }
                connectedRight={
                  <Button
                    icon={DeleteIcon}
                    variant="tertiary"
                    onClick={() => {
                      options.splice(index, 1);
                      onOptionsChange(options);
                    }}
                    disabled={options.length <= 1}
                  />
                }
              />
              <Collapsible
                open={focusedIndex === index}
                id={"stringSelectOptionRoles" + index}
                transition={{
                  duration: "100ms",
                  timingFunction: "ease-in-out",
                }}
              >
                <Box paddingBlockStart="200" paddingInlineStart="1600" paddingInlineEnd="600">
                  <BlockStack gap="200">
                    <TextField
                      label="Option description"
                      labelHidden
                      placeholder="(Optional) Enter choice description"
                      value={option.description}
                      prefix={option.description ? "Description:" : null}
                      autoComplete="off"
                      autoSize
                      maxLength={100}
                      showCharacterCount
                      onChange={(description) =>
                        setOptionFields(index, {
                          description,
                        })
                      }
                    />

                    <RoleMultiselector
                      placeholder={
                        options[index].roles.length > 0 ? "Search roles" : "(Optional) Select roles"
                      }
                      roles={roles}
                      selected={roles.filter((role) => options[index].roles.includes(role.id))}
                      onSelectionChange={(roles) =>
                        setOptionFields(index, {
                          roles: roles.map((role) => role.id),
                        })
                      }
                      helpText="Roles assigned upon acceptance if choice selected"
                    />
                  </BlockStack>
                </Box>
              </Collapsible>
            </>
          ))}
        </FormLayout>
      </Box>
    </Box>
  );
}

export function FileUploadQuestion() {
  const { question: values } = useWatch();

  return (
    <Box paddingBlockStart="150">
      <FormLayout>
        {values?.isMultiUpload && (
          <AutoMinMax
            label="Number of files"
            suffix={{ singular: "upload", plural: "uploads" }}
            min={1}
            max={10}
          />
        )}
      </FormLayout>
    </Box>
  );
}

export const ApplicationQuestionsQuestion = forwardRef<QuestionRef, QuestionProps>(
  ({ isActive, onToggleActive, question, onDelete }, ref) => {
    const [stringSelectErrorIndices, setStringSelectErrorIndices] = useState<number[]>([]);
    const {
      watch,
      setValue,
      formState,
      clearErrors,
      trigger: validate,
      setError,
    } = useFormContext();
    const { submit } = useAutoFormMetadata();
    const { question: values } = watch();

    useImperativeHandle(
      ref,
      () => ({
        submit: (id: string) => {
          setValue("question.application", { _link: id });
          return submit() as any as Promise<FormSubmitResult>;
        },
        validate: async () => {
          if (values?.type === QuestionType.StringSelect) {
            const options = values.stringSelectOptions as StringSelectOption[] | undefined;

            if (!options) {
              setStringSelectErrorIndices([0]);
              return false;
            }

            const errors = options.flatMap((option, index) =>
              option.label.length === 0 ? [index] : [],
            );

            if (errors.length > 0) {
              setStringSelectErrorIndices(errors);
              return false;
            }
          }

          if (values?.type === QuestionType.TextInput) {
            const style = values.textInputStyle as TextInputStyle | undefined;
            if (style === undefined || style === null) {
              setError("question.textInputStyle", { message: "is required" });
              return false;
            }
          }
          return validate();
        },
        showDirty: () => {
          const dirty = formState.dirtyFields.question;
          clearErrors();
          if (dirty) {
            Object.keys(dirty).forEach((field) =>
              setError(`question.${field}`, { message: "has unsaved changes!" }),
            );
            return true;
          }
          return false;
        },
      }),
      [submit, validate, setValue, formState],
    );

    return (
      <motion.div
        key={"question div" + question.index}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -10 }}
        transition={{ duration: 0.1 }}
        layout
      >
        <Card>
          <div {...(isActive ? {} : { onClick: onToggleActive, style: { cursor: "pointer" } })}>
            <InlineGrid columns="1fr auto">
              <InlineStack>
                <SortableItemHandle className="px-2">
                  <Icon
                    source={DragHandleIcon}
                    tone={
                      (formState.errors.question as any)?.index?.message ? "textCritical" : "base"
                    }
                  />
                </SortableItemHandle>
                <AutoStringInput
                  field="title"
                  label="Question Title"
                  placeholder="Enter question title"
                  prefix={values?.title ? `Question:` : null}
                  autoComplete="off"
                  selectTextOnFocus
                  autoSize
                  labelHidden
                  maxLength={45}
                  showCharacterCount
                  requiredIndicator
                />
              </InlineStack>
              <Button
                variant="tertiary"
                icon={isActive ? ChevronDownIcon : ChevronUpIcon}
                onClick={onToggleActive}
              />
            </InlineGrid>
            <InlineError
              fieldID="index"
              message={(formState.errors.question as any)?.index?.message}
            />
          </div>
          <Box paddingBlockStart="200">
            <Collapsible open={isActive} id={"question" + question.index} transition={TRANSITION}>
              <FormLayout>
                <AutoStringInput
                  field="description"
                  label="Question Description"
                  placeholder="(Optional) Enter question description"
                  prefix={values?.description ? "Description:" : null}
                  autoComplete="off"
                  selectTextOnFocus
                  autoSize
                  labelHidden
                  maxLength={100}
                  showCharacterCount
                />

                <FormLayout.Group>
                  <Select
                    label="Question type"
                    options={QUESTION_COMPONENT_OPTIONS}
                    onChange={(type: QuestionType) => {
                      setValue("question.type", type, {
                        shouldDirty: true,
                      });
                      clearErrors("question.type");
                    }}
                    placeholder="Select question type"
                    value={values?.type ?? undefined}
                    {...{ [values?.type ? "labelInline" : "labelHidden"]: true }}
                    requiredIndicator
                    error={(formState.errors.question?.type as FieldError | undefined)?.message}
                  />
                  <FormLayout.Group condensed>
                    <Tooltip content={"If this question requires an answer"} width="wide">
                      <AutoBooleanInput field="isRequired" label="Required" />
                    </Tooltip>
                    {values?.type === QuestionType.StringSelect && (
                      <Tooltip content={"If multiple answers can be selected"} width="wide">
                        <AutoBooleanInput field="isMultiSelect" label="Multi-select" />
                      </Tooltip>
                    )}
                    {values?.type === QuestionType.FileUpload && (
                      <Tooltip content={"If more than one files can be uploaded"} width="wide">
                        <AutoBooleanInput field="isMultiUpload" label="Multiple files" />
                      </Tooltip>
                    )}
                  </FormLayout.Group>
                </FormLayout.Group>
              </FormLayout>

              <Collapsible
                open={values?.type === QuestionType.StringSelect}
                id={"stringSelect" + question.index}
                transition={TRANSITION}
              >
                <StringSelectQuestion
                  question={question}
                  errorIndices={stringSelectErrorIndices}
                  onOptionsChange={(options) =>
                    setValue("question.stringSelectOptions", options, {
                      shouldDirty: true,
                    })
                  }
                />
              </Collapsible>

              <Collapsible
                open={values?.type === QuestionType.TextInput}
                id={"textInput" + question.index}
                transition={TRANSITION}
              >
                <TextInputQuestion question={question} />
              </Collapsible>

              <Collapsible
                open={values?.type === QuestionType.FileUpload}
                id={"fileUpload" + question.index}
                transition={TRANSITION}
              >
                <FileUploadQuestion />
              </Collapsible>

              <Box paddingBlockStart="200">
                <InlineStack align="end">
                  <Button variant="tertiary" icon={DeleteIcon} onClick={onDelete}>
                    Delete question
                  </Button>
                </InlineStack>
              </Box>
            </Collapsible>
          </Box>

          {values?.type === QuestionType.UserSelect && <UserReferral question={question} />}
          <AutoHiddenInput field="min" value={question.min} />
          <AutoHiddenInput field="max" value={question.max} />
          <AutoHiddenInput field="type" value={question.type} />
          <AutoHiddenInput field="textInputStyle" value={question.textInputStyle} />
          <AutoHiddenInput field="stringSelectOptions" value={question.stringSelectOptions} />
        </Card>
      </motion.div>
    );
  },
);
