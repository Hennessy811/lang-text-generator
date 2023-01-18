import { Howl, Howler } from "howler";
import {
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  Divider,
  Flex,
  Heading,
  Skeleton,
  SkeletonText,
  Spacer,
  Tag,
  Text,
  Textarea,
} from "@chakra-ui/react";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { appRouter } from "@/server/api/root";
import { createInnerTRPCContext, createTRPCContext } from "@/server/api/trpc";
import superjson from "superjson";
import { api } from "@/utils/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faLanguage,
  faPlay,
  faRefresh,
  faSave,
  faShare,
  faShareAlt,
  faStop,
  faTypewriter,
} from "@fortawesome/pro-solid-svg-icons";
import { signIn, useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { useCopyToClipboard, useEvent } from "react-use";

const noRefetch = {
  refetchInterval: 0,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
};

const ViewGeneratedText = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) => {
  const router = useRouter();
  const { text_id } = props;
  const session = useSession();
  const utils = api.useContext();
  const [playingVoiceover, setPlayingVoiceover] = useState(false);
  const textSnippet = useRef(null);

  const editTextMutation = api.openai.updateSaved.useMutation({
    onSuccess: () => {
      toast.success("Text updated!");
      void utils.openai.getById.invalidate(text_id);
    },
    onError: () => {
      toast.error("Failed to update text!");
    },
  });
  const simplifyMutation = api.openai.simplify.useMutation({
    onSuccess: () => {
      toast.success("Text simplified!");
      void utils.openai.getById.invalidate(text_id);
    },
    onError: () => {
      toast.error("Failed to simplify text!");
    },
  });

  const [editMode, setEditMode] = useState(false);

  const [sounds, setSounds] = useState<Howl[]>([]);

  const textQuery = api.openai.getById.useQuery(text_id, {
    ...noRefetch,
  });
  const rewriteMutation = api.openai.rewrite.useMutation({
    onSuccess: (data) => {
      void utils.openai.getById.invalidate(text_id);

      toast.success("Text re-written");
      if (data.id !== text_id) {
        void router.push("/view/" + data.id);
      }
    },
    onError: (e) => {
      toast.error("Error re-writing text: " + e.message);
    },
  });

  const [translatedSelection, setTranslatedSelection] = useState("");
  const translateMutation = api.translate.translate.useMutation();
  const voiceoverQuery = api.translate.voiceover.useQuery(
    {
      lang: "en",
      text: textQuery.data?.text ?? "",
    },
    {
      enabled: !!textQuery.data?.text,
      ...noRefetch,
      onSuccess(data) {
        const sounds = data?.map((v) => {
          const dataUrl = `data:audio/mp3;base64,${v.base64}`;

          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
          const sound = new Howl({
            src: dataUrl,
          });
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return sound;
        });
        setSounds(sounds);
      },
    }
  );

  const { keywords, language, prompt, level, topic } = textQuery.data ?? {};

  const handlePlayVoiceover = () => {
    // Create a queue of sounds to play
    // When a sound is done, play the next one
    const queue = [...sounds];

    if (playingVoiceover) {
      Howler.stop();
      queue.forEach((sound) => sound.stop());
      setPlayingVoiceover(false);
      return;
    }

    setPlayingVoiceover(true);

    const playNext = () => {
      const sound = queue.shift();
      if (sound) {
        sound.play();
        sound.once("end", playNext);
      } else {
        // sound?.once("end", () => setPlayingVoiceover(false));
      }
    };
    playNext();
  };

  const [editedText, setEditedText] = useState("");

  useEffect(() => {
    const listener = (e) => {
      const selection = document.getSelection()?.toString();

      if (selection) {
        setTranslatedSelection(selection);
        translateMutation.mutate({
          from: "fr",
          to: "en",
          text: selection,
        });
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    textSnippet.current?.addEventListener("mouseup", listener);
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      textSnippet.current?.removeEventListener("mouseup", listener);
    };
  });

  return (
    <Flex gap={6}>
      {!editMode && (
        <Card flex={3}>
          <CardBody>
            <Flex>
              <Heading>Generated text</Heading>
              <Spacer />
              <Flex mt={4} gap={2}>
                <Tag colorScheme={"blue"}>{topic}</Tag>
                <Tag colorScheme={"green"}>in {language}</Tag>
                <Tag colorScheme={"orange"}>for {level}</Tag>
              </Flex>
            </Flex>

            {keywords && (
              <>
                <Text fontSize="lg" fontWeight="medium">
                  Keywords to use:
                </Text>
                <Text>{keywords}</Text>
              </>
            )}

            <Flex mt={4} gap={4}>
              <Button
                size="sm"
                leftIcon={
                  <FontAwesomeIcon icon={!playingVoiceover ? faPlay : faStop} />
                }
                isLoading={voiceoverQuery.isLoading}
                loadingText="Generating voiceover..."
                onClick={handlePlayVoiceover}
              >
                {playingVoiceover ? "Stop" : `Play voiceover`}
              </Button>
            </Flex>

            <Flex gap={4}>
              <Box flex={1} ref={textSnippet}>
                {textQuery.data?.text.split("\n").map((line, idx) => (
                  <Text my={4} key={`line-${idx}-${line}`}>
                    {line}
                  </Text>
                ))}
              </Box>
            </Flex>
          </CardBody>
          <Divider />
          <CardFooter gap={2}>
            <Button
              colorScheme="teal"
              leftIcon={<FontAwesomeIcon icon={faTypewriter} />}
              isLoading={simplifyMutation.isLoading}
              loadingText="Generating text..."
              onClick={() => {
                if (!session.data?.user) {
                  void signIn();
                  return;
                }
                simplifyMutation.mutate(text_id);
              }}
            >
              Simplify text
            </Button>
            <Button
              colorScheme="teal"
              variant="outline"
              leftIcon={<FontAwesomeIcon icon={faRefresh} />}
              isLoading={rewriteMutation.isLoading}
              onClick={() => {
                if (!session.data?.user) {
                  void signIn();
                  return;
                }
                rewriteMutation.mutate(text_id);
              }}
            >
              Re-write
            </Button>
            {session.data?.user && (
              <Button
                colorScheme="teal"
                variant="outline"
                leftIcon={<FontAwesomeIcon icon={faEdit} />}
                onClick={() => {
                  setEditMode(true);
                  setEditedText(textQuery.data?.text ?? "");
                }}
              >
                Edit text
              </Button>
            )}
            <Spacer />
            <Button
              variant="outline"
              colorScheme="facebook"
              leftIcon={<FontAwesomeIcon icon={faShareAlt} />}
              onClick={() => {
                // copy to clipboard
                void navigator.clipboard.writeText(window.location.href);

                toast.success("Link copied to clipboard");
              }}
            >
              Share
            </Button>
          </CardFooter>
        </Card>
      )}

      {editMode && (
        <Card flex={3}>
          <CardBody>
            <Flex gap={2}>
              <Heading>Edit text</Heading>
              <Spacer />
              <Button
                colorScheme="teal"
                onClick={() => {
                  setEditMode(false);
                  editTextMutation.mutate({
                    id: text_id,

                    text: editedText,
                  });
                }}
                leftIcon={<FontAwesomeIcon icon={faSave} />}
              >
                Save
              </Button>
              <Button
                onClick={() => {
                  setEditMode(false);
                  setEditedText("");
                }}
                leftIcon={<FontAwesomeIcon icon={faSave} />}
              >
                Cancel
              </Button>
            </Flex>

            <Textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              minH={64}
              mt={6}
            />
          </CardBody>
        </Card>
      )}

      <Card flex={1}>
        <CardBody>
          <Text fontSize="lg" fontWeight="bold">
            Selection translation:
          </Text>

          <Text fontSize="sm" mt={6}>
            {translatedSelection}
          </Text>

          <Divider my={4} />

          {translatedSelection && (
            <SkeletonText mt={4} isLoaded={!!translateMutation.data} minH={32}>
              <Text fontSize="sm">{translateMutation.data}</Text>
            </SkeletonText>
          )}
        </CardBody>
      </Card>
    </Flex>
  );
};

export default ViewGeneratedText;

export async function getServerSideProps(
  context: GetServerSidePropsContext<{ text_id: string }>
) {
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: createInnerTRPCContext({ session: null }),
    transformer: superjson,
  });
  const text_id = context.params?.text_id as string;
  /*
   * Prefetching the `post.byId` query here.
   * `prefetch` does not return the result and never throws - if you need that behavior, use `fetch` instead.
   */
  await ssg.openai.getById.prefetch(text_id);
  // Make sure to return { props: { trpcState: ssg.dehydrate() } }
  return {
    props: {
      trpcState: ssg.dehydrate(),
      text_id: text_id,
    },
  };
}
