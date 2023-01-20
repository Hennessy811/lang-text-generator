import {
  Flex,
  Stack,
  Heading,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { NextSeo } from "next-seo";
import { useState } from "react";

export default function AuthPage() {
  return (
    <>

      <NextSeo title="Verify Email" />
      <Flex
        minH={"100vh"}
        align={"center"}
        justify={"center"}
        bg={useColorModeValue("gray.50", "gray.800")}
      >
        <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6} w="full">
          <Stack align={"center"}>
            <Heading fontSize={"4xl"}>Check your email</Heading>
            <Text fontSize={"lg"} color={"gray.600"} textAlign="center">
              We sent you a magic link to your email. Click it to sign in.
            </Text>
          </Stack>
        </Stack>
      </Flex>
    </>);
}
