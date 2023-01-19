import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  Checkbox,
  Stack,
  Link,
  Button,
  Heading,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  return (
    <Flex
      minH={"100vh"}
      align={"center"}
      justify={"center"}
      bg={useColorModeValue("gray.50", "gray.800")}
    >
      <Stack spacing={8} mx={"auto"} maxW={"md"} py={12} px={6} w="full">
        <Stack align={"center"}>
          <Heading fontSize={"4xl"}>Check your email</Heading>
          <Text fontSize={"lg"} color={"gray.600"} textAlign="center">
            We sent you a magic link to your email. Click it to sign in.
          </Text>
        </Stack>
      </Stack>
    </Flex>
  );
}
