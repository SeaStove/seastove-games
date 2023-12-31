import {
  Center,
  Box,
  Button,
  HStack,
  Heading,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Text,
  Spinner,
  Link,
  Flex,
  AbsoluteCenter,
  Input,
  IconButton,
  useToast,
  Divider,
} from "@chakra-ui/react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ExternalLinkIcon,
  InfoOutlineIcon,
  RepeatIcon,
} from "@chakra-ui/icons";

import { useEffect, useRef, useCallback, Fragment } from "react";
import axios from "axios";
import useDocumentTitle from "../../common/hooks/useDocumentTitle";
import NavBar from "../NavBar";
import { useAppSelector, useAppDispatch } from "app/hooks";
import {
  setYearToGuess,
  setYear,
  setEvents,
  addMiss,
  setGameOver,
  setCorrectDigits,
  setWon,
  MIN_YEAR,
  MAX_YEAR,
  increaseYear,
  decreaseYear,
  Event,
  yearType,
  resetState,
} from "./historySlice";

function EventBox({
  event,
  index,
  endGameStats = false,
  ...rest
}: {
  event: string;
  index: number;
  endGameStats?: boolean;
}) {
  return (
    <Box
      maxW="sm"
      borderWidth="0"
      borderRadius="lg"
      overflow="hidden"
      p={4}
      bg="brand.300"
      color="gray.600"
      fontWeight={600}
      width="100%"
      key={index}
      {...rest}
    >
      {endGameStats ? <Fragment /> : `${index + 1} / 5: `}
      {event}
    </Box>
  );
}

function Endless() {
  useDocumentTitle("Endless History");

  const { onOpen, onClose, isOpen } = useDisclosure();
  const { yearToGuess, year, events, misses, gameOver, correctDigits, won } =
    useAppSelector((state) => state.history);

  const dispatch = useAppDispatch();
  const toast = useToast();

  function onSubmit() {
    if (year) {
      checkDigits();
      if (year === yearToGuess) {
        dispatch(setWon());
        dispatch(setGameOver(true));
      } else {
        dispatch(addMiss(year));
        if (misses.length >= 4) {
          dispatch(setGameOver(true));
        }
      }
    }
  }

  function newGame() {
    dispatch(resetState());
    getRandomYear();
    onClose();
  }

  const getRandomYear = useCallback(async () => {
    const randomYear =
      Math.floor(Math.random() * (MAX_YEAR - MIN_YEAR + 1)) + MIN_YEAR;

    const response = await axios.get(
      `https://api.api-ninjas.com/v1/historicalevents?year=${randomYear}`,
      {
        headers: { "X-Api-Key": import.meta.env.VITE_API_KEY },
      }
    );

    if (response?.data) {
      if (response.data.length > 5) {
        dispatch(setYearToGuess(randomYear.toString()));
        dispatch(setEvents(response.data));
      } else {
        getRandomYear();
      }
    } else {
      console.error("Couldn't retrieve data from API.");
    }
  }, [dispatch]);

  useEffect(() => {
    if (gameOver) {
      onOpen();
    }
  }, [gameOver, onOpen]);

  const gotYearRef = useRef(false);
  useEffect(() => {
    if (gotYearRef.current === false) {
      getRandomYear();
      gotYearRef.current = true;
    }
  }, [getRandomYear]);

  function paddedDigits(num: string) {
    let formattedYear = num;
    const targetLength = 4;
    if (formattedYear.length < targetLength) {
      const padding = new Array(targetLength - formattedYear.length + 1).join(
        "0"
      );
      formattedYear = padding + formattedYear;
    }
    return formattedYear.split("").map(Number);
  }

  const checkDigits = useCallback(() => {
    if (year && yearToGuess) {
      const guessDigits = paddedDigits(year);
      const answerDigits = paddedDigits(yearToGuess);
      const newCorrectDigits = [...correctDigits];

      for (let index = 0; index < 4; index++) {
        if (guessDigits[index] === answerDigits[index]) {
          if (newCorrectDigits[index] === false) {
            newCorrectDigits[index] = true;
            toast.closeAll();
            if (year !== yearToGuess)
              toast({
                title: `${yearType[index]} is correct!`,
                status: "success",
                duration: 1000,
                isClosable: true,
              });
          }
        } else {
          break;
        }
      }
      dispatch(setCorrectDigits(newCorrectDigits));
    }
  }, [correctDigits, dispatch, toast, year, yearToGuess]);

  return (
    <>
      <NavBar />
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg="brand.100" zIndex={3}>
          <ModalHeader color="white">
            <Center>
              <Heading>{won ? "You Won!" : "You Lost!"}</Heading>
            </Center>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack>
              <Heading as="h2" size="lg" color="white">
                The year was {yearToGuess}
              </Heading>
              {events.length > misses.length + 1 ? (
                <Fragment>
                  <Text fontSize={"xl"} color="white">
                    Some other events from that year...
                  </Text>
                  {events
                    .slice(misses.length + 1, events.length)
                    .map((event: Event, index: number) => (
                      <EventBox
                        event={event.event}
                        index={index}
                        key={index}
                        endGameStats
                      />
                    ))}
                </Fragment>
              ) : null}

              <Link
                href={`https://en.wikipedia.org/wiki/AD_${yearToGuess}`}
                textDecoration={"underline"}
                isExternal
                textAlign={"center"}
              >
                To learn more, check out the wikipedia page for {yearToGuess}{" "}
                A.D. <ExternalLinkIcon mx="2px" />
              </Link>
            </VStack>
          </ModalBody>

          <ModalFooter w="100%">
            <Center w="100%">
              <Button
                aria-label="New Game"
                size="lg"
                bg="brand.400"
                color="white"
                ml="1rem"
                rightIcon={<RepeatIcon />}
                onClick={newGame}
                type="submit"
              >
                New Game
              </Button>
            </Center>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Box
        position="relative"
        minH="100vh"
        maxH="100vh"
        h="100%"
        w="100vw"
        bg="brand.100"
        overflowX="hidden"
        p="2rem"
      >
        <Center>
          {events.length > 0 ? (
            <VStack w="500px">
              <Heading
                color="white"
                position={"sticky"}
                bg="brand.100"
                textAlign={"center"}
              >
                Which year did these events happen?
              </Heading>
              <Flex alignItems={"center"} fontSize="2xl">
                {[...Array(4)].map((_, index) => {
                  return correctDigits[index] && yearToGuess
                    ? yearToGuess[index]
                    : "X";
                })}
              </Flex>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  gameOver ? onOpen() : onSubmit();
                }}
              >
                {gameOver ? (
                  <Flex>
                    <Button
                      aria-label="New Game"
                      size="lg"
                      bg="brand.400"
                      color="white"
                      ml="1rem"
                      rightIcon={<RepeatIcon />}
                      onClick={newGame}
                    >
                      New Game
                    </Button>
                    <Button
                      aria-label="View Details"
                      size="lg"
                      bg="brand.400"
                      color="white"
                      ml="1rem"
                      rightIcon={<InfoOutlineIcon />}
                      type="submit"
                    >
                      View Details
                    </Button>
                  </Flex>
                ) : (
                  <Flex>
                    {InputYearPicker()}
                    <Button
                      size="lg"
                      bg="brand.400"
                      color="white"
                      ml="1rem"
                      isDisabled={
                        events.length === 0 ||
                        !year ||
                        misses.indexOf(year) > -1
                      }
                      type="submit"
                    >
                      Guess
                    </Button>
                  </Flex>
                )}
              </form>
              <Divider my="2rem" />
              {events
                .slice(0, Math.min(misses.length + 1, 5))
                .reverse()
                .map((event: Event, index: number) => {
                  const maxIndex = Math.min(misses.length, 4);
                  index = maxIndex - index;

                  return (
                    <Fragment key={index}>
                      <Text key={`${index}-text`}>
                        {yearToGuess &&
                        maxIndex > 0 &&
                        (index !== maxIndex || gameOver)
                          ? `You guessed ${
                              index == maxIndex && won ? year : misses[index]
                            }. ${
                              index == maxIndex && won
                                ? "You won!"
                                : parseInt(misses[index]) >
                                  parseInt(yearToGuess)
                                ? "Too recent."
                                : "Too old."
                            }`
                          : ``}
                      </Text>
                      <EventBox
                        event={event.event}
                        index={index}
                        key={`${index}-event`}
                      />
                    </Fragment>
                  );
                })}
            </VStack>
          ) : (
            <AbsoluteCenter>
              <Spinner color="brand.300" />
            </AbsoluteCenter>
          )}
        </Center>
      </Box>
    </>
  );

  function InputYearPicker() {
    return (
      <HStack>
        <IconButton
          aria-label="Decrease Year"
          onClick={() => dispatch(decreaseYear())}
          icon={<ArrowDownIcon />}
          isDisabled={parseInt(year) <= MIN_YEAR}
        />
        <Input
          size="lg"
          maxLength={4}
          isRequired
          value={year}
          type="number"
          min={MIN_YEAR}
          max={MAX_YEAR}
          htmlSize={4}
          onChange={(event) => {
            if (event.target.value.length <= 4)
              dispatch(setYear(event.target.value));
          }}
          pattern="[0-9]*"
          inputMode="numeric"
          textAlign={"center"}
        />
        <IconButton
          aria-label="Increase Year"
          icon={<ArrowUpIcon />}
          onClick={() => dispatch(increaseYear())}
          isDisabled={parseInt(year) >= MAX_YEAR}
        />
      </HStack>
    );
  }
}

export default Endless;
