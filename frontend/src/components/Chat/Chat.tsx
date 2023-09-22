/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useState, useEffect } from "react";
import styles from "../../styles/Chat/Chat.module.css";
import MsgList from "./MsgList";
import TargetUserMenu from "./TargetUserMenu";
import MenuSelector from "./MenuSelector";
import Menu from "./Menu";
import { addMessage, getChannels, getMessages, getUserInfos } from "./actions";
import { Socket, io } from "socket.io-client";
// import { RootState } from "@/app/GlobalRedux/store";
// import { useSelector } from "react-redux";

enum MenuType {
  CHANNEL_SELECTOR = "CHANNEL_SELECTOR",
  USER_SELECTOR = "USER_SELECTOR",
  CHANNEL_CREATION = "CHANNEL_CREATION",
  CHANNEL_ADMINISTRATION = "CHANNEL_ADMINISTRATION",
}

enum ActiveDiscussionType {
  PRIV_MSG = "PRIV_MSG",
  CHANNEL = "CHANNEL",
}

export default function Chat() {
  const [user, setUser] = useState<User | undefined>(undefined);
  // const username = useSelector((state: RootState) => state.user.username);
  const [socket, setSocket] = useState<Socket>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [channels, setChannels] = useState<Channels>();
  const [targetUser, setTargetUser] = useState<string | null>(null);
  const [selectedMenu, setSelectedMenu] = useState<MenuType>(
    MenuType.CHANNEL_SELECTOR
  );
  const [activeDiscussion, setActiveDiscussion] = useState<string | undefined>(
    "General"
  );
  const [activeDiscussionType, setActiveDiscussionType] =
    useState<ActiveDiscussionType>(ActiveDiscussionType.CHANNEL);

  function changeMenu(menu: MenuType) {
    setSelectedMenu(menu);
    setTargetUser(null);
  }

  function switchChannel(
    discussionName: string,
    discussionType: ActiveDiscussionType
  ): void {
    setActiveDiscussion(discussionName);
    setActiveDiscussionType(discussionType);
  }

  function showUserInfos(username: string | null): void {
    setTargetUser(username);
  }

  function closeUserInfos(): void {
    setTargetUser(null);
  }

  //--------------------------------------------------
  // SOCKET ACTIONS   --------------------------------
  //--------------------------------------------------

  async function socketInitializer(): Promise<any> {
    const socket = io(`http://${process.env.NEXT_PUBLIC_DOMAIN}:3001`);

    socket?.on("connect", () => {
      console.log("connected");
    });
    setSocket(socket);
  }

  function sendMessage(data: string) {
    socket?.emit("NEW_MESSAGE", data);
  }

  useEffect(() => {
    socketInitializer();
  }, [setSocket]);

  function submitNewMessage(textInput: string) {
    addMessage(textInput, activeDiscussionType, activeDiscussion);
    sendMessage(textInput);
  }

  function updateChannelList() {
    getChannels().then((channels) => setChannels(channels));
  }

  function activeChannelReset(channelName: string) {
    if (
      channelName === activeDiscussion &&
      activeDiscussionType === ActiveDiscussionType.CHANNEL
    )
      setActiveDiscussion("General");
  }

  //Redirect yourself on general if you where on a channel where you were just kicked
  function kickedFromChannel(channelName: string, kickedUser: string) {
    if (
      activeDiscussionType === ActiveDiscussionType.CHANNEL &&
      activeDiscussion === channelName &&
      kickedUser === user?.username
    )
      setActiveDiscussion("General");
  }

  function messageListner(message: Message) {
    if (!messages) return;
    if (
      !message.isPrivMessage &&
      message.Channel.channelName === activeDiscussion
    )
      setMessages([...messages, message]);
    if (
      message.isPrivMessage &&
      ((message.receiver.username === activeDiscussion &&
        message.sender.username === user?.username) ||
        (message.receiver.username === user?.username &&
          message.sender.username === activeDiscussion))
    )
      setMessages([...messages, message]);
    return;
  }

  useEffect((): any => {
    socket?.on("NEW_MESSAGE", messageListner);
    socket?.on("CHANNEL_DELETE", activeChannelReset);
    socket?.on("CHANNEL_UPDATE", updateChannelList);
    socket?.on("KICKED_FROM_CHANNEL", kickedFromChannel);

    return () => {
      socket?.off("NEW_MESSAGE", messageListner);
      socket?.off("CHANNEL_DELETE", activeChannelReset);
      socket?.off("CHANNEL_UPDATE", updateChannelList);
      socket?.off("KICKED_FROM_CHANNEL", kickedFromChannel);
    };
  }, [messageListner]);

  //--------------------------------------------------
  //--------------------------------------------------

  useEffect(() => {
    getUserInfos().then((infos) => setUser(infos));
  }, []);

  useEffect(() => {
    getChannels().then((channels) => setChannels(channels));
  }, [selectedMenu]);

  useEffect(() => {
    getMessages(activeDiscussionType, activeDiscussion).then((messages) => {
      setMessages(messages);
    });
  }, [activeDiscussion]);

  // if (!activeDiscussion) return <p>...</p>;

  return (
    <div className={`${styles.chat}`}>
      <MenuSelector selectedMenu={selectedMenu} changeMenu={changeMenu} />
      <Menu
        selectedMenu={selectedMenu}
        activeDiscussionType={activeDiscussionType}
        activeDiscussion={activeDiscussion}
        channels={channels}
        switchChannel={switchChannel}
        changeMenu={changeMenu}
      />
      <MsgList
        activeDiscussion={activeDiscussion}
        activeDiscussionType={activeDiscussionType}
        showUserInfos={showUserInfos}
        submitNewMessage={submitNewMessage}
        messages={messages}
      />
      {targetUser ? (
        <TargetUserMenu
          targetUser={targetUser}
          closeUserInfos={closeUserInfos}
        />
      ) : undefined}
    </div>
  );
}
