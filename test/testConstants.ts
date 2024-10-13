import { Role } from "@prisma/client";

export const user = {
  id: "66d6ef35dd3a1615cf637c75",
  username: "user1",
  photo: null,
  email: "asd@asd.com",
  hash: "asdasd",
  apiToken: "token",
  role: Role.SuperAdmin,
};

export const group = {
  id: "66d6ef35dd3a1615cf637c75",
  name: "Test Group",
  createdById: user.id,
};

export const channel = {
  id: "66d6ef35dd3a1615cf637c75",
  name: "Test Channel",
  groupId: group.id,
};

export const channels = [
  channel,
  { id: "66d6ef35dd3a1615cf637c76", name: "Test Channel 2", groupId: group.id },
];

export const message = {
  id: "66d6ef35dd3a1615cf637c75",
  content: "Test Message",
  image: null,
  channelId: channel.id,
  userId: user.id,
  createdAt: new Date(),
};

export const messages = [
  message,
  {
    id: "66d6ef35dd3a1615cf637c76",
    content: "Test Message 2",
    image: null,
    channelId: channel.id,
    userId: user.id,
    createdAt: new Date(),
  },
];
