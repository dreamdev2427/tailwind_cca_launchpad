import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

export interface UserData {
  _id?: string;
  avatar?: string;
  address?: string;
  firstname?: string;
  lastname?: string;
  username?: string;
  userBio?: string;
  websiteURL?: string;
  banner?: string;
  verified?: string;
  email?: string;
  twitter?: string;
  facebook?: string;
  telegram?: string;
  spotify?: string;
  instagram?: string;
  soundcloud?: string;
  bandcamp?: string;
  password?: string;
  follows?: string;
  createdAt?: string;
  updatedAt?: string;
  playList?: Array<any>;
  schema_version?: string;
  logAt?: number;
}

export interface AuthorizingState {
  user?: UserData;
  detail?: UserData;
  currentWallet?: string;
  currentNetworkSymbol?: number;
  otherUser?: UserData;
  balance?: number;
  globalProvider?: any;
  walletStatus?: Boolean;
  playList?: [];
  schema_version?: "";
  isRizeMember?: Boolean;
  isInMintingWL?: Boolean;
}

const initialState: AuthorizingState = {
  user: {},
  detail: {},
  currentWallet: "",
  currentNetworkSymbol: 0,
  otherUser: {},
  balance: 0,
  globalProvider: null,
  walletStatus: false,
  isRizeMember: false,
  isInMintingWL: false,
};

export const authorizingSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    changeAuthor: (state, action: PayloadAction<AuthorizingState["user"]>) => {
      return {
        ...state,
        user: action.payload,
      };
    },
    changeDetailedUserInfo: (
      state,
      action: PayloadAction<AuthorizingState["detail"]>
    ) => {
      return {
        ...state,
        detail: action.payload,
      };
    },
    changeOtherUserInfo: (
      state,
      action: PayloadAction<AuthorizingState["otherUser"]>
    ) => {
      return {
        ...state,
        otherUser: action.payload,
      };
    },
    changeWalletAddress: (
      state,
      action: PayloadAction<AuthorizingState["currentWallet"]>
    ) => {
      return {
        ...state,
        currentWallet: action.payload,
      };
    },
    changeGlobalProvider: (
      state,
      action: PayloadAction<AuthorizingState["globalProvider"]>
    ) => {
      return {
        ...state,
        globalProvider: action.payload,
      };
    },
    changeNetworkSymbol: (
      state,
      action: PayloadAction<AuthorizingState["currentNetworkSymbol"]>
    ) => {
      return {
        ...state,
        currentNetworkSymbol: action.payload,
      };
    },
    changeUserBalance: (
      state,
      action: PayloadAction<AuthorizingState["balance"]>
    ) => {
      return {
        ...state,
        balance: action.payload,
      };
    },
    changeWalletStatus: (
      state,
      action: PayloadAction<AuthorizingState["walletStatus"]>
    ) => {
      return {
        ...state,
        walletStatus: action.payload,
      };
    },
    changeMemberOrNot: (
      state,
      action: PayloadAction<AuthorizingState["isRizeMember"]>
    ) => {
      return {
        ...state,
        isRizeMember: action.payload,
      };
    },
    changeInMintngWLOrNot: (
      state,
      action: PayloadAction<AuthorizingState["isInMintingWL"]>
    ) => {
      return {
        ...state,
        isInMintingWL: action.payload,
      };
    },
  },
});

export const {
  changeAuthor,
  changeDetailedUserInfo,
  changeOtherUserInfo,
  changeWalletAddress,
  changeGlobalProvider,
  changeNetworkSymbol,
  changeWalletStatus,
  changeUserBalance,
  changeMemberOrNot,
  changeInMintngWLOrNot,
} = authorizingSlice.actions;

export const selectCurrentAuthorization = (state: RootState) => state.auth;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectOtherUser = (state: RootState) => state.auth.otherUser;
export const selectDetailedUser = (state: RootState) => state.auth.detail;
export const selectWalletStatus = (state: RootState) => state.auth.walletStatus;
export const selectGlobalProvider = (state: RootState) =>
  state.auth.globalProvider;
export const selectCurrentWallet = (state: RootState) =>
  state.auth.currentWallet;
export const selectCurrentNetworkSymbol = (state: RootState) =>
  state.auth.currentNetworkSymbol;
export const selectIsCommunityMember = (state: RootState) =>
  state.auth.isRizeMember;
export const selectIsInMintingWL = (state: RootState) =>
  state.auth.isInMintingWL;

export default authorizingSlice.reducer;
