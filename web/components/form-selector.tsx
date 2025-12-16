import { GadgetRecord } from "@gadget-client/manus-mortis-v2";
import { AutoHiddenInput } from "@gadgetinc/react/auto/polaris";
import { useLoaderData } from "@remix-run/react";
import { Combobox, Icon, Listbox, Tag, TextFieldProps } from "@shopify/polaris";
import { SearchIcon } from "@shopify/polaris-icons";
import { useEffect, useState } from "react";
import { FieldErrors, useFormContext } from "react-hook-form";

type Props = {
  label: string;
  loaderData: string;
  model: string;
  field: string;
  record?: GadgetRecord<any>;
  required?: boolean;
} & Partial<TextFieldProps>;

export function FormSelector({
  label,
  loaderData,
  field,
  model,
  record,
  required,
  ...props
}: Props) {
  const data = useLoaderData<{ [key: string]: { id: string; name: string }[] }>()[loaderData];
  const [input, setInput] = useState("");
  const [options, setOptions] = useState(data);
  const { formState, setValue, clearErrors, setError } = useFormContext();
  const isRecordinData = data.map((item) => item.id).includes(record?.[field]?.id);
  const [selected, setSelected] = useState<(typeof data)[number] | undefined>(
    isRecordinData ? record[field] : undefined,
  );

  useEffect(() => {
    if (record && !isRecordinData) {
      setError(`${model}.${field}`, { message: "Previous value no longer exists" });
    }
  }, []);

  useEffect(() => {
    let target: { name: string; id: string } | undefined;
    if (selected) {
      const { name, id } = selected;
      target = { name, id };
      clearErrors(`${model}.${field}`);
    }
    setValue(`${model}.${field}`, target, { shouldDirty: true });
  }, [selected]);

  const optionsMarkup = options.length
    ? options.map((option) => (
        <Listbox.Option value={option.id} key={option.id} selected={selected?.id == option.id}>
          {option.name}
        </Listbox.Option>
      ))
    : null;

  const updateSelection = (id: string) => {
    const matchedOption = options.find((option) => {
      return option.id.match(id);
    });

    setSelected(matchedOption);
    setInput("");
  };

  const updateText = (value: string) => {
    setInput(value);
    setOptions(data.filter((option) => option.name.toLowerCase().includes(value.toLowerCase())));
  };

  const verticalContentMarkup = selected && (
    <Tag onRemove={() => setSelected(undefined)}>{selected.name}</Tag>
  );

  return (
    <>
      <AutoHiddenInput field={field} value={record?.[field]?.id ? record[field] : undefined} />
      <Combobox
        activator={
          <Combobox.TextField
            prefix={<Icon source={SearchIcon} />}
            autoComplete="off"
            label={label}
            value={input}
            onChange={updateText}
            verticalContent={verticalContentMarkup}
            error={(formState.errors?.[model] as FieldErrors)?.[field]?.message as string}
            {...props}
            placeholder={props.placeholder ?? "Search"}
            requiredIndicator={required ?? !record}
          />
        }
      >
        {options.length > 0 ? (
          <Listbox onSelect={(id) => updateSelection(id)}>{optionsMarkup}</Listbox>
        ) : null}
      </Combobox>
    </>
  );
}
