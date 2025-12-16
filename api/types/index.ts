import {
  ApplicationRecord as GadgetApplicationRecord,
  GadgetRecord,
} from "@gadget-client/manus-mortis-v2";
import { APIModalInteractionResponseCallbackData, APISelectMenuOption } from "discord.js";

export interface StringSelectOption extends APISelectMenuOption {
  roles: string[];
}

export interface ApplicationRecord extends Omit<GadgetRecord<GadgetApplicationRecord>, "modal"> {
  modal: APIModalInteractionResponseCallbackData;
}

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

export interface Emoji {
  id: string;
  name: string;
}
