import {
  AutoSelection,
  Combobox,
  EmptySearchResult,
  Icon,
  InlineStack,
  Listbox,
  Tag,
  TextFieldProps,
} from "@shopify/polaris";
import { SearchIcon } from "@shopify/polaris-icons";
import { APIRole } from "discord.js";
import { useState } from "react";

type Props = Omit<TextFieldProps, "autoComplete" | "label"> & {
  roles: APIRole[];
  onSelectionChange: (selectedRoles: APIRole[]) => void;
  selected?: APIRole[];
  label?: string;
};

export function RoleMultiselector({ roles, onSelectionChange, ...props }: Props) {
  const [input, setInput] = useState("");
  const [options, setOptions] = useState(roles);
  const [selected, setSelected] = useState<APIRole[]>(props.selected ?? []);

  const updateText = (value: string) => {
    setInput(value);
    setOptions(roles.filter((role) => role.name.toLowerCase().includes(value.toLowerCase())));
  };

  const updateSelected = (id: string) => {
    const newSelected = selected.map((role) => role.id).includes(id)
      ? selected.filter((role) => role.id !== id)
      : selected.concat(options.find((role) => role.id === id)!);

    setSelected(newSelected);
    onSelectionChange(newSelected);
  };

  const verticalContentMarkup =
    selected.length > 0 ? (
      <InlineStack gap="050">
        Roles:
        {selected.map((role) => (
          <Tag key={`role ${role.id}`} onRemove={() => updateSelected(role.id)}>
            {role.name}
          </Tag>
        ))}
      </InlineStack>
    ) : null;

  const optionsMarkup = options.map((option) => (
    <Listbox.Option
      value={option.id}
      key={option.id}
      selected={selected.map((role) => role.id).includes(option.id)}
    >
      {option.name}
    </Listbox.Option>
  ));

  return (
    <Combobox
      allowMultiple
      activator={
        <Combobox.TextField
          prefix={<Icon source={SearchIcon} />}
          value={input}
          onChange={updateText}
          verticalContent={verticalContentMarkup}
          autoComplete="off"
          placeholder="Search roles"
          label="Roles"
          labelHidden={props.label === undefined ? true : props.labelHidden}
          {...props}
        />
      }
    >
      {options.length > 0 ? (
        <Listbox onSelect={(id) => updateSelected(id)} autoSelection={AutoSelection.None}>
          {optionsMarkup}
        </Listbox>
      ) : (
        <EmptySearchResult title="" description={`No roles found matching "${input}"`} />
      )}
    </Combobox>
  );
}
