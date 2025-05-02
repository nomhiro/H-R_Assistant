export type MessageType = {
  message: string;
  isMan: boolean;
}

export type APIMessagesType = {
  role: "user" | "assistant";
  content: string;
}

export type InitialStateType = {
  [pathname: string]: MessageType[];
}