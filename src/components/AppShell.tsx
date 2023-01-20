import { api } from "@/utils/api";
import { languages } from "@/utils/languages";
import { Box, Container, Flex, Heading, Stack, Tag, Text } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import React from "react";
import Navbar from "./Navbar";

const AppShell = ({ children }: { children: React.ReactNode }) => {
  const session = useSession()

  const savedTexts = api.openai.savedTexts.useQuery(undefined, { enabled: !!session.data?.user?.id })
  return (
    <>
      <Navbar />
      <Container maxW={session.data?.user?.id ? "container.xl" : "container.lg"} my={12}>

        <Flex gap={4}>
          {session?.data?.user && <Box flex={1}>
            <Heading size="md">
              Recent texts:
            </Heading>

            <Stack mt={4} gap={2}>
              {savedTexts.data?.map(i => <Link href={`/view/${i.id}`} key={i.id}>
                <Text noOfLines={2} _hover={{ textDecoration: "underline" }}>{i.title}</Text>
                <Flex gap={2} mt={1}>
                  <Tag colorScheme="green" size="sm">{languages[i.language]}</Tag>
                  <Tag colorScheme="orange" size="sm">{i.level}</Tag>
                </Flex>
              </Link>)}
            </Stack>
          </Box>}
          <Box flex={5}>
            {children}
          </Box>
        </Flex>
      </Container>
    </>
  );
};

export default AppShell;
