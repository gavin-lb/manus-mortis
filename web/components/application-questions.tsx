import { api } from "@/api";
import {
  ApplicationQuestionsQuestion,
  ExistingQuestion,
  Question,
  QuestionRecord,
  QuestionRef,
} from "@/components/application-questions-question";
import { Sortable, SortableContent, SortableItem } from "@/components/ui/sortable";
import noContent from "@/images/no-content.png";

import { FormSubmitResult, FormValidate } from "@/routes/_user.tickets-applications";
import { useFindMany } from "@gadgetinc/react";
import { AutoForm, AutoHiddenInput } from "@gadgetinc/react/auto/polaris";
import {
  BlockStack,
  Button,
  EmptyState,
  InlineError,
  InlineGrid,
  InlineStack,
  Spinner,
  Text,
} from "@shopify/polaris";
import { PlusIcon } from "@shopify/polaris-icons";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

export interface QuestionsRef {
  validate: FormValidate;
  submit: (id: string) => Promise<FormSubmitResult>[];
  showDirty: () => boolean;
}

export interface QuestionsProps {
  applicationId?: string;
  isSubmitting: boolean;
}

export const ApplicationQuestions = forwardRef<QuestionsRef, QuestionsProps>(
  ({ applicationId, isSubmitting }, ref) => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [active, setActive] = useState<number | null>(null);
    const [isError, setIsError] = useState(false);
    const [recordsToDelete] = useState<string[]>([]);
    const questionRefs = useRef<Record<string, QuestionRef>>({});

    const setQuestionRef = (key: number) => (el: QuestionRef | null) => {
      if (el) questionRefs.current[key] = el;
      else delete questionRefs.current[key];
    };

    const [{ data: questionRecords, fetching }, _refetch] = useFindMany(api.question, {
      filter: { applicationId: { equals: applicationId ?? null } },
      sort: [{ index: "Ascending" }],
    });

    useEffect(() => {
      if (questionRecords && !isSubmitting) {
        setQuestions(questionRecords.map((q) => ({ ...q, isNew: false } as ExistingQuestion)));
      }
    }, [questionRecords]);

    const addQuestion = () => {
      if (questions) {
        setActive(null);
        setIsError(false);
        setQuestions(
          questions.concat({
            index: Math.max(-1, ...questions.map((q) => q.index)) + 1,
            isNew: true,
          }),
        );
      }
    };

    const validate = async () => {
      const entries = Object.entries(questionRefs.current);
      const isNoQuestions = entries.length === 0;
      const validateAll = await Promise.all(entries.map(([_, { validate }]) => validate()));
      const firstInvalidQuestionIndex = validateAll.findIndex((v) => v === false);
      const questionsIsValid = firstInvalidQuestionIndex === -1;
      if (isNoQuestions) {
        setIsError(true);
        return false;
      } else if (!questionsIsValid) {
        setActive(Number(entries[firstInvalidQuestionIndex][0]));
        return false;
      } else {
        return true;
      }
    };

    const submit = (id: string) => {
      api.question.bulkDelete(recordsToDelete);
      return Object.values(questionRefs.current).map(({ submit }) => submit(id));
    };

    useImperativeHandle(
      ref,
      () => ({
        submit,
        validate,
        showDirty: () =>
          Object.values(questionRefs.current)
            .map(({ showDirty }) => showDirty())
            .some(Boolean),
      }),
      [questionRefs],
    );

    return (
      <>
        {fetching ? (
          <InlineStack align="center" blockAlign="center">
            <Spinner />
          </InlineStack>
        ) : (
          <Sortable
            value={questions}
            onValueChange={setQuestions}
            getItemValue={(question: Question) => question.index}
          >
            <BlockStack gap="400">
              <div>
                <InlineGrid columns="1fr auto">
                  <Text as="span" variant="bodyMd">
                    Questions
                  </Text>
                  <Button
                    variant="tertiary"
                    icon={PlusIcon}
                    onClick={addQuestion}
                    tone={isError ? "critical" : undefined}
                    disabled={questions.length >= 5}
                  >
                    Add question
                  </Button>
                </InlineGrid>
                {isError && <InlineError message="is required" fieldID="questions" />}
              </div>
              {questions.length > 0 ? (
                <SortableContent>
                  <BlockStack align="center" gap="200">
                    {questions.map((question, index) => (
                      <SortableItem value={question.index} key={"sortable" + question.index}>
                        <AutoForm
                          action={question.isNew ? api.question.create : api.question.update}
                          record={(question.isNew ? undefined : question) as QuestionRecord}
                        >
                          <ApplicationQuestionsQuestion
                            ref={setQuestionRef(question.index)}
                            question={question}
                            isActive={active === question.index}
                            onToggleActive={() =>
                              setActive(active === question.index ? null : question.index)
                            }
                            onDelete={() => {
                              setQuestions(questions.filter((q) => q.index !== question.index));
                              setActive(null);
                              if (!question.isNew) recordsToDelete.push(question.id);
                            }}
                          />
                          <AutoHiddenInput field="index" value={index} />
                          {question.isNew && (
                            <AutoHiddenInput field="application" value={applicationId} />
                          )}
                        </AutoForm>
                      </SortableItem>
                    ))}
                  </BlockStack>
                </SortableContent>
              ) : (
                <EmptyState heading="No questions yet" image={noContent}>
                  Add questions to this applicaion for the applicant to answer
                </EmptyState>
              )}
            </BlockStack>
          </Sortable>
        )}
      </>
    );
  },
);
