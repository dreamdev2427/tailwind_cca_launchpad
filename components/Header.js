import { useEffect, useState, useRef, useCallback } from "react";
import Logo from "../shared/Logo/Logo.tsx";
import clsx from "clsx";
import {
  changeWalletAddress,
  changeWalletStatus,
  changeAuthor,
  selectCurrentNetworkSymbol,
  changeGlobalProvider,
  selectCurrentWallet,
  selectCurrentUser,
  selectWalletStatus,
  changeNetworkSymbol,
  selectIsCommunityMember,
  changeMemberOrNot,
  changeInMintngWLOrNot,
  selectIsInMintingWL,
  selectGlobalProvider,
} from "app/reducers/auth.reducers";
import { getShortAddress, isEmpty } from "app/methods";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { ACTIVE_CHAINS, config, PLATFORM_NETWORKS } from "app/config.js";
import { providerOptions } from "InteractWithSmartContract/providerOptions";
import { useSigningClient } from "app/cosmwasm";
import axios from "axios";
import { toast } from "react-toastify";
import Web3 from "web3";
import md5 from "md5";
import Web3Modal from "web3modal";
import { useNavigate } from "react-router-dom";
import jwt_decode from "jwt-decode";
import { IoWalletOutline } from "react-icons/io5";
import ButtonPrimary from "../shared/Button/ButtonPrimary";
import {
  changeNetwork,
  getNetworkSymbolByChainId,
  isSupportedNetwork,
  isSuppportedEVMChain,
} from "InteractWithSmartContract/interact";
import SwitchDarkMode from "shared/SwitchDarkMode/SwitchDarkMode";
import {
  changeConsideringCollId,
  changeDetailedCollection,
  changeShowUploadingItemsModal,
  changeShowUploadingWLModal,
  selectCurrentConsideringCollId,
  selectDetailedCollection,
} from "app/reducers/collection.reducers";
import { NotificationManager } from "react-notifications";
import Image from "next/image.js";

export const web3Modal = new Web3Modal({
  network: "mainnet",
  cacheProvider: false,
  disableInjectedProvider: false,
  providerOptions,
});

const Header = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const detailedCollInfo = useAppSelector(selectDetailedCollection);
  const isInMintingWL = useAppSelector(selectIsInMintingWL);
  const globalProvider = useAppSelector(selectGlobalProvider);
  const isRizeMember = useAppSelector(selectIsCommunityMember);
  const consideringCollId = useAppSelector(selectCurrentConsideringCollId);
  const user = useAppSelector(selectCurrentUser);
  const walletStatus = useAppSelector(selectWalletStatus);
  const currentUser = useAppSelector(selectCurrentUser);
  const currentNetworkSymbol = useAppSelector(selectCurrentNetworkSymbol);
  const walletAddress = useAppSelector(selectCurrentWallet);
  const [publicMintDate, setPublicMintDate] = useState("5-1-23 12PM");
  const {
    client,
    signingClient,
    loadClient,
    connectWallet: connectToCoreum,
    disconnect: disconnectFromCoreum,
  } = useSigningClient();
  const [tabActive, setTabActive] = useState(0);
  const pagesRef = useRef(null);
  const chainRef = useRef(null);
  const [openState1, setOpenState1] = useState(false);
  const [openState2, setOpenState2] = useState(false);
  const [provider, setProvider] = useState(null);
  const [newItemPrice, setNewItemPrice] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsMobile(true);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        if (!client) {
          await loadClient();
        }
      } catch (err) {
        setTimeout(() => loadClient(), 1000);
      }
    })();
  }, [client, loadClient]);

  useEffect(() => {
    let dateTimeStrInterval = setInterval(() => {
      let nowTime = new Date();
      let datetimestr = `${nowTime.getDate()}-${
        nowTime.getMonth() + 1
      }-${nowTime.getFullYear()} ${nowTime.getHours()}h GMT`;
      setPublicMintDate(datetimestr);
    }, 10000);
    return () => {
      if (dateTimeStrInterval > 0) clearInterval(dateTimeStrInterval);
    };
  }, []);

  useEffect(() => {
    if (!isEmpty(walletAddress)) {
      dispatch(changeWalletStatus(true));
      Login();
    } else {
      dispatch(changeWalletStatus(false));
    }
  }, [walletAddress, dispatch, Login]);

  const Login = useCallback(() => {
    axios({
      method: "post",
      url: `${config.baseUrl}users/login`,
      data: {
        address: walletAddress,
        password: md5(walletAddress),
      },
    })
      .then(function (response) {
        if (response.data.code === 0) {
          //set the token to sessionStroage
          const token = response.data.token;
          localStorage.setItem("jwtToken", response.data.token);
          const decoded = jwt_decode(token);
          dispatch(changeAuthor(decoded._doc));

          navigate("/");
        } else {
          dispatch(changeWalletAddress(""));
        }
      })
      .catch(function (error) {});
  }, [walletAddress, dispatch, navigate]);

  useEffect(() => {
    (async () => {
      try {
        if (!client) {
          await loadClient();
        }
      } catch (err) {
        setTimeout(() => loadClient(), 1000);
      }
    })();
  }, [client, loadClient]);

  useEffect(() => {
    (async () => {
      try {
        if (
          !signingClient &&
          localStorage.getItem("address") &&
          localStorage.getItem("wallet_type")
        ) {
          await connectToCoreum(localStorage.getItem("wallet_type"));
        }
      } catch (err) {
        // setTimeout(() => connectToCoreum(), 1000);
      }
    })();
  }, [signingClient, connectToCoreum]);

  const authenticate = async (wallet_type) => {
    await connectToCoreum(wallet_type);
  };

  let timeout1, timeout2; // NodeJS.Timeout
  const timeoutDuration = 400;

  const toggleMenu = (open, type) => {
    // log the current open state in React (toggle open state)

    // toggle the menu by clicking on buttonRef
    if (type === "Pages") {
      setOpenState1((prev) => !prev);
      pagesRef?.current?.click(); // eslint-disable-line
    } else {
      setOpenState2((prev) => !prev);
      chainRef?.current?.click();
    }
  };

  const onHover = (open, action, type) => {
    if (type === "Pages") {
      if (
        (!open && !openState1 && action === "onMouseEnter") ||
        (open && openState1 && action === "onMouseLeave")
      ) {
        // clear the old timeout, if any
        clearTimeout(timeout1);
        // open the modal after a timeout
        timeout1 = setTimeout(() => toggleMenu(open, type), timeoutDuration);
      }
    } else {
      if (
        (!open && !openState2 && action === "onMouseEnter") ||
        (open && openState2 && action === "onMouseLeave")
      ) {
        // clear the old timeout, if any
        clearTimeout(timeout2);
        // open the modal after a timeout
        timeout2 = setTimeout(() => toggleMenu(open, type), timeoutDuration);
      }
    }
  };

  const onClickConnectEVMWallet = async () => {
    try {
      const provider = await web3Modal.connect();

      const web3 = new Web3(provider);

      const accounts = await web3.eth.getAccounts();

      setProvider(provider);

      if (accounts[0]) {
        dispatch(changeWalletAddress(accounts[0]));
        isCommunityMember(accounts[0]);
      } else {
        dispatch(changeWalletAddress(""));
        dispatch(changeMemberOrNot(false));
      }
      dispatch(changeGlobalProvider(provider));
    } catch (error) {
      dispatch(changeWalletAddress(""));
    }
  };

  const isCommunityMember = useCallback(() => {
    try {
      axios
        .post(`${config.baseUrl}users/isCommunityMember`, {
          wallet: walletAddress || "",
        })
        .then((response) => {
          let isM = response.data.data || false;
          dispatch(changeMemberOrNot(isM));
        });
      axios
        .post(`${config.baseUrl}users/isInMintingWL`, {
          wallet: walletAddress || "",
        })
        .then((response) => {
          let isM = response.data.data || false;
          dispatch(changeInMintngWLOrNot(isM));
        });
    } catch (error) {
      dispatch(changeMemberOrNot(false));
    }
  }, [walletAddress, dispatch]);

  const onClickChangeEVMNetwork = async (networkSymbol) => {
    try {
      let switchingResult = false;
      let result = await changeNetwork(networkSymbol);
      if (result) {
        if (result.success === true) {
          dispatch(changeNetworkSymbol(networkSymbol));
          switchingResult = true;
        } else {
          toast.warning(
            <div>
              <span>{result.message}</span>
              <br></br>
              <span>
                Please check your wallet. Try adding the chain to Wallet first.
              </span>
            </div>
          );
        }
      }
      return switchingResult;
    } catch (error) {
      return false;
    }
  };

  const handleSelectNetwork = async (networkSymbol) => {
    let previousNetworkSymbol = currentNetworkSymbol;
    if (networkSymbol === PLATFORM_NETWORKS.COREUM) {
      // await connectToCoreum();
      dispatch(changeNetworkSymbol(PLATFORM_NETWORKS.COREUM));
    } else if (networkSymbol === PLATFORM_NETWORKS.NEAR) {
      disconnectFromCoreum();
    } else {
      disconnectFromCoreum();
      let switchingResult = await onClickChangeEVMNetwork(networkSymbol);

      if (
        switchingResult === false &&
        isSupportedNetwork(previousNetworkSymbol) === true
      ) {
        handleSelectNetwork(previousNetworkSymbol);
      }
      if (switchingResult === true) {
        onClickConnectEVMWallet();
      }
    }
  };

  const handleMenuUploadFiles = () => {
    if (
      !consideringCollId ||
      consideringCollId === null ||
      consideringCollId === "" ||
      consideringCollId.toString().length !== 24
    ) {
      NotificationManager.error("Please select a collection and try again.");
    } else {
      if (isInMintingWL === true) {
        dispatch(changeShowUploadingItemsModal(true));
      } else {
        NotificationManager.error("You don't have right to mint.");
        return;
      }
    }
  };

  const handleMenuUpdateWL = () => {
    if (
      !consideringCollId ||
      consideringCollId === null ||
      consideringCollId === "" ||
      consideringCollId.toString().length !== 24
    ) {
      NotificationManager.error("Please select a collection and try again.");
    } else {
      if (isRizeMember === true) {
        dispatch(changeShowUploadingWLModal(true));
      } else {
        NotificationManager.error("You do not have right to update whitelist.");
        return;
      }
    }
  };

  const handleApplyNewPrice = () => {
    if (
      !consideringCollId ||
      consideringCollId === null ||
      consideringCollId === "" ||
      consideringCollId.toString().length !== 24
    ) {
      NotificationManager.error("Please select a collection and try again.");
    } else {
      if (isInMintingWL === true) {
        if (newItemPrice <= 0) {
          NotificationManager.error("Please input valid price.");
          return;
        }
        //communicate with backend for new price
        let conId = consideringCollId;
        axios
          .post(`${config.API_URL}api/collection/updateWithMintingPrice`, {
            collId: conId || "",
            mintingPrice: newItemPrice || 0,
          })
          .then((response) => {
            if (response.data.code === 0) {
              NotificationManager.success("You've applied new minting price.");

              setTimeout(() => {
                axios
                  .post(`${config.API_URL}api/collection/detail`, {
                    id: conId || "",
                  })
                  .then((response) => {
                    if (response.data.code === 0) {
                      let updatedColl = response.data.data;
                      dispatch(changeDetailedCollection(updatedColl));
                    }
                  })
                  .catch((err) => {});
                dispatch(changeDetailedCollection(conId));
              }, 200);
            } else
              NotificationManager.error(
                "Failed in applying new minting price."
              );
          })
          .catch((error) => {
            NotificationManager.error("Failed in applying new minting price.");
          });
      } else {
        NotificationManager.error("You don't have right to mint.");
        return;
      }
    }
  };

  useEffect(() => {
    setNewItemPrice(detailedCollInfo?.mintingPrice || 0);
  }, [detailedCollInfo]);

  return (
    <div className="absolute z-10 bg-[#000000] w-full min-h-[80px] text-white flex items-center justify-between">
      <div className="flex items-center">
        <Logo className="w-[120px] ml-10" />
        {isInMintingWL === true && (
          <div className="ml-10 flex items-center gap-2">
            <div className="relative dropdown">
              <div className={`dropbtn p-2`}>
                <div className="group py-3 px-6 h-[50px] rounded-full inline-flex items-center text-sm font-medium hover:text-opacity-100 relative !outline-none">
                  <div className="flex justify-center items-center py-3 px-5 bg-[#33ff00] rounded-xl">
                    <span className=" text-neutral-900 text-sm ml-2">
                      Creators Options
                    </span>
                  </div>
                </div>
              </div>
              <div className="dropdown-content">
                <div className="overflow-hidden rounded-2xl shadow-lg ring-1 bg-gray-400 border-[1px] border-[#33ff00] text-black w-[180px]">
                  <div className="relative grid  px-2 py-2 w-full">
                    <div
                      className="py-2 px-2 transition cursor-pointer duration-150 ease-in-out rounded-lg hover:bg-neutral-100 dark:hover:bg-gray-500  flex gap-2 items-center group w-full"
                      onClick={() => handleMenuUploadFiles()}
                    >
                      <span className="group-hover:text-white text-neutral-900 text-sm">
                        Upload folders
                      </span>
                    </div>
                    {isRizeMember === true && (
                      <div
                        className="py-2 px-2 mt-1  transition cursor-pointer duration-150 ease-in-out rounded-lg hover:bg-neutral-100 dark:hover:bg-gray-500  flex gap-2 items-center group w-full"
                        onClick={() => handleMenuUpdateWL()}
                      >
                        <span className="group-hover:text-white text-neutral-900 text-sm">
                          Update Whitelist
                        </span>
                      </div>
                    )}
                    <div className="mt-3 h-8"></div>
                    <div className=" px-2 mt-1 w-full ">
                      <span className=" text-neutral-900 text-sm w-full text-center">
                        Create mint price
                      </span>
                    </div>
                    <div className=" px-2 mt-1 w-full flex ">
                      <input
                        className=" text-[#33ff00] text-sm w-1/2  p-1 bg-gray-500 rounded-lg text-center"
                        type="number"
                        min={0}
                        max={1000}
                        defaultValue={1}
                        value={newItemPrice}
                        onChange={(e) => setNewItemPrice(e.target.value)}
                      />
                      <span className=" text-[#33ff00] text-sm w-1/2 ml-1 p-1 bg-gray-500 rounded-lg text-center">
                        {ACTIVE_CHAINS[currentNetworkSymbol]?.currency}
                      </span>
                    </div>
                    <div className="mt-1 px-2 w-full flex ">
                      <button
                        className="w-full text-neutral-900 text-sm bg-gray-300 hover:bg-gray-600 hover:text-white py-1 rounded-lg"
                        onClick={() => handleApplyNewPrice()}
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-center mt-1 items-center">
        <div className=" text-lg text-[#33ff00] p-1 text-center rounded-lg">
          {" "}
          {!isMobile ? `Public Mint Date ${publicMintDate}` : <></>}
        </div>
      </div>
      <div className="flex items-center mr-10 ">
        <div className="relative dropdown">
          <div className={`dropbtn p-2`}>
            <div className="group py-3 px-6 h-[50px] hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full inline-flex items-center text-sm font-medium hover:text-opacity-100 relative !outline-none">
              {isSupportedNetwork(currentNetworkSymbol) === false && "Chains"}
              {currentNetworkSymbol === PLATFORM_NETWORKS.COREUM && (
                <div className="flex justify-center items-center">
                  <Image
                    src="/images/icons/core.png"
                    className="w-[25px] h-[25px]"
                    width={25}
                    height={25}
                    alt=""
                  />
                  <span className="dark:text-white text-neutral-900 text-sm ml-2">
                    Coreum
                  </span>
                </div>
              )}
              {currentNetworkSymbol === PLATFORM_NETWORKS.ETHEREUM && (
                <div className="flex justify-center items-center">
                  <Image
                    src="/images/icons/eth.png"
                    className="w-[25px] h-[25px]"
                    width={25}
                    height={25}
                    alt=""
                  />
                  <span className="dark:text-white text-neutral-900 text-sm ml-2">
                    Ethereum
                  </span>
                </div>
              )}
              {currentNetworkSymbol === PLATFORM_NETWORKS.BSC && (
                <div className="flex justify-center items-center">
                  <Image
                    src="/images/icons/bsc.png"
                    className="w-[25px] h-[25px]"
                    width={25}
                    height={25}
                    alt=""
                  />
                  <span className="dark:text-white text-neutral-900 text-sm ml-2">
                    BSC
                  </span>
                </div>
              )}
              {currentNetworkSymbol === PLATFORM_NETWORKS.POLYGON && (
                <div className="flex justify-center items-center">
                  <Image
                    src="/images/icons/polygon.png"
                    className="w-[25px] h-[25px]"
                    width={25}
                    height={25}
                    alt=""
                  />
                  <span className="dark:text-white text-neutral-900 text-sm ml-2">
                    Polygon
                  </span>
                </div>
              )}
              {currentNetworkSymbol === PLATFORM_NETWORKS.AVALANCHE && (
                <div className="flex justify-center items-center">
                  <Image
                    src="/images/icons/avax.png"
                    className="w-[25px] h-[25px]"
                    width={25}
                    height={25}
                    alt=""
                  />
                  <span className="dark:text-white text-neutral-900 text-sm ml-2">
                    Avalanche
                  </span>
                </div>
              )}
              {currentNetworkSymbol === PLATFORM_NETWORKS.NEAR && (
                <div className="flex justify-center items-center">
                  <Image
                    src="/images/icons/near.png"
                    className="w-[25px] h-[25px]"
                    width={25}
                    height={25}
                    alt=""
                  />
                  <span className="dark:text-white text-neutral-900 text-sm ml-2">
                    Near
                  </span>
                </div>
              )}
              {currentNetworkSymbol === PLATFORM_NETWORKS.NEAR && (
                <div className="flex justify-center items-center">
                  <Image
                    src="/images/icons/near.png"
                    className="w-[25px] h-[25px]"
                    width={25}
                    height={25}
                    alt=""
                  />
                  <span className="dark:text-white text-neutral-900 text-sm ml-2">
                    XRPL
                  </span>
                </div>
              )}
              {currentNetworkSymbol === PLATFORM_NETWORKS.NEAR && (
                <div className="flex justify-center items-center">
                  <Image
                    src="/images/icons/near.png"
                    className="w-[25px] h-[25px]"
                    width={25}
                    height={25}
                    alt=""
                  />
                  <span className="dark:text-white text-neutral-900 text-sm ml-2">
                    Cosmos
                  </span>
                </div>
              )}
              {currentNetworkSymbol === PLATFORM_NETWORKS.NEAR && (
                <div className="flex justify-center items-center">
                  <Image
                    src="/images/icons/near.png"
                    className="w-[25px] h-[25px]"
                    width={25}
                    height={25}
                    alt=""
                  />
                  <span className="dark:text-white text-neutral-900 text-sm ml-2">
                    Solana
                  </span>
                </div>
              )}
              {currentNetworkSymbol === PLATFORM_NETWORKS.NEAR && (
                <div className="flex justify-center items-center">
                  <Image
                    src="/images/icons/near.png"
                    className="w-[25px] h-[25px]"
                    width={25}
                    height={25}
                    alt=""
                  />
                  <span className="dark:text-white text-neutral-900 text-sm ml-2">
                    Hedera
                  </span>
                </div>
              )}
              {currentNetworkSymbol === PLATFORM_NETWORKS.NEAR && (
                <div className="flex justify-center items-center">
                  <Image
                    src="/images/icons/near.png"
                    className="w-[25px] h-[25px]"
                    width={25}
                    height={25}
                    alt=""
                  />
                  <span className="dark:text-white text-neutral-900 text-sm ml-2">
                    Tezos
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="dropdown-content">
            <div className="overflow-hidden rounded-2xl shadow-lg ring-1 ring-black ring-opacity-5">
              <div className="relative grid bg-white dark:bg-neutral-800 px-2 py-2 ">
                <div
                  className="py-2 px-2 transition cursor-pointer duration-150 ease-in-out rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 flex gap-2 items-center"
                  onClick={() => handleSelectNetwork(PLATFORM_NETWORKS.COREUM)}
                >
                  <Image
                    src="/images/icons/core.png"
                    className="w-[25px] h-[25px]"
                    width={25}
                    height={25}
                    alt=""
                  />
                  <span className="dark:text-white text-neutral-900 text-sm">
                    Coreum
                  </span>
                </div>
                <div
                  className="py-2 px-2 transition cursor-pointer duration-150 ease-in-out rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 flex gap-2 items-center"
                  onClick={() =>
                    handleSelectNetwork(PLATFORM_NETWORKS.ETHEREUM)
                  }
                >
                  <Image
                    src="/images/icons/eth.png"
                    className="w-[25px] h-[25px]"
                    width={25}
                    height={25}
                    alt=""
                  />
                  <span className="dark:text-white text-neutral-900 text-sm">
                    Ethereum
                  </span>
                </div>
                <div
                  className={clsx(
                    "hover:bg-neutral-100 dark:hover:bg-neutral-700",
                    "py-2 px-2 transition cursor-pointer duration-150 ease-in-out rounded-lg flex gap-2 items-center"
                  )}
                  onClick={() => handleSelectNetwork(PLATFORM_NETWORKS.BSC)}
                >
                  <Image
                    src="/images/icons/bsc.png"
                    className="w-[25px] h-[25px]"
                    width={25}
                    height={25}
                    alt=""
                  />
                  <span className="dark:text-white text-neutral-900 text-sm">
                    BSC
                  </span>
                </div>
                <div
                  className={clsx(
                    false
                      ? "opacity-40"
                      : "hover:bg-neutral-100 dark:hover:bg-neutral-700",
                    "py-2 px-2 transition cursor-pointer duration-150 ease-in-out rounded-lg flex gap-2 items-center"
                  )}
                  onClick={() => handleSelectNetwork(PLATFORM_NETWORKS.POLYGON)}
                >
                  <Image
                    src="/images/icons/polygon.png"
                    className="w-[25px] h-[25px]"
                    width={25}
                    height={25}
                    alt=""
                  />
                  <span className="dark:text-white text-neutral-900 text-sm">
                    Polygon
                  </span>
                </div>
                <div
                  className={clsx(
                    false
                      ? "opacity-40"
                      : "hover:bg-neutral-100 dark:hover:bg-neutral-700",
                    "py-2 px-2 transition cursor-pointer duration-150 ease-in-out rounded-lg flex gap-2 items-center"
                  )}
                  onClick={() =>
                    handleSelectNetwork(PLATFORM_NETWORKS.AVALANCHE)
                  }
                >
                  <Image
                    src="/images/icons/avax.png"
                    className="w-[25px] h-[25px]"
                    width={25}
                    height={25}
                    alt=""
                  />
                  <span className="dark:text-white text-neutral-900 text-sm">
                    Avalanche
                  </span>
                </div>
                <div
                  className={clsx(
                    true
                      ? "opacity-40"
                      : "hover:bg-neutral-100 dark:hover:bg-neutral-700",
                    "py-2 px-2 transition cursor-pointer duration-150 ease-in-out rounded-lg flex gap-2 items-center"
                  )}
                  // onClick={() =>                       handleSelectNetwork(PLATFORM_NETWORKS.NEAR)                     }
                >
                  <Image
                    src="/images/icons/near.png"
                    className="w-[25px] h-[25px]"
                    width={25}
                    height={25}
                    alt=""
                  />
                  <span className="dark:text-white text-neutral-900 text-sm">
                    Near
                  </span>
                </div>
                <div
                  className={clsx(
                    true
                      ? "opacity-40"
                      : "hover:bg-neutral-100 dark:hover:bg-neutral-700",
                    "py-2 px-2 transition cursor-pointer duration-150 ease-in-out rounded-lg flex gap-2 items-center"
                  )}
                  // onClick={() =>                       handleSelectNetwork(PLATFORM_NETWORKS.NEAR)                     }
                >
                  <Image
                    src="/images/icons/xrp2.png"
                    className="w-[25px] h-[25px]"
                    width={25}
                    height={25}
                    alt=""
                  />
                  <span className="dark:text-white text-neutral-900 text-sm">
                    XRPL
                  </span>
                </div>
                <div
                  className={clsx(
                    true
                      ? "opacity-40"
                      : "hover:bg-neutral-100 dark:hover:bg-neutral-700",
                    "py-2 px-2 transition cursor-pointer duration-150 ease-in-out rounded-lg flex gap-2 items-center"
                  )}
                  // onClick={() =>                       handleSelectNetwork(PLATFORM_NETWORKS.NEAR)                     }
                >
                  <Image
                    src="/images/icons/atom.png"
                    className="w-[25px] h-[25px]"
                    width={25}
                    height={25}
                    alt=""
                  />
                  <span className="dark:text-white text-neutral-900 text-sm">
                    Cosmos
                  </span>
                </div>
                <div
                  className={clsx(
                    true
                      ? "opacity-40"
                      : "hover:bg-neutral-100 dark:hover:bg-neutral-700",
                    "py-2 px-2 transition cursor-pointer duration-150 ease-in-out rounded-lg flex gap-2 items-center"
                  )}
                  // onClick={() =>                       handleSelectNetwork(PLATFORM_NETWORKS.NEAR)                     }
                >
                  <Image
                    src="/images/icons/solana.png"
                    className="w-[25px] h-[25px]"
                    width={25}
                    height={25}
                    alt=""
                  />
                  <span className="dark:text-white text-neutral-900 text-sm">
                    Solana
                  </span>
                </div>
                <div
                  className={clsx(
                    true
                      ? "opacity-40"
                      : "hover:bg-neutral-100 dark:hover:bg-neutral-700",
                    "py-2 px-2 transition cursor-pointer duration-150 ease-in-out rounded-lg flex gap-2 items-center"
                  )}
                  // onClick={() =>                       handleSelectNetwork(PLATFORM_NETWORKS.NEAR)                     }
                >
                  <Image
                    src="/images/icons/hedera.png"
                    className="w-[25px] h-[25px]"
                    width={25}
                    height={25}
                    alt=""
                  />
                  <span className="dark:text-white text-neutral-900 text-sm">
                    Hedera
                  </span>
                </div>
                <div
                  className={clsx(
                    true
                      ? "opacity-40"
                      : "hover:bg-neutral-100 dark:hover:bg-neutral-700",
                    "py-2 px-2 transition cursor-pointer duration-150 ease-in-out rounded-lg flex gap-2 items-center"
                  )}
                  // onClick={() =>                       handleSelectNetwork(PLATFORM_NETWORKS.NEAR)                     }
                >
                  <Image
                    src="/images/icons/tezos.png"
                    className="w-[25px] h-[25px]"
                    width={25}
                    height={25}
                    alt=""
                  />
                  <span className="dark:text-white text-neutral-900 text-sm">
                    Tezos
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative dropdown">
          <ButtonPrimary
            onClick={() => {
              if (isSupportedNetwork(currentNetworkSymbol) === true) {
                if (currentNetworkSymbol === PLATFORM_NETWORKS.COREUM) {
                  // authenticate();
                } else if (currentNetworkSymbol === PLATFORM_NETWORKS.NEAR) {
                } else {
                  onClickConnectEVMWallet();
                }
              } else {
                toast.warn("Please select a network and try again.");
              }
            }}
            sizeClass="px-4 py-2 sm:px-5 my-2"
          >
            <IoWalletOutline size={22} />
            {isEmpty(walletAddress) === false && walletStatus === true ? (
              <span className="pl-2">{getShortAddress(walletAddress)}</span>
            ) : (
              <span className="pl-2">Wallet connect</span>
            )}
          </ButtonPrimary>
          {currentNetworkSymbol === PLATFORM_NETWORKS.COREUM ? (
            <div className="dropdown-content !w-full">
              <div className="overflow-hidden rounded-2xl shadow-lg ring-1 ring-black ring-opacity-5">
                <div className="relative grid bg-white dark:bg-neutral-800 px-2 py-2">
                  <div
                    className="py-2 px-2 transition cursor-pointer duration-150 ease-in-out rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 flex gap-2 items-center"
                    onClick={() => {
                      authenticate("keplr");
                    }}
                  >
                    <Image
                      src="/images/icons/keplr.png"
                      className="w-[25px] h-[25px]"
                      width={25}
                      height={25}
                      alt=""
                    />
                    <span className="dark:text-white text-neutral-900 text-sm">
                      Keplr
                    </span>
                  </div>
                  <div
                    className="py-2 px-2 transition cursor-pointer duration-150 ease-in-out rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 flex gap-2 items-center"
                    onClick={() => {
                      authenticate("leap");
                    }}
                  >
                    <Image
                      src="/images/icons/leap.png"
                      className="w-[25px] h-[25px]"
                      width={25}
                      height={25}
                      alt=""
                    />
                    <span className="dark:text-white text-neutral-900 text-sm">
                      Leap
                    </span>
                  </div>
                  <div
                    className="py-2 px-2 transition cursor-pointer duration-150 ease-in-out rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 flex gap-2 items-center"
                    onClick={() => {
                      authenticate("cosmostation");
                    }}
                  >
                    <Image
                      src="/images/icons/cosmostation.png"
                      className="w-[25px] h-[25px]"
                      width={25}
                      height={25}
                      alt=""
                    />
                    <span className="dark:text-white text-neutral-900 text-sm">
                      Cosmostation
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <></>
          )}
        </div>
        <SwitchDarkMode className="ml-1 hidden" />
      </div>
    </div>
  );
};

export default Header;
