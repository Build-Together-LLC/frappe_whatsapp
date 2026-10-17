import type React from 'react';
import type { AppContextState } from './AppContext';

interface User {
  chatType: string;
  id: string;
  isSelected: boolean;
  name?: string;
  profilePicture?: string;
  markAsRead?: boolean;
}

const appActions = (
  setState: React.Dispatch<React.SetStateAction<AppContextState>>
) => {
  return {
    setSelectedUser: (selectedUser: User) => {
      setState((state: any) => {
        return {
          ...state,
          selectedUser,
        };
      });
    },

    setChatSearch: (chatSearch: AppContextState['chatSearch']) => {
      setState((state: any) => {
        return {
          ...state,
          chatSearch,
        };
      });
    },

    setFileChosen: (fileChosen: any) => {
      setState((state: any) => {
        return {
          ...state,
          fileChosen,
        };
      });
    },

    setMessageType: (messageType: AppContextState['messageType']) => {
      setState((state: any) => {
        return {
          ...state,
          messageType,
        };
      });
    },

    setSelectedSessionUserId: (
      selectedSessionUserId: AppContextState['selectedSessionUserId']
    ) => {
      setState((state: any) => {
        return {
          ...state,
          selectedSessionUserId,
        };
      });
    },

    setSelectedFilterCategory: (
      selectedFilterCategory: AppContextState['selectedFilterCategory']
    ) => {
      setState((state: any) => {
        return {
          ...state,
          selectedFilterCategory,
        };
      });
    },

    setCreateNewGroup: (createNewGroup: AppContextState['createNewGroup']) => {
      setState((state: any) => {
        return {
          ...state,
          createNewGroup,
        };
      });
    },

    setChosenGroupUserIds: (
      chosenGroupUserIds: AppContextState['chosenGroupUserIds']
    ) => {
      setState((state: any) => {
        return {
          ...state,
          chosenGroupUserIds,
        };
      });
    },
    setMoreOptionOpen: (moreOptionOpen: AppContextState['moreOptionOpen']) => {
      setState((state: any) => {
        return {
          ...state,
          moreOptionOpen,
        };
      });
    },
    setArchivedView: (archivedView: AppContextState['archivedView']) => {
      setState((state: any) => {
        return {
          ...state,
          archivedView,
        };
      });
    },
    setArchivedUser: (archivedUser: AppContextState['archivedUser']) => {
      setState((state: any) => {
        return {
          ...state,
          archivedUser,
        };
      });
    },
    setIsOpen: (isOpen: AppContextState['isOpen']) => {
      setState((state: any) => {
        return {
          ...state,
          isOpen,
        };
      });
    },
    setMessage: (message: AppContextState['message']) => {
      setState((state: any) => {
        return {
          ...state,
          message,
        };
      });
    },
    setCaption: (caption: AppContextState['caption']) => {
      setState((state: any) => {
        return {
          ...state,
          caption,
        };
      });
    },
    setUserData: (userData: AppContextState['userData']) => {
      setState((state: any) => {
        return {
          ...state,
          userData,
        };
      });
    },
    setAssignUserToContactView: (
      assignUserToContactView: AppContextState['assignUserToContactView']
    ) => {
      setState((state: any) => {
        return {
          ...state,
          assignUserToContactView,
        };
      });
    },
    setSelectedUserDetail: (
      selectedUserDetail: AppContextState['selectedUserDetail']
    ) => {
      setState((state: any) => {
        return {
          ...state,
          selectedUserDetail,
        };
      });
    },
    setSelectedSessionDetail: (
      selectedSessionDetail: AppContextState['selectedSessionDetail']
    ) => {
      setState((state: any) => {
        return {
          ...state,
          selectedSessionDetail:
            selectedSessionDetail ?? state.selectedSessionDetail,
        };
      });
    },
    setIsViewQrCode: (isViewQrCode: AppContextState['isViewQrCode']) => {
      setState((state: any) => {
        return {
          ...state,
          isViewQrCode,
        };
      });
    },
    setIsSessionCreatePopup: (
      isSessionCreatePopupOpen: AppContextState['isSessionCreatePopupOpen']
    ) => {
      setState((state: any) => {
        return {
          ...state,
          isSessionCreatePopupOpen,
        };
      });
    },
    setSelectedMessage: (
      selectedMessage: AppContextState['selectedMessage']
    ) => {
      setState((state: any) => {
        return {
          ...state,
          selectedMessage,
        };
      });
    },
    setMessageMenu: (messageMenu: AppContextState['messageMenu']) => {
      setState((state: any) => {
        return {
          ...state,
          messageMenu,
        };
      });
    },
    setLimit: (limit: AppContextState['limit']) => {
      setState((state: any) => {
        return {
          ...state,
          limit,
        };
      });
    },
  };
};

export default appActions;
