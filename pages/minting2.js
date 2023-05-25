import { useCallback, useEffect, useState } from "react";
import ButtonPrimary from "../shared/Button/ButtonPrimary";
import BG_image from "../images/lines_bg.png";
import { TbBrandTwitter } from "react-icons/tb";
import { RxDiscordLogo } from "react-icons/rx";
import { Backdrop, CircularProgress } from "@mui/material";
import {
  MAX_DISPLAY_NuMBER_OF_ARCH_SWIPER,
  MINTING_PRICE_LIST,
  PINATA_GATEWAY,
} from "../constants";
import RizeSwiper, { getFIleType } from "../components/RizeSwiper";
import Gallery from "../components/Gallery";
import axios from "axios";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  selectCurrentNetworkSymbol,
  selectCurrentUser,
  selectGlobalProvider,
  selectIsCommunityMember,
  selectIsInMintingWL,
} from "../app/reducers/auth.reducers";
import {
  COMPENSATION_ARRAY,
  COREUM_PAYMENT_COINS,
  DEFAULT_BULK_MINT_PREVIEW_IMAGE,
  FILE_TYPE,
  HOMMIS_COLLECTION,
  HOMMIS_COLLECTION_ID,
  PLATFORM_NETWORKS,
  config,
} from "../app/config";
import { NotificationManager } from "react-notifications";
import NetworkLogo from "../components/NetworkLogo";
import { payBulkMintingPriceWithNativeCurrency } from "../InteractWithSmartContract/interact";
import Web3 from "web3";
import {
  changeConsideringCollId,
  changeDetailedCollection,
  changeShowUploadingItemsModal,
  changeShowUploadingWLModal,
  selectDetailedCollection,
  selectShowFilesUploadingModal,
  selectShowWLUploadingModal,
} from "../app/reducers/collection.reducers";
import ModalUploadingFiles from "../components/UploadFilesModal";
import ModalUploadingWL from "../components/UploadWLModal";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { AiOutlineMinusCircle } from "react-icons/ai";
import GifForSplash from "../videos/Homie-Spinner.gif";
import Image from "next/image";

const socials = [
  { name: "Twitter", icon: <TbBrandTwitter color={"#33FF00"} />, href: "#" },
  { name: "Discord", icon: <RxDiscordLogo color={"#33FF00"} />, href: "#" },
];

const Mintingg = () => {
  const dispatch = useAppDispatch();
  const detailedCollectionInfo = useAppSelector(selectDetailedCollection);
  const globalProvider = useAppSelector(selectGlobalProvider);
  const currentNetworkSymbol = useAppSelector(selectCurrentNetworkSymbol);
  const currentUser = useAppSelector(selectCurrentUser);
  const showUploadingItemsModal = useAppSelector(selectShowFilesUploadingModal);
  const showUploadingWLModal = useAppSelector(selectShowWLUploadingModal);
  const [consideringCollectionName, setConsideringCollectionName] =
    useState("");
  const [totalMintingPrice, setTotalMintingPrice] = useState(
    MINTING_PRICE_LIST[PLATFORM_NETWORKS.COREUM].PRICE
  );
  const [mintingCount, setMintingCount] = useState(1);
  const [totalMinted, setTotalMinted] = useState(0);
  const [MAX_COUNT, setMaxCount] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [collsOfCurrentNetwork, setCollsOfCurrentNetwork] = useState([]);
  const [selectedColl, setSelectedColl] = useState({
    ...HOMMIS_COLLECTION,
  });
  const [availableItemsForMint, setAvailableItemsForMint] = useState([]);
  const [myItemsOnConsideringColl, setMyItemsOnConsideringColl] = useState([]);
  // const { collectionConfig, batchMint, balances, sendNativeCurrency } =
  //   useSigningClient();
  const [working, setWorking] = useState(false);
  const [coreumPaymentCoin, setCoreumPaymentCoin] = useState(
    COREUM_PAYMENT_COINS.CORE
  );
  const [mintingIdxs, setMintingIdxs] = useState([]);
  const [showSplash, setShowSplash] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [freeMinted, setFreeMinted] = useState([0, 0, 0, 0]);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsMobile(true);
    }
  }, []);

  useEffect(() => {
    setTotalMintingPrice(
      Number(
        Number(
          mintingCount * (detailedCollectionInfo?.mintingPrice || 0)
        ).toFixed(2)
      )
    );
    refreshMintedItems();
  }, [detailedCollectionInfo, mintingCount, refreshMintedItems]);

  useEffect(() => {
    setTimeout(() => {
      if (selectedColl._id.toString().length === 24) {
      } else {
        return;
      }
      axios
        .post(`${config.API_URL}api/collection/detail`, {
          id: selectedColl?._id || "",
        })
        .then(async (response) => {
          if (response.data.code === 0) {
            let updatedColl = response.data.data;
            dispatch(changeDetailedCollection(updatedColl));
          }
        })
        .catch((error) => {});
    }, 1000);
  }, [selectedColl, dispatch]);

  useEffect(() => {
    if (selectedColl._id.toString().length === 24) {
    } else {
      return;
    }
    axios
      .post(`${config.API_URL}api/collection/detail`, {
        id: selectedColl?._id || "",
      })
      .then(async (response) => {
        if (response.data.code === 0) {
          let updatedColl = response.data.data;
          dispatch(changeDetailedCollection(updatedColl));
          dispatch(changeConsideringCollId(updatedColl?._id || null));
          setAvailableItemsForMint([]);
          setConsideringCollectionName(updatedColl?.name || "");
          //total item count of coll,
          let totalItemCount =
            Number(updatedColl?.items?.length || 0) +
            Number(updatedColl?.totalItemNumberInCID || 0) -
            Number(updatedColl?.mintedCountOfCID || 0);
          setTotalItems(totalItemCount);
          //total item count minted
          setTotalMinted(updatedColl?.items?.length || 0);
          setMaxCount(
            Number(updatedColl?.totalItemNumberInCID || 0) -
              Number(updatedColl?.mintedCountOfCID || 0)
          );
          let notMintedItems = [];

          let maxCount =
            Number(updatedColl?.totalItemNumberInCID || 0) -
            Number(updatedColl?.mintedCountOfCID || 0);
          if (maxCount > 9) maxCount = 9;
          for (let idx = 1; idx < maxCount + 1; idx++) {
            try {
              let url = `${PINATA_GATEWAY}${updatedColl.jsonFolderCID}/${
                Number(updatedColl.mintedCountOfCID) + Number(idx)
              }.json`;
              let item = await axios.get(url);
              notMintedItems.push(item.data);
            } catch (err) {
              continue;
            }
          }
          setAvailableItemsForMint(notMintedItems);
          refreshMintedItems();
        }
      })
      .catch((err) => {});
  }, [selectedColl, refreshMintedItems, dispatch]);

  const updateUI = async (colelctionInfo) => {
    let totalItemCount =
      Number(colelctionInfo?.items?.length || 0) +
      Number(colelctionInfo?.totalItemNumberInCID || 0) -
      Number(colelctionInfo?.mintedCountOfCID || 0);
    setTotalItems(totalItemCount);
    //total item count minted
    setTotalMinted(colelctionInfo?.items?.length || 0);
    setMaxCount(
      Number(colelctionInfo?.totalItemNumberInCID || 0) -
        Number(colelctionInfo?.mintedCountOfCID || 0)
    );
    let notMintedItems = [];
    let maxCount =
      Number(colelctionInfo?.totalItemNumberInCID || 0) -
      Number(colelctionInfo?.mintedCountOfCID || 0);
    if (maxCount > 9) maxCount = 9;
    for (let idx = 1; idx < maxCount + 1; idx++) {
      try {
        let url = `${PINATA_GATEWAY}${colelctionInfo.jsonFolderCID}/${
          Number(colelctionInfo.mintedCountOfCID) + Number(idx)
        }.json`;
        let item = await axios.get(url);
        notMintedItems.push(item.data);
      } catch (err) {
        continue;
      }
    }
    setAvailableItemsForMint(notMintedItems);
    refreshMintedItems();
  };

  useEffect(() => {
    axios
      .post(`${config.API_URL}api/collection/getCollsOnANetwork`, {
        networkSymbol: currentNetworkSymbol,
      })
      .then((response) => {
        if (response.data.code === 0)
          setCollsOfCurrentNetwork(response.data.data);
      });
  }, [currentNetworkSymbol]);

  const handleClickPlus = () => {
    if (mintingCount < MAX_COUNT) {
      let newCount = mintingCount + 1;
      setMintingCount(newCount);
      setTotalMintingPrice(
        Number(
          Number(
            newCount * (detailedCollectionInfo?.mintingPrice || 0)
          ).toFixed(2)
        )
      );
    }
  };

  const handleClickMinus = () => {
    if (mintingCount > 1) {
      let newCount = mintingCount - 1;
      setMintingCount(newCount);
      setTotalMintingPrice(
        Number(
          Number(
            newCount * (detailedCollectionInfo?.mintingPrice || 0)
          ).toFixed(2)
        )
      );
    }
  };

  const handleClickMax = () => {
    setMintingCount(MAX_COUNT);
    setTotalMintingPrice(
      Number(
        Number(MAX_COUNT * (detailedCollectionInfo?.mintingPrice || 0)).toFixed(
          2
        )
      )
    );
  };

  const checkNativeCurrencyAndTokenBalances = async (tokenAmountShouldPay) => {
    if (
      balances[config.COIN_MINIMAL_DENOM] <= 0 ||
      (tokenAmountShouldPay > 0 && balances.cw20 <= tokenAmountShouldPay)
    ) {
      NotificationManager.warn("Insufficient CORE or RIZE");
      return false;
    }
    return true;
  };

  const isSupportedEVMNetwork = (currentNetwork) => {
    if (
      currentNetwork === PLATFORM_NETWORKS.ETHEREUM ||
      currentNetwork === PLATFORM_NETWORKS.BSC ||
      currentNetwork === PLATFORM_NETWORKS.AVALANCHE ||
      currentNetwork === PLATFORM_NETWORKS.POLYGON
    ) {
      return true;
    } else return false;
  };

  const saveMultipleItem = async (params, sel_JsonFiles, fmint = false) => {
    setWorking(true);
    const metas = [];
    let names = [];
    let descriptions = [];
    let paths = [];
    for (let idx = 0; idx < sel_JsonFiles.length; idx++) {
      if (sel_JsonFiles.length > 0) {
        const metaList = [];
        names.push(sel_JsonFiles[idx].name);
        descriptions.push(sel_JsonFiles[idx].description);
        paths.push(sel_JsonFiles[idx].image.toString().replace("ipfs://", ""));
        const attributes = sel_JsonFiles[idx].attributes;
        for (let j = 0; j < attributes.length; j++) {
          const meta = {
            key: "",
            value: null,
          };
          const attribute = attributes[j];
          meta.key = attribute.trait_type;
          meta.value = attribute.value;
          metaList.push(meta);
        }
        metas.push(metaList);
      }
    }
    await axios
      .post(`${config.API_URL}api/item/bulkcreate522`, {
        params,
        names,
        descriptions,
        paths,
        metas,
      })
      .then(async function (response) {
        if (response.status === 200) {
          const IdArray = [...response.data];
          if (currentNetworkSymbol === PLATFORM_NETWORKS.COREUM) {
            var prices = [];
            for (let idx = 0; idx < IdArray.length; idx++) prices[idx] = 0;
            //do transaction
            try {
              let colllectionInfo = await collectionConfig(
                selectedColl?.address
              );
              let startId = colllectionInfo.unused_token_id;
              let balanceCheck = await checkNativeCurrencyAndTokenBalances(0);
              if (balanceCheck === false) {
                axios
                  .post(`${config.API_URL}api/item/deleteManyByIds`, {
                    idArray: IdArray,
                    collId: detailedCollectionInfo?._id || "",
                  })
                  .then((response) => {})
                  .catch((error) => {});
                setWorking(false);
                return;
              }
              let txHash = await batchMint(
                currentUser.address,
                selectedColl.address,
                params.metadataURIs,
                names,
                (detailedCollectionInfo?.mintingPrice || 0) * mintingCount,
                fmint
              );
              //succeed, then update all items with token ids
              if (txHash == -1) {
                NotificationManager.error("Network error.");
                axios
                  .post(`${config.API_URL}api/item/deleteManyByIds`, {
                    idArray: IdArray,
                    collId: detailedCollectionInfo?._id || "",
                  })
                  .then((response) => {})
                  .catch((error) => {});
                setWorking(false);
                return;
              } else {
                axios
                  .post(`${config.API_URL}api/item/updateTokenIds`, {
                    idArray: IdArray,
                    startTokenId: startId,
                  })
                  .then((response) => {
                    if (response.data.code === 0) {
                      NotificationManager.success(
                        "You've created NFTs sucessfully."
                      );
                      axios
                        .post(
                          `${config.API_URL}api/collection/increaseMintedCount`,
                          {
                            collId: selectedColl._id,
                            addCount: mintingCount,
                            mintedIndexs: mintingIdxs,
                          }
                        )
                        .then((response) => {
                          setMintingIdxs([]);
                          setMintingCount(1);
                          setTimeout(() => {
                            axios
                              .post(`${config.API_URL}api/collection/detail`, {
                                id: selectedColl._id,
                              })
                              .then((response) => {
                                if (response.data.code === 0) {
                                  let updatedColl = response.data.data;
                                  dispatch(
                                    changeDetailedCollection(updatedColl)
                                  );
                                  updateUI(updatedColl);
                                  axios
                                    .post(
                                      `${config.API_URL}api/users/setFreeMintStatus`,
                                      {
                                        addr: currentUser?.address,
                                        freemint: true,
                                      }
                                    )
                                    .then((response) => {})
                                    .catch((error) => {});
                                }
                              })
                              .catch((err) => {});
                          }, 200);
                        })
                        .catch((err) => {});
                    }
                  })
                  .catch((error) => {
                    NotificationManager.error("Server side error.");
                  });
              }
            } catch (error) {
              NotificationManager.error(error.message);
              //if tx fail, then delete all items on DB
              axios
                .post(`${config.API_URL}api/item/deleteManyByIds`, {
                  idArray: IdArray,
                  collId: detailedCollectionInfo?._id || "",
                })
                .then((response) => {})
                .catch((error1) => {});
              setWorking(false);
              return;
            }
          } else if (isSupportedEVMNetwork(currentNetworkSymbol) === true) {
            if (isSupportedEVMNetwork(currentNetworkSymbol)) {
              NotificationManager.success("You've created NFTs sucessfully.");

              axios
                .post(`${config.API_URL}api/collection/increaseMintedCount`, {
                  collId: selectedColl._id,
                  addCount: mintingCount,
                  mintedIndexs: mintingIdxs,
                })
                .then((response) => {
                  setMintingIdxs([]);
                  setMintingCount(1);
                  setTimeout(() => {
                    axios
                      .post(`${config.API_URL}api/collection/detail`, {
                        id: selectedColl._id,
                      })
                      .then((response) => {
                        if (response.data.code === 0) {
                          let updatedColl = response.data.data;

                          dispatch(changeDetailedCollection(updatedColl));
                          updatedColl(updatedColl);
                        }
                      })
                      .catch((err) => {});
                  }, 200);
                })
                .catch((err) => {});
            }
          }
          setWorking(false);
        } else {
          setWorking(false);
          NotificationManager.error("Failed in multiple items uploading");
        }
      })
      .catch(function (error) {
        setWorking(false);
        NotificationManager.error("Failed in multiple items uploading");
      });
  };

  const handleClickMint = async () => {
    let fmint = false;
    let freeUser = false;

    for (let i = 0; i < COMPENSATION_ARRAY.length; i++) {
      if (COMPENSATION_ARRAY[i] === currentUser?.address) {
        freeUser = true;
        break;
      }
    }

    if (freeUser) {
      await axios
        .post(`${config.API_URL}api/users/getFreeMintStatus`, {
          addr: currentUser?.address || "",
        })
        .then((response) => {
          if (response.status === 200) {
            let status = response.data;
            if (mintingCount === status?.count && status?.freemint === false) {
              fmint = true;
            } else {
              NotificationManager.error(
                "You can only mint " + status?.count + "nfts for free now!"
              );
              return;
            }
          }
        })
        .catch((error) => {
          NotificationManager.error("You can only free mint");
          return;
        });
    }
    if (freeUser && !fmint) return;
    //read mintingcount
    if (
      mintingCount > 0 &&
      currentUser &&
      currentUser._id &&
      selectedColl &&
      selectedColl._id
    ) {
      if (selectedColl._id.toString().length === 24) {
      } else {
        return;
      }
      setShowSplash(true);
      setTimeout(async () => {
        setShowSplash(false);
        setWorking(true);
        if (currentNetworkSymbol === PLATFORM_NETWORKS.COREUM) {
          // let payMintingPrice = await sendNativeCurrency(
          //   currentUser.address,
          //   MINTING_PRICE_LIST[currentNetworkSymbol].TREASURY_WALLET,
          //   (detailedCollectionInfo?.mintingPrice || 0) * mintingCount
          // );
          // if (payMintingPrice == -1) {
          //   NotificationManager.error("Network error.");
          //   setWorking(false);
          //   return;
          // }
        } else if (currentNetworkSymbol === PLATFORM_NETWORKS.ETHEREUM) {
          let payPrice = await payBulkMintingPriceWithNativeCurrency(
            new Web3(globalProvider),
            currentUser?.address,
            MINTING_PRICE_LIST[currentNetworkSymbol].TREASURY_WALLET,
            (detailedCollectionInfo?.mintingPrice || 0) * mintingCount,
            currentNetworkSymbol
          );
          if (payPrice.success != true) {
            NotificationManager.error("Network error.");
            setWorking(false);
            return;
          }
        }
        axios
          .post(`${config.API_URL}api/collection/getRandomIdsForBulkMint`, {
            collId: selectedColl._id,
            mintingCount: mintingCount,
          })
          .then((response) => {
            setMintingIdxs(response.data.data);
            let mintingIndexArray = response.data.data;
            if (mintingIndexArray.length > 0) {
              // read item infomations from pinata
              let notMintedItems = [];
              let promisesForfetching = [];
              let uris = [];
              for (let idx = 0; idx < mintingIndexArray.length; idx++) {
                let url = `${PINATA_GATEWAY}${
                  detailedCollectionInfo.jsonFolderCID
                }/${Number(mintingIndexArray[idx]) + Number(1)}.json`;
                uris.push(url);
                promisesForfetching.push(axios.get(url));
              }
              Promise.all(promisesForfetching)
                .then(async (responses) => {
                  for (let idx1 = 0; idx1 < responses.length; idx1++) {
                    notMintedItems.push(responses[idx1].data);
                  }
                  //read item(name, description, image, attibutes)s

                  const params = {
                    itemMusicURL: notMintedItems[0].image
                      .toString()
                      .replace("ipfs://", ""),
                    itemLogoURL:
                      getFIleType(notMintedItems[0].image) !== FILE_TYPE.IMAGE
                        ? DEFAULT_BULK_MINT_PREVIEW_IMAGE
                        : notMintedItems[0].image
                            .toString()
                            .replace("ipfs://", ""),
                    collectionId: selectedColl?._id || "",
                    creator: HOMMIS_COLLECTION.owner || "",
                    owner: currentUser?._id || "",
                    fileType: getFIleType(notMintedItems[0].image),
                    isSale: 0,
                    price: 0,
                    auctionPeriod: 0,
                    stockAmount: 1,
                    metaData: "",
                    timeLength: 0,
                    stockGroupId: new Date().getTime(),
                    chainId: currentNetworkSymbol || 1,
                    metadataURIs: uris,
                    networkSymbol: currentNetworkSymbol || 1,
                    coreumPaymentUnit: coreumPaymentCoin,
                  };
                  // await saveMultipleItem(params, notMintedItems, fmint);

                  refreshWithNotMintedItems();

                  setWorking(false);
                })
                .catch((error) => {});
            } else {
              NotificationManager.warning(
                "The collection hae no remained item for mintng."
              );
              return;
            }
          })
          .catch((error) => {});
      }, 5000);
    }
  };

  const handleClickApplyForMinting = async (newJsonFolderCID) => {
    if (showUploadingItemsModal) dispatch(changeShowUploadingItemsModal(false));
    if (
      mintingCount > 0 &&
      selectedColl &&
      selectedColl._id &&
      newJsonFolderCID &&
      currentUser &&
      currentUser._id
    ) {
      if (selectedColl._id.toString().length === 24) {
      } else {
        return;
      }
      await axios
        .get(`${PINATA_GATEWAY}${newJsonFolderCID}`)
        .then((res) => {
          let fethedStr = res.data.toString();
          let itemCount = fethedStr.split("<tr>").length - 1;

          axios
            .post(`${config.API_URL}api/collection/updateWithJsonCID`, {
              collId: selectedColl?._id || "",
              jsonFolderCID: newJsonFolderCID || "",
              totalItemNumberInCID: itemCount,
            })
            .then((response) => {
              if (response.data.code === 0) {
                //fetch collection name ,

                setTimeout(() => {
                  if (selectedColl._id.toString().length === 24) {
                  } else {
                    return;
                  }
                  axios
                    .post(`${config.API_URL}api/collection/detail`, {
                      id: selectedColl?._id || "",
                    })
                    .then((response) => {
                      if (response.data.code === 0) {
                        let updatedColl = response.data.data;
                        dispatch(changeDetailedCollection(updatedColl));
                        setConsideringCollectionName(updatedColl?.name || "");
                        //total item count of coll,
                        let totalItemCount =
                          Number(updatedColl?.items?.length || 0) +
                          Number(updatedColl?.totalItemNumberInCID || 0) -
                          Number(updatedColl?.mintedCountOfCID || 0);
                        setTotalItems(totalItemCount);
                        setTotalMinted(updatedColl?.items?.length || 0);
                        setMaxCount(
                          Number(updatedColl?.totalItemNumberInCID || 0) -
                            Number(updatedColl?.mintedCountOfCID || 0)
                        );
                        setTimeout(() => {
                          refreshWithNotMintedItems();
                        }, 300);
                      }
                    })
                    .catch((error) => {});
                }, 100);
              }
            })
            .catch((error) => {});
        })
        .catch((error) => {});
    }
  };

  const refreshWithNotMintedItems = async () => {
    if (detailedCollectionInfo && MAX_COUNT > 0) {
      let fetchStartId = detailedCollectionInfo?.mintedCountOfCID || 0;
      let fetchCount =
        MAX_COUNT >= MAX_DISPLAY_NuMBER_OF_ARCH_SWIPER
          ? MAX_DISPLAY_NuMBER_OF_ARCH_SWIPER
          : MAX_COUNT;
      let notMintedItems = [];
      for (let idx = 1; idx < fetchCount + 1; idx++) {
        try {
          let url = `${PINATA_GATEWAY}${detailedCollectionInfo.jsonFolderCID}/${
            Number(fetchStartId) + Number(idx)
          }.json`;
          let item = await axios.get(url);
          notMintedItems.push(item.data);
        } catch (err) {
          continue;
        }
      }
      setAvailableItemsForMint(notMintedItems);
      refreshMintedItems();
    }
  };

  const refreshMintedItems = useCallback(() => {
    if (
      !detailedCollectionInfo ||
      !detailedCollectionInfo._id ||
      !currentUser?._id
    )
      return;

    if (detailedCollectionInfo._id.toString().length === 24) {
    } else {
      return;
    }
    axios
      .post(`${config.API_URL}api/item/getUserItemsOnAColl`, {
        collId: detailedCollectionInfo._id,
        userId: currentUser?._id || "",
      })
      .then((response) => {
        setMyItemsOnConsideringColl(response.data.data);
      })
      .catch((error) => {});
  }, [detailedCollectionInfo, currentUser]);

  function CheckIcon(props) {
    return (
      <svg viewBox="0 0 24 24" fill="none" {...props}>
        <circle cx={12} cy={12} r={12} fill="#fff" opacity="0.2" />
        <path
          d="M7 13l3 3 7-7"
          stroke="#fff"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <div className="relative bg-[#161616] text-white min-h-[100vh] w-full  z-2 overflow-hidden pb-10 ">
      <div className="relative bg-[#161616] text-white min-h-[100vh] w-full  z-2 overflow-hidden pb-10 ">
        <div
          className="absolute bg-[#33ff00] opacity-30 blur-[100px] w-[300px] h-[300px] rounded-full -top-[100px]
        -left-[100px] z-1"
        ></div>
        <div
          className="absolute bg-[#33ff00] opacity-30 blur-[100px] w-[300px] h-[300px] rounded-full -bottom-[100px]
        -right-[100px] z-1"
        ></div>
        <Image
          src={BG_image}
          alt=""
          className="absolute w-[100vw] min-h-[100vh] z-0 opacity-5 select-none "
        />

        <div className="flex flex-col justify-center items-center w-full">
          <div
            className={`flex flex-col items-center border-[#33ff00] border-2  w-8/12 rounded-lg 
            mt-[100px] justify-center
          `}
          >
            <Image
              src={`${config.API_URL}uploads/${selectedColl?.bannerURL}`}
              className="w-full h-full"
              alt=""
            />
          </div>
        </div>
        {!isMobile ? (
          <>
            <div className="flex flex-col w-1/2 bg-[#ffffff25] min-h-[500px] rounded-lg ml-auto mr-auto m-10">
              <div className="flex justify-center">
                <div className="w-9/12 bg-[#101010] border-2 border-[#33ff00] text-lg text-bold text-[#33ff00] p-1 px-5 text-center mt-5 rounded-lg flex justify-between">
                  <div>{consideringCollectionName}</div>
                  <div>
                    {totalMinted}/{totalItems}
                  </div>
                </div>
              </div>
              <div className="flex justify-center mt-5 ">
                <div
                  className="col-lg-6 rize-what-we-are-left f-end mb-4 mb-sm-0 order-1 order-sm-2 d-flex "
                  style={{ justifyContent: "space-between" }}
                >
                  <RizeSwiper
                    className="bg-transparent  w-2/3 rounded-lg z-5"
                    items={availableItemsForMint}
                  />
                </div>
              </div>
              <div className="flex w-full justify-center mt-20 gap-3">
                <div className="w-[31%]  bg-[#101010] border-2 border-[#33ff00] text-md text-[#33ff00] p-1 text-center rounded-lg flex items-center justify-center">
                  Cost
                </div>
                <div className="w-5/12 flex justify-between bg-[#101010] border-2 border-[#33ff00] text-md text-[#33ff00] p-1 text-center rounded-lg  items-center">
                  <input
                    className="ml-7 w-8 text-white text-center border-none bg-transparent "
                    value={totalMintingPrice}
                    disabled={true}
                  ></input>
                  <NetworkLogo
                    networkSymbol={
                      currentNetworkSymbol || PLATFORM_NETWORKS.COREUM
                    }
                    className=""
                  />
                </div>
              </div>
              <div className="flex w-full justify-center mt-5 gap-3 relative">
                <div className="w-[31%]  bg-[#101010] border-2 border-[#33ff00] text-sm text-[#33ff00] p-1 text-center rounded-lg flex items-center justify-center">
                  {`${mintingCount} of  NFT(s)`}
                </div>
                <div className="w-5/12 flex justify-between bg-[#101010] border-2 border-[#33ff00] text-md text-[#33ff00] p-1 text-center rounded-lg items-center relative">
                  <div className="flex justify-between w-full cursor-pointer absolute z-10">
                    <div className=" flex">
                      <AiOutlineMinusCircle
                        className="w-6 h-6 ml-1 cursor-pointer select-none "
                        onClick={() => handleClickMinus()}
                      />
                      <input
                        className="w-8 text-white text-center border-none bg-transparent "
                        value={mintingCount}
                        disabled={true}
                      ></input>
                      <AiOutlinePlusCircle
                        className="w-6 h-6 ml-1  cursor-pointer select-none "
                        onClick={() => handleClickPlus()}
                      />
                    </div>
                    <div
                      className="max-h-[30px] p-0  cursor-pointer select-none mr-2 border-[#33ff00] border-2 bg-[#33ff00] text-white rounded-md px-1"
                      onClick={() => handleClickMax()}
                    >
                      Max
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 flex justify-center pb-5">
                <ButtonPrimary
                  className="w-9/12 "
                  onClick={() => handleClickMint()}
                >
                  Mint
                </ButtonPrimary>
              </div>
            </div>
            <div className="flex flex-col p-2"></div>
            <div className="flex flex-col w-1/2 ml-auto mr-auto bg-[#ffffff25] min-h-[500px] rounded-lg">
              <div className="flex justify-center">
                <div className="w-9/12 bg-[#101010] border-2 border-[#33ff00] text-lg text-bold text-[#33ff00] p-1 text-center mt-5 rounded-lg">
                  Here&apos;s your NFT(s)
                </div>
              </div>
              <div className="flex justify-center mt-10 min-h-[300px]">
                <Gallery
                  className="bg-transparent border-2 border-[#33ff00] p-5 w-9/12 rounded-lg z-5"
                  items={myItemsOnConsideringColl}
                />
              </div>
              <div className="flex w-full  justify-center mt-10 relative">
                <div className="flex w-9/12  justify-between absolute z-10">
                  <div className="w-4/12 bg-[#101010] border-2 border-[#33ff00] text-md text-[#33ff00] p-1 text-center mt-5 rounded-lg flex justify-center items-center cursor-pointer select-none z-5 ">
                    <div>{socials[0].icon}</div>
                    <div className="ml-1">Tweet it!</div>
                  </div>
                  <div className="w-4/12 ml-1  bg-[#101010] border-2 border-[#33ff00] text-md text-[#33ff00] p-1 text-center mt-5 rounded-lg flex justify-center items-center cursor-pointer select-none z-5 ">
                    <div>{socials[1].icon}</div>
                    <div className="ml-1">Share it!</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col w-full bg-[#ffffff25] min-h-[500px] rounded-lg ml-auto mr-auto m-10">
              <div className="flex justify-center">
                <div className="w-9/12 bg-[#101010] border-2 border-[#33ff00] text-lg text-bold text-[#33ff00] p-1 px-5 text-center mt-5 rounded-lg flex justify-between">
                  <div>{consideringCollectionName}</div>
                  <div>
                    {totalMinted}/{totalItems}
                  </div>
                </div>
              </div>
              <div className="flex justify-center mt-5 ">
                <div
                  className="col-lg-6 rize-what-we-are-left f-end mb-4 mb-sm-0 order-1 order-sm-2 d-flex "
                  style={{ justifyContent: "space-between" }}
                >
                  <RizeSwiper
                    className="bg-transparent  w-1/2 rounded-lg z-5"
                    items={availableItemsForMint}
                  />
                </div>
              </div>
              <div className="flex w-full justify-center mt-20 gap-3">
                <div className="w-[31%]  bg-[#101010] border-2 border-[#33ff00] text-md text-[#33ff00] p-1 text-center rounded-lg flex items-center justify-center">
                  Cost
                </div>
                <div className="w-5/12 flex justify-between bg-[#101010] border-2 border-[#33ff00] text-md text-[#33ff00] p-1 text-center rounded-lg  items-center">
                  <input
                    className="ml-7 w-8 text-white text-center border-none bg-transparent "
                    value={totalMintingPrice}
                    disabled={true}
                  ></input>
                  <NetworkLogo
                    networkSymbol={
                      currentNetworkSymbol || PLATFORM_NETWORKS.COREUM
                    }
                    className=""
                  />
                </div>
              </div>
              <div className="flex w-full justify-center mt-5 gap-3 relative">
                <div className="w-[31%]  bg-[#101010] border-2 border-[#33ff00] text-sm text-[#33ff00] p-1 text-center rounded-lg flex items-center justify-center">
                  {`${mintingCount} of  NFT(s)`}
                </div>
                <div className="w-5/12 flex justify-between bg-[#101010] border-2 border-[#33ff00] text-md text-[#33ff00] p-1 text-center rounded-lg items-center relative">
                  <div className="flex justify-between w-full cursor-pointer absolute z-10">
                    <div className=" flex">
                      <AiOutlineMinusCircle
                        className="w-6 h-6 ml-1 cursor-pointer select-none "
                        onClick={() => handleClickMinus()}
                      />
                      <input
                        className="w-8 text-white text-center border-none bg-transparent "
                        value={mintingCount}
                        disabled={true}
                      ></input>
                      <AiOutlinePlusCircle
                        className="w-6 h-6 ml-1  cursor-pointer select-none "
                        onClick={() => handleClickPlus()}
                      />
                    </div>
                    <div
                      className="max-h-[30px] p-0  cursor-pointer select-none mr-2 border-[#33ff00] border-2 bg-[#33ff00] text-white rounded-md px-1"
                      onClick={() => handleClickMax()}
                    >
                      Max
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 flex justify-center pb-5">
                <ButtonPrimary
                  className="w-9/12 "
                  onClick={() => handleClickMint()}
                >
                  Mint
                </ButtonPrimary>
              </div>
            </div>
            <div className="flex flex-col p-2"></div>
            <div className="flex flex-col w-full ml-auto mr-auto bg-[#ffffff25] min-h-[500px] rounded-lg">
              <div className="flex justify-center">
                <div className="w-9/12 bg-[#101010] border-2 border-[#33ff00] text-lg text-bold text-[#33ff00] p-1 text-center mt-5 rounded-lg">
                  Here&apos;s your NFT(s)
                </div>
              </div>
              <div className="flex justify-center mt-10 min-h-[300px]">
                <Gallery
                  className="bg-transparent border-2 border-[#33ff00] p-5 w-9/12 rounded-lg z-5"
                  items={myItemsOnConsideringColl}
                />
              </div>
              <div className="flex w-full  justify-center mt-10 relative">
                <div className="flex w-9/12  justify-between absolute z-10">
                  <div className="w-4/12 bg-[#101010] border-2 border-[#33ff00] text-md text-[#33ff00] p-1 text-center mt-5 rounded-lg flex justify-center items-center cursor-pointer select-none z-5 ">
                    <div>{socials[0].icon}</div>
                    <div className="ml-1">Tweet it!</div>
                  </div>
                  <div className="w-4/12 ml-1  bg-[#101010] border-2 border-[#33ff00] text-md text-[#33ff00] p-1 text-center mt-5 rounded-lg flex justify-center items-center cursor-pointer select-none z-5 ">
                    <div>{socials[1].icon}</div>
                    <div className="ml-1">Share it!</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <Backdrop
          sx={{
            color: "#ffffff3f",
            backgroundColor: "#000000cc",
            zIndex: (theme) => theme.zIndex.drawer + 1,
          }}
          open={showSplash}
        >
          <Image src={GifForSplash} className="w-[25vw]" alt="" />
        </Backdrop>

        <Backdrop
          sx={{
            color: "#ffffff3f",
            backgroundColor: "#000000cc",
            zIndex: (theme) => theme.zIndex.drawer + 1,
          }}
          open={working}
        >
          <CircularProgress color="inherit" />
        </Backdrop>

        <ModalUploadingFiles
          show={showUploadingItemsModal}
          onOk={handleClickApplyForMinting}
          onCloseModal={() => {
            dispatch(changeShowUploadingItemsModal(false));
          }}
        />

        <ModalUploadingWL
          show={showUploadingWLModal}
          onOk={() => dispatch(changeShowUploadingWLModal(false))}
          onCloseModal={() => {
            dispatch(changeShowUploadingWLModal(false));
          }}
        />
      </div>
    </div>
  );
};

export default Mintingg;
