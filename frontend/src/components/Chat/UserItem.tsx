/* eslint-disable @next/next/no-img-element */
"use client";

import styles from "../../styles/Chat/UserItem.module.css";

enum UserStatus {
  ONLINE = "ONLINE",
  OFFLINE = "OFFLINE",
}

type User = {
  id: string;
  username: string;
  status: UserStatus.ONLINE;
};

type UserItemProps = {
  user: User;
  isActive: boolean;
  switchChannel: (channelName: string) => void;
};

export default function UserItem({
  user,
  isActive,
  switchChannel,
}: UserItemProps) {
  return (
    <div
      className={isActive ? styles.activeUserItem : styles.userItem}
      onClick={() => switchChannel(user.username)}
    >
      <p>{user.username}</p>
    </div>
  );
}
