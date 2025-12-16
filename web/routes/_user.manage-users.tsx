import { api } from "@/api";
import { useAction, useFindMany } from "@gadgetinc/react";
import { LoaderFunction } from "@remix-run/node";
import { useLoaderData, useOutletContext, useSearchParams } from "@remix-run/react";
import {
  Autocomplete,
  Avatar,
  BlockStack,
  Box,
  Card,
  ChoiceList,
  Divider,
  Filters,
  InlineGrid,
  InlineStack,
  Page,
  ResourceItem,
  ResourceList,
  ResourceListProps,
  Select,
  SkeletonBodyText,
  Tag,
  Text,
  Tooltip,
} from "@shopify/polaris";
import { DeleteIcon, MinusIcon, PlusIcon } from "@shopify/polaris-icons";
import { BulkActionsProps } from "@shopify/polaris/build/ts/src/components/BulkActions";
import { APIGuildMember, APIRole } from "discord.js";
import { useMemo, useState } from "react";
import { AuthOutletContext } from "./_user";

export const loader = (async ({ context }) => {
  const [roles, members]: [APIRole[], APIGuildMember[]] = await Promise.all([
    context.api.getRoles(),
    context.api.getMembers(),
  ]);

  return { members, roles, serverId: process.env.SERVER_ID };
}) satisfies LoaderFunction;

export default () => {
  const { user: sessionUser } = useOutletContext<AuthOutletContext>();
  const { members, roles, serverId } = useLoaderData<typeof loader>();
  const [queryValue, setQueryValue] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [selected, setSelected] = useState<ResourceListProps["selectedItems"]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const direction = searchParams.get("sort") || "oldest";
  const sortValue = `joined_at ${direction}`;

  const [{ data: usersData, fetching: usersFetching }] = useFindMany(api.user, {
    select: {
      id: true,
      discordId: true,
      username: true,
      globalName: true,
      avatar: true,
      isManager: true,
    },
    live: true,
  });
  const users = usersData ?? [];

  const userMap = Object.fromEntries(users.map((user) => [user.discordId, user]));
  const roleMap = Object.fromEntries(roles.map((role) => [role.id, role]));
  const roleOptions = roles.map((role) => ({ label: role.name, value: role.id }));
  const [autoCompleteOptions, setAutoCompleteOptions] = useState(roleOptions);
  const [autocompleteInput, setAutocompleteInput] = useState<string>("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [portalAccess, setPortalAccess] = useState<string[]>([]);

  const [{ fetching: createFetching }, userCreate] = useAction(api.user.create);
  const [{ fetching: deleteFetching }, userDelete] = useAction(api.user.delete);
  const [{ fetching: promoteFetching }, userPromote] = useAction(api.user.promote);
  const [{ fetching: demoteFetching }, userDemote] = useAction(api.user.demote);

  const filteredMembers = useMemo(
    () =>
      [...members].filter((member) => {
        if (queryValue) {
          const query = queryValue.toLowerCase();
          if (
            ![member.user?.global_name, member.user.username, member.nick].some((s) =>
              (s ?? "").toLowerCase().includes(query),
            )
          ) {
            return false;
          }
        }

        if (selectedRoles.length) {
          if (!selectedRoles.every((role) => member.roles.includes(role))) {
            return false;
          }
        }

        if (portalAccess.length) {
          const [access] = portalAccess;
          if (access == "no access" && userMap[member.user.id]) {
            return false;
          }

          if (access == "access" && !userMap[member.user.id]) {
            return false;
          }

          if (access == "manager" && !userMap[member.user.id]?.isManager) {
            return false;
          }
        }

        return true;
      }),
    [queryValue, selectedRoles, portalAccess],
  );

  const sortedMembers = useMemo(() => {
    return [...filteredMembers].sort((a, b) => {
      if (a.joined_at! < b.joined_at!) return direction === "oldest" ? -1 : 1;
      if (a.joined_at! > b.joined_at!) return direction === "oldest" ? 1 : -1;
      return 0;
    });
  }, [filteredMembers, sortValue]);

  const paginatedMembers = useMemo(
    () => sortedMembers.slice((page - 1) * pageSize, page * pageSize),
    [sortedMembers, page, pageSize],
  );

  const maxPage = Math.ceil(sortedMembers.length / pageSize);

  function onSortChange(selected: (typeof sortOptions)[number]["value"]) {
    const [_, direction] = selected.split(" ");
    setSearchParams({ sort: direction });
  }

  const resourceName = {
    singular: "member",
    plural: "members",
  };

  const sortOptions = [
    { label: "Oldest joined", value: "joined_at oldest" },
    { label: "Newest joined", value: "joined_at newest" },
  ];

  const promotedBulkActions: BulkActionsProps["promotedActions"] = [
    {
      content: "＋ Add users",
      disabled: !sessionUser.isManager || createFetching,
      onAction: () =>
        (Array.isArray(selected) ? selected : []).forEach((i) => {
          const { user, avatar } = paginatedMembers[Number(i)];
          if (!userMap[user.id]) {
            userCreate({
              discordId: user.id,
              username: user.username,
              globalName: user.global_name,
              avatar:
                "https://cdn.discordapp.com/" +
                (!!avatar
                  ? `guilds/${serverId}/users/${user.id}/avatars/${avatar}.png`
                  : `avatars/${user.id}/${user.avatar}.png`),
            });
          }
        }),
    },
  ];

  const updateAutocompeteText = (value: string) => {
    setAutocompleteInput(value);

    if (value === "") {
      setAutoCompleteOptions(roleOptions);
      return;
    }

    const filterRegex = new RegExp(value, "i");
    const resultOptions = roleOptions.filter((option) => option.label.match(filterRegex));

    setAutoCompleteOptions(resultOptions);
  };

  const filters = [
    {
      key: "role",
      label: "by role",
      shortcut: true,
      filter: (
        <Autocomplete
          options={autoCompleteOptions}
          textField={
            <Autocomplete.TextField
              label="Roles"
              onChange={updateAutocompeteText}
              value={autocompleteInput}
              autoComplete="off"
            />
          }
          selected={selectedRoles}
          onSelect={(r) => {
            setSelectedRoles(r);
            setSelected([]);
          }}
          allowMultiple
        />
      ),
    },
    {
      key: "access",
      label: "by portal access",
      shortcut: true,
      filter: (
        <ChoiceList
          title="Portal access"
          choices={[
            { label: "no access", value: "no access" },
            { label: "access", value: "access" },
            { label: "manager", value: "manager" },
          ]}
          selected={portalAccess}
          onChange={(choice) => {
            setPortalAccess(choice);
            setSelected([]);
          }}
        />
      ),
    },
  ];

  const appliedFilters = [];
  if (selectedRoles.length) {
    appliedFilters.push({
      key: "role",
      label: `has role${selectedRoles.length > 1 ? "s" : ""} ${selectedRoles
        .map((r) => roleMap[r].name)
        .join(", ")}`,
      onRemove: () => {
        setSelectedRoles([]);
        setSelected([]);
      },
    });
  }

  if (portalAccess.length) {
    appliedFilters.push({
      key: "access",
      label: `has ${portalAccess}`,
      onRemove: () => {
        setPortalAccess([]);
        setSelected([]);
      },
    });
  }

  const ManagerTag = () => (
    <Tooltip content="Can manage Web Portal users" width="wide">
      <Tag>Manager</Tag>
    </Tooltip>
  );

  const AccessTag = () => (
    <Tooltip content="Can access the Web Portal" width="wide">
      <Tag>Portal Access</Tag>
    </Tooltip>
  );

  function renderUser(user: (typeof users)[number]) {
    const media = <Avatar source={user.avatar!} size="lg" name={user.username ?? undefined} />;
    const isActionDisabled = !sessionUser.isManager || user.id == sessionUser.id;

    const promoteAction = {
      content: "Promote",
      icon: PlusIcon,
      onAction: () => userPromote({ id: user.id }),
      disabled: isActionDisabled || promoteFetching,
    };

    const demoteAction = {
      content: "Demote",
      icon: MinusIcon,
      onAction: () => userDemote({ id: user.id }),
      disabled: isActionDisabled || demoteFetching,
    };

    const removeAction = {
      content: "Remove",
      icon: DeleteIcon,
      onAction: () => userDelete({ id: user.id }),
      disabled: isActionDisabled || deleteFetching,
    };

    return (
      <ResourceItem
        id={user.id}
        media={media}
        onClick={() => {}}
        shortcutActions={[user.isManager ? demoteAction : promoteAction, removeAction]}
      >
        <InlineStack gap="200">
          <BlockStack>
            <Text variant="bodyMd" fontWeight="bold" as="h3">
              {user.globalName ?? user.username}
            </Text>
            <div>{user.globalName && `(${user.username})`}</div>
          </BlockStack>
          {user.isManager && <ManagerTag />}
        </InlineStack>
      </ResourceItem>
    );
  }

  function renderMember(item: (typeof members)[number], id: string) {
    const { user, nick, avatar } = item;
    const avatarUrl =
      "https://cdn.discordapp.com/" +
      (!!avatar
        ? `guilds/${serverId}/users/${user.id}/avatars/${avatar}.png`
        : `avatars/${user.id}/${user.avatar}.png`);
    const media = <Avatar source={avatarUrl} size="lg" name={user.username} />;

    const addAction = {
      content: "Add",
      icon: PlusIcon,
      onAction: () =>
        userCreate({
          discordId: user.id,
          username: user.username,
          globalName: user.global_name,
          avatar: avatarUrl,
        }),
      disabled: !sessionUser.isManager || !!userMap[user.id] || createFetching,
    };

    return (
      <ResourceItem
        id={id}
        media={media}
        onClick={() => {}}
        shortcutActions={selected?.length ? [] : [addAction]}
      >
        <InlineStack gap="200">
          <BlockStack>
            <Text variant="bodyMd" fontWeight="bold" as="h3">
              {nick ?? user.global_name ?? user.username}
            </Text>
            <div>{user.global_name && `(${user.username})`}</div>
          </BlockStack>
          {userMap[user.id] && <AccessTag />}
          {userMap[user.id]?.isManager && <ManagerTag />}
        </InlineStack>
      </ResourceItem>
    );
  }

  return (
    <Page
      title="Manage Users"
      subtitle="Configure which members of the server can access the Web Portal"
      backAction={{ content: "Back", url: "/" }}
    >
      <BlockStack gap={{ xs: "800", sm: "400" }}>
        <InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
          <Box>
            <Text as="h2" variant="headingMd">
              Web Portal Users
            </Text>
            <Text as="p" variant="bodyMd">
              Users who have access to the Web Portal
            </Text>
          </Box>
          <Card>
            {usersFetching && <SkeletonBodyText />}
            <ResourceList
              resourceName={resourceName}
              items={users}
              renderItem={renderUser}
              totalItemsCount={users.length}
              loading={
                usersFetching ||
                createFetching ||
                deleteFetching ||
                promoteFetching ||
                demoteFetching
              }
            />
          </Card>
        </InlineGrid>
        <Divider />
        <InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
          <Box>
            <Text as="h2" variant="headingMd">
              Discord Server Members
            </Text>
            <Text as="p" variant="bodyMd">
              Members of the Manus Mortis Discord server
            </Text>
          </Box>
          <Card>
            <ResourceList
              resourceName={resourceName}
              items={paginatedMembers}
              renderItem={renderMember}
              selectedItems={selected}
              onSelectionChange={setSelected}
              promotedBulkActions={promotedBulkActions}
              sortValue={sortValue}
              sortOptions={sortOptions}
              onSortChange={onSortChange}
              totalItemsCount={sortedMembers.length}
              loading={createFetching || deleteFetching || promoteFetching || demoteFetching}
              pagination={{
                label: `${page} / ${maxPage}`,
                hasNext: page < maxPage,
                onNext: () => {
                  setSelected([]);
                  setPage(page + 1);
                },
                nextTooltip: `Page ${page + 1}`,
                hasPrevious: page != 1,
                onPrevious: () => {
                  setSelected([]);
                  setPage(page - 1);
                },
                previousTooltip: `Page ${page - 1}`,
              }}
              filterControl={
                <Filters
                  queryValue={queryValue}
                  onQueryChange={(value) => {
                    setQueryValue(value);
                    setSelected([]);
                  }}
                  onQueryClear={() => {
                    setQueryValue("");
                    setSelected([]);
                  }}
                  onClearAll={() => {
                    setSelected([]);
                    setQueryValue("");
                    setSelectedRoles([]);
                    setPortalAccess([]);
                  }}
                  filters={filters}
                  appliedFilters={appliedFilters}
                />
              }
            />
            <Select
              label="Page size"
              labelInline
              value={String(pageSize)}
              onChange={(size) => setPageSize(Number(size))}
              options={["10", "20", "50", "100"]}
            />
          </Card>
        </InlineGrid>
      </BlockStack>
    </Page>
  );
};
