import type { ReactNode } from "react";
import {
  Box,
  Flex,
  Avatar,
  Link,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  useColorModeValue,
  Stack,
  useColorMode,
  Center,
  Text,
  HStack,
  VStack,
  Container,
} from "@chakra-ui/react";
import {
  MoonIcon,
  SunIcon,
  ChevronDownIcon,
  AtSignIcon,
} from "@chakra-ui/icons";
import { signIn, signOut, useSession } from "next-auth/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLanguage, faSignIn, faUser } from "@fortawesome/pro-solid-svg-icons";

export default function Navbar() {
  const { colorMode, toggleColorMode } = useColorMode();
  const session = useSession();

  const user = session.data?.user;
  const username = user?.name ?? user?.email ?? "Default";

  const tutorTextColor = useColorModeValue("gray.600", "gray.400");
  return (
    <>
      <Box
        bg={useColorModeValue("white", "gray.700")}
        px={4}
        py={2}
        shadow="sm"
      >
        <Container maxW="container.xl">
          <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
            <Box>
              <Link href="/">
                <Text fontSize="2xl" fontWeight="bold">
                  TextMastery Tutor
                </Text>
              </Link>
            </Box>

            <Flex alignItems={"center"} gap={4}>
              <Stack direction={"row"} spacing={4}>
                <Button onClick={toggleColorMode}>
                  {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
                </Button>

                {user ? (
                  <Menu>
                    <MenuButton
                      as={Button}
                      rounded={"full"}
                      variant={"link"}
                      cursor={"pointer"}
                      minW={0}
                    >
                      <HStack>
                        <Avatar
                          size={"sm"}
                          src={`https://api.dicebear.com/5.x/croodles/svg?seed=${username}&scale=120`}
                        />
                        <VStack
                          display={{ base: "none", md: "flex" }}
                          alignItems="flex-start"
                          spacing="1px"
                          ml="2"
                        >
                          <Text fontSize="sm">{username}</Text>
                          <Text fontSize="xs" color={tutorTextColor}>
                            Tutor
                          </Text>
                        </VStack>
                        <Box display={{ base: "none", md: "flex" }}>
                          <ChevronDownIcon />
                        </Box>
                      </HStack>
                    </MenuButton>
                    <MenuList alignItems={"center"}>
                      <MenuItem onClick={() => void signOut()}>Logout</MenuItem>
                    </MenuList>
                  </Menu>
                ) : (
                  <Button
                    onClick={() => void signIn()}
                    leftIcon={<FontAwesomeIcon icon={faSignIn} />}
                  >
                    Sign In
                  </Button>
                )}
              </Stack>
            </Flex>
          </Flex>
        </Container>
      </Box>
    </>
  );
}
