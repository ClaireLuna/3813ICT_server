type MessageBase = {
  content: string | null | undefined;
  image: string | null | undefined;
};
type SocketUser = { id: string; username: string };
type MessageRequest = MessageBase;
export type MessageResponse = { user: SocketUser } & MessageBase;

export interface ServerToClientEvents {
  allMessages: (messages: MessageResponse[]) => void;
  newMessage: (message: MessageResponse) => void;
  userJoined: (name: string) => void;
  userLeft: (name: string) => void;
}

export interface ClientToServerEvents {
  sendMessage: (msg: MessageRequest) => void;
}

export interface InterServerEvents {}

export interface SocketData {
  channelId: string;
  user: SocketUser;
}
