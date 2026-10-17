import React, { createContext, useContext, useMemo, useState } from 'react';
import appActions from './appAction';

const initialState = {
  userData: [] as any,
  selectedUser: {
    chatType: '',
    profilePicture: '',
    id: '',
    isSelected: false,
    name: undefined,
    markAsRead: true,
  },
  selectedUserDetail: [],
  chatSearch: '',
  fileChosen: [],
  messageType: '',
  selectedSessionUserId: '',
  selectedFilterCategory: '',
  createNewGroup: false,
  chosenGroupUserIds: [] as any,
  moreOptionOpen: '',
  archivedView: false,
  archivedUser: [] as any,
  isOpen: false,
  message: '',
  caption: '',
  assignUserToContactView: false,
  selectedSessionDetail: {
    name: '',
    session_id: '',
    status: '',
    user_id: '',
    user_name: '',
    qr_image_link: '',
  },
  isViewQrCode: false,
  isSessionCreatePopupOpen: false,
  selectedMessage: '',
  messageMenu: '',
  limit: 20,
};

export type AppContextState = typeof initialState;

const AppContext = createContext({
  ...initialState,
  ...appActions(() => {
    throw new Error('GlobalContextProvider not yet initialized');
  }),
});

export function AppContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [appState, setAppState] = useState<AppContextState>(initialState);

  const actions = useMemo(() => appActions(setAppState), [setAppState]);

  const value = {
    ...appState,
    ...actions,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useAppContext = () => {
  const context = useContext(AppContext);

  if (context === undefined)
    throw new Error('useGlobal must be used within a GlobalContext');

  return context;
};
