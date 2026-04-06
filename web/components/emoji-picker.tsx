import { RootOutletContext } from "@/root";
import { useOutletContext } from "@remix-run/react";
import { Button, Popover } from "@shopify/polaris";
import { SmileyHappyIcon, XCircleIcon } from "@shopify/polaris-icons";
import EmojiPickerReact, { Emoji, EmojiStyle, Theme } from "emoji-picker-react";
import { useEffect, useState } from "react";

export interface Emoji {
  id: string;
  name: string;
}

export interface EmojiPickerProps {
  onChange: (emoji: Emoji | undefined) => void;
  initial?: Emoji;
  onOpen?: () => void;
  onClose?: () => void;
}

export const EmojiPicker = ({
  onOpen: handleOpen,
  onClose: handleClose,
  onChange: handleChange,
  initial,
}: EmojiPickerProps) => {
  const { theme } = useOutletContext<RootOutletContext>();
  const [isActive, setIsActive] = useState<boolean>(false);
  const [emoji, setEmoji] = useState<Emoji | undefined>(initial);

  useEffect(() => handleChange(emoji), [emoji]);

  const onOpen = () => {
    setIsActive(true);
    handleOpen?.();
  };

  const onClose = () => {
    setIsActive(false);
    handleClose?.();
  };

  return (
    <Popover
      active={isActive}
      activator={
        <Button
          icon={
            isActive ? (
              XCircleIcon
            ) : emoji === undefined ? (
              SmileyHappyIcon
            ) : (
              <Emoji unified={emoji.id} size={16} emojiStyle={EmojiStyle.TWITTER} />
            )
          }
          variant="tertiary"
          onClick={
            isActive
              ? () => {
                  setEmoji(undefined);
                  onClose();
                }
              : onOpen
          }
        />
      }
      onClose={onClose}
    >
      <EmojiPickerReact
        onEmojiClick={({ unified: id, emoji: name }) => {
          setEmoji({ id, name });
          onClose();
        }}
        theme={theme === "light" ? Theme.LIGHT : Theme.DARK}
        emojiStyle={EmojiStyle.TWITTER}
      />
    </Popover>
  );
};
