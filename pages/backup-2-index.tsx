import React, { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react'
import profile from "@/public/assets/image/profile.png";
import Image from 'next/image';
import MainCard from '@/components/MainCard';
import imageGif from '@/public/assets/image/card-img.gif'
import dynamic from 'next/dynamic';
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

const index = () => {
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

      <div className='py-4 p-[10%]'>
        <div className='flex justify-between'>
          <Image src={profile} width={60} height={60} alt='' />
          {/* <div className='px-6 cursor-pointer'>
            <div className='h-full flex'>
              <div className='my-auto font-semibold btn-wallet'>Select Wallet</div>
            </div>
          </div> */}
          <WalletMultiButtonDynamic />
        </div>
      </div>

      <div className='flex justify-center'>
        <div className='w-[95%] sm:w-[60%]'>
          <MainCard>
            <div className='p-4 w-full flex flex-col'>
              <Image className='mx-auto' src={imageGif} alt='' width={560} height={560} />
              {
                !loading &&
                <div className='w-full'>
                  <div className='my-4 max-w-[20em] rounded-[2em] border mx-auto p-4'>
                    <div className='flex justify-between font-bold'>
                      <div>Available NFTs</div>
                      <div>:</div>
                      <div>{Number(candyMachine?.data.itemsAvailable) - Number(candyMachine?.itemsRedeemed)}/{Number(candyMachine?.data.itemsAvailable)}</div>
                    </div>
                  </div>
                </div>

              }
            </div>

            <div className=''>
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

            <div className='mt-4'>
              <div className='title-main-card'>
                {headerText}
              </div>

              <div className='text-[1.5em] body-main-card'>
                Stonedsloths V2 will be a collection of 5555 NFTs that will be bringing lots more utility to holders and to the project. This collection is an art upgrade from our OG’s and also an upgrade in all aspects. Our Main focus with this collection is to always give back to the holders in many ways including rev shares. The rev shares being from merch sales, secondary market income and also our very own Vape Juice.
              </div>

            </div>
          </MainCard>
        </div>
      </div>

      {umi.identity.publicKey === candyMachine?.authority ? (
        <>
          <Center>
            <Button backgroundColor={"red.200"} marginTop={"10"} onClick={onInitializerOpen}>Initialize Everything!</Button>
          </Center>
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

      <div className='footer-card p-4 mt-5'>

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

export default index