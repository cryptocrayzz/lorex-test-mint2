import Image from 'next/image'
import imageGif from '@/public/assets/image/giftnft.gif'
import logo from '@/public/assets/image/logo.png'
import xLogo from '@/public/assets/image/x-logo.png'
import telegramLogo from '@/public/assets/image/telegram-logo.png'
import logoForm from '@/public/assets/image/logo-form.png'
import dynamic from 'next/dynamic'
import React, { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react'
import profile from "@/public/assets/image/profile.png";
import MainCard from '@/components/MainCard';
import {
  PublicKey,
  publicKey,
  Umi,
} from "@metaplex-foundation/umi";
import { DigitalAssetWithToken, JsonMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { useUmi } from "../utils/useUmi";
import { fetchCandyMachine, safeFetchCandyGuard, CandyGuard, CandyMachine, AccountVersion } from "@metaplex-foundation/mpl-candy-machine"
import { guardChecker } from "../utils/checkAllowed";
import { Center, Card, CardHeader, CardBody, StackDivider, Heading, Stack, useToast, Text, Skeleton, useDisclosure, Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Box, Divider, VStack, Flex } from '@chakra-ui/react';
import { GuardReturn } from "../utils/checkerHelper";
import { ShowNft } from "../components/showNft";
import { InitializeModal } from "../components/initializeModal";
import { headerText } from "../settings";
import { useSolanaTime } from "@/utils/SolanaTimeContext";
import { MintButtonList } from '@/components/MintButtonList';

const WalletMultiButtonDynamic = dynamic(
    async () =>
      (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
    { ssr: false }
);

const useCandyMachine = (
    umi: Umi,
    candyMachineId: string,
    checkEligibility: boolean,
    setCheckEligibility: Dispatch<SetStateAction<boolean>>,
    firstRun: boolean,
    setfirstRun: Dispatch<SetStateAction<boolean>>
  ) => {
    const [candyMachine, setCandyMachine] = useState<CandyMachine>();
    const [candyGuard, setCandyGuard] = useState<CandyGuard>();
    const toast = useToast();
  
  
    useEffect(() => {
      (async () => {
        if (checkEligibility) {
          if (!candyMachineId) {
            console.error("No candy machine in .env!");
            if (!toast.isActive("no-cm")) {
              toast({
                id: "no-cm",
                title: "No candy machine in .env!",
                description: "Add your candy machine address to the .env file!",
                status: "error",
                duration: 999999,
                isClosable: true,
              });
            }
            return;
          }
  
          let candyMachine;
          try {
            candyMachine = await fetchCandyMachine(umi, publicKey(candyMachineId));
            //verify CM Version
            if (candyMachine.version != AccountVersion.V2) {
              toast({
                id: "wrong-account-version",
                title: "Wrong candy machine account version!",
                description: "Please use latest sugar to create your candy machine. Need Account Version 2!",
                status: "error",
                duration: 999999,
                isClosable: true,
              });
              return;
            }
          } catch (e) {
            console.error(e);
            toast({
              id: "no-cm-found",
              title: "The CM from .env is invalid",
              description: "Are you using the correct environment?",
              status: "error",
              duration: 999999,
              isClosable: true,
            });
          }
          setCandyMachine(candyMachine);
          if (!candyMachine) {
            return;
          }
          let candyGuard;
          try {
            candyGuard = await safeFetchCandyGuard(umi, candyMachine.mintAuthority);
          } catch (e) {
            console.error(e);
            toast({
              id: "no-guard-found",
              title: "No Candy Guard found!",
              description: "Do you have one assigned?",
              status: "error",
              duration: 999999,
              isClosable: true,
            });
          }
          if (!candyGuard) {
            return;
          }
          setCandyGuard(candyGuard);
          if (firstRun) {
            setfirstRun(false)
          }
        }
      })();
    }, [umi, checkEligibility]);
  
    return { candyMachine, candyGuard };
  
  
};

const coba = () => {
    const umi = useUmi();
    const solanaTime = useSolanaTime();
    const toast = useToast();
    const { isOpen: isShowNftOpen, onOpen: onShowNftOpen, onClose: onShowNftClose } = useDisclosure();
    const { isOpen: isInitializerOpen, onOpen: onInitializerOpen, onClose: onInitializerClose } = useDisclosure();
    const [mintsCreated, setMintsCreated] = useState<{ mint: PublicKey, offChainMetadata: JsonMetadata | undefined }[] | undefined>();
    const [isAllowed, setIsAllowed] = useState<boolean>(false);
    const [loading, setLoading] = useState(true);
    const [ownedTokens, setOwnedTokens] = useState<DigitalAssetWithToken[]>();
    const [guards, setGuards] = useState<GuardReturn[]>([
      { label: "startDefault", allowed: false, maxAmount: 0 },
    ]);
    const [firstRun, setFirstRun] = useState(true);
    const [checkEligibility, setCheckEligibility] = useState<boolean>(true);
  
    if (!process.env.NEXT_PUBLIC_CANDY_MACHINE_ID) {
      console.error("No candy machine in .env!")
      if (!toast.isActive('no-cm')) {
        toast({
          id: 'no-cm',
          title: 'No candy machine in .env!',
          description: "Add your candy machine address to the .env file!",
          status: 'error',
          duration: 999999,
          isClosable: true,
        })
      }
    }
    const candyMachineId: PublicKey = useMemo(() => {
      if (process.env.NEXT_PUBLIC_CANDY_MACHINE_ID) {
        return publicKey(process.env.NEXT_PUBLIC_CANDY_MACHINE_ID);
      } else {
        console.error(`NO CANDY MACHINE IN .env FILE DEFINED!`);
        toast({
          id: 'no-cm',
          title: 'No candy machine in .env!',
          description: "Add your candy machine address to the .env file!",
          status: 'error',
          duration: 999999,
          isClosable: true,
        })
        return publicKey("11111111111111111111111111111111");
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const { candyMachine, candyGuard } = useCandyMachine(umi, candyMachineId, checkEligibility, setCheckEligibility, firstRun, setFirstRun);
  
    useEffect(() => {
      const checkEligibilityFunc = async () => {
        if (!candyMachine || !candyGuard || !checkEligibility || isShowNftOpen) {
          return;
        }
        setFirstRun(false);
  
        const { guardReturn, ownedTokens } = await guardChecker(
          umi, candyGuard, candyMachine, solanaTime
        );
  
        setOwnedTokens(ownedTokens);
        setGuards(guardReturn);
        setIsAllowed(false);
  
        let allowed = false;
        for (const guard of guardReturn) {
          if (guard.allowed) {
            allowed = true;
            break;
          }
        }
  
        setIsAllowed(allowed);
        setLoading(false);
      };
  
      checkEligibilityFunc();
      // On purpose: not check for candyMachine, candyGuard, solanaTime
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [umi, checkEligibility, firstRun]);

  return (
    <main className='min-h-screen main-bg overflow-hidden'>
        
        <div className='w-full bg-green py-4 sm:px-20 px-4 flex justify-between'>
            
            <div>
                <Image alt='' src={logo} height={45} />
            </div>

            {umi.identity.publicKey === candyMachine?.authority ? (
              <>
                <Button backgroundColor={"red.200"} onClick={onInitializerOpen}>Initialize Everything!</Button>
                <Modal isOpen={isInitializerOpen} onClose={onInitializerClose}>
                  <ModalOverlay />
                  <ModalContent maxW="600px">
                    <ModalHeader>Initializer</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                      < InitializeModal umi={umi} candyMachine={candyMachine} candyGuard={candyGuard} />
                    </ModalBody>
                  </ModalContent>
                </Modal>
              </>)
              :
              (<></>)
            }

            <div className='grid grid-flow-col gap-4'>
                <div className='flex'>
                    <div className='my-auto'>
                        <Image alt='' className='cursor-pointer' src={xLogo} height={20} />
                    </div>
                </div>
                <div className='flex'>
                    <div className='my-auto'>
                        <Image alt='' className='cursor-pointer' src={telegramLogo} height={20} />
                    </div>
                </div>
                <div>
                    <WalletMultiButtonDynamic />
                </div>

            </div>

        </div>

        <div className='sm:grid sm:grid-cols-2'>

            <div className='flex justify-center pt-3' >
                <div className='bg-cream sm:w-3/4 w-[90%] border-8 rounded-lg border-green p-4 shadow-md shadow-brown'>

                    <div className='p-2'>
                        <div className='border-8 border-green'>
                            <Image className='w-full' src={imageGif} alt='' />
                        </div>
                    </div>

                    {
                        !loading &&
                        <div className='text-center font-bold text-white text-lg'>Available NFTs : {Number(candyMachine?.data.itemsAvailable) - Number(candyMachine?.itemsRedeemed)}/{Number(candyMachine?.data.itemsAvailable)}</div>
                    }
                    <div className=''>
                        {/* <div className="text-center text-white font-semibold">Ending in</div>
                            <div className="text-6xl text-center flex w-full items-center justify-center">
                                <div className="w-20 mx-1 p-2 bg-white text-yellow-500 rounded-lg">
                                    <div className="font-mono leading-none text-base" x-text="days">
                                        00
                                    </div>
                                    <div className="font-mono uppercase text-sm leading-none">Days</div>
                                </div>
                                <div className="w-20 mx-1 p-2 bg-white text-yellow-500 rounded-lg">
                                    <div className="font-mono leading-none text-base" x-text="hours">
                                        00
                                    </div>
                                    <div className="font-mono uppercase text-sm leading-none">Hours</div>
                                </div>
                                <div className="w-20 mx-1 p-2 bg-white text-yellow-500 rounded-lg">
                                    <div className="font-mono leading-none text-base" x-text="minutes">
                                        00
                                    </div>
                                    <div className="font-mono uppercase text-sm leading-none">Minutes</div>
                                </div>
                                <div className="w-20 mx-1 p-2 bg-white text-yellow-500 rounded-lg">
                                    <div className="font-mono leading-none text-base" x-text="seconds">
                                        00
                                    </div>
                                    <div className="font-mono uppercase text-sm leading-none">Seconds</div>
                                </div>
                            </div>
                        <div className='bg-gold text-white text-center p-2 mt-2'>Mint</div> */}
                        <div className='grid px-2'>
                            <MintButtonList
                                guardList={guards}
                                candyMachine={candyMachine}
                                candyGuard={candyGuard}
                                umi={umi}
                                ownedTokens={ownedTokens}
                                setGuardList={setGuards}
                                mintsCreated={mintsCreated}
                                setMintsCreated={setMintsCreated}
                                onOpen={onShowNftOpen}
                                setCheckEligibility={setCheckEligibility}
                            />
                        </div>

                        </div>

                </div>
            </div>

            <div>
                <div className='mt-20 pl-6 pr-6 sm:pl-6 sm:pr-16'>
                    <div className='form-bg p-6'>
                        <div className='flex justify-center'>
                            <Image alt='' src={logoForm} height={120} />
                        </div>
                        <div className='leading-tight font-semibold text-white text-justify'>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. More recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</div>
                    </div>
                </div>
            </div>

        </div>

        <Modal isOpen={isShowNftOpen} onClose={onShowNftClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Your minted NFT:</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <ShowNft nfts={mintsCreated} />
                </ModalBody>
            </ModalContent>
        </Modal>

    </main>
  )
}

export default coba