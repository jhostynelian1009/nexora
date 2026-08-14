import { createContext, useContext, useState, useCallback } from 'react';

const SocialUIContext = createContext(null);

export const SocialUIProvider = ({ children }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const openChat = useCallback(() => {
    setIsChatOpen(true);
  }, []);

  const openChatWithUser = useCallback((user) => {
    setActiveChatUser(user);
    setIsChatOpen(true);
  }, []);

  const closeChat = useCallback(() => {
    setIsChatOpen(false);
  }, []);

  const openUserSearch = useCallback(() => {
    setIsSearchOpen(true);
  }, []);

  const closeUserSearch = useCallback(() => {
    setIsSearchOpen(false);
  }, []);

  const toggleNotifications = useCallback(() => {
    setIsNotificationsOpen((prev) => !prev);
  }, []);

  const closeNotifications = useCallback(() => {
    setIsNotificationsOpen(false);
  }, []);

  return (
    <SocialUIContext.Provider
      value={{
        isChatOpen,
        activeChatUser,
        isSearchOpen,
        isNotificationsOpen,
        openChat,
        openChatWithUser,
        closeChat,
        openUserSearch,
        closeUserSearch,
        toggleNotifications,
        closeNotifications,
        setActiveChatUser
      }}
    >
      {children}
    </SocialUIContext.Provider>
  );
};

export const useSocialUI = () => {
  const context = useContext(SocialUIContext);
  if (!context) {
    return {
      isChatOpen: false,
      activeChatUser: null,
      isSearchOpen: false,
      isNotificationsOpen: false,
      openChat: () => {},
      openChatWithUser: () => {},
      closeChat: () => {},
      openUserSearch: () => {},
      closeUserSearch: () => {},
      toggleNotifications: () => {},
      closeNotifications: () => {},
      setActiveChatUser: () => {}
    };
  }
  return context;
};
