import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

import { api } from "../utils/api";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Center,
  Container,
  Divider,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  Select,
  Tag,
  Text,
  Tooltip,
  useColorModeValue,
  Wrap,
} from "@chakra-ui/react";
import { useState } from "react";
import { faMagicWandSparkles } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

const templates = [
  {
    name: "Travel for beginners",
    description: "A simple text about travel for beginners",
    topic: "Travel",
    level: "Beginner",
    language: "English",
    length: "Short",
    keywords: "raining cats and dogs, watermelon, pumped-up",
  },
  {
    name: "French movie review",
    description: "A movie review in French",
    topic: "Movie review",
    level: "Intermediate",
    language: "French",
    length: "Medium",
    keywords: "",
  },
  {
    name: "Portuguese cooking",
    description: "A simple text about cooking in Portuguese",
    topic: "Cooking",
    level: "Intermediate",
    language: "Portuguese",
    length: "Long",
    keywords: "",
  },
];

const Home: NextPage = () => {
  const router = useRouter();
  const generate = api.openai.generate.useMutation({
    onSuccess: (data) => {
      toast.success("Text generated successfully!");
      setTimeout(() => {
        void router.push(`/view/${data.id}`);
      }, 1000);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const [topic, setTopic] = useState("Travel");
  const [language, setLanguage] = useState("English");
  const [level, setLevel] = useState("beginner");
  const [paragraphs, setParagraphs] = useState("3");
  const [keywords, setKeywords] = useState(
    "raining cats and dogs, watermelon, pumped-up"
  );

  return (
    <>
      <Head>
        <title>TextMastery Tutor</title>
        <meta
          name="description"
          content="Empower your language teaching with TextMastery Tutor. Generate engaging reading materials and simplify texts for your students. Improve your students' reading and comprehension skills with TextMastery Tutor"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <HomeIntro />

      <Divider my={8} />

      <Card>
        <CardHeader>
          <Heading size="lg">Get started</Heading>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-3 gap-x-2 gap-y-4 px-4">
            <FormControl isRequired>
              <FormLabel>Topic</FormLabel>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                type="text"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Language</FormLabel>
              <Input
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                type="text"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Level</FormLabel>
              <Select value={level} onChange={(e) => setLevel(e.target.value)}>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel># of paragraphs</FormLabel>
              <Input
                placeholder="optional"
                value={paragraphs}
                onChange={(e) => setParagraphs(e.target.value)}
                type="number"
                min={1}
              />
              {/* <FormHelperText>
                1 paragraph ~ 100 words, 3 paragraphs ~ 300 words
              </FormHelperText> */}
            </FormControl>
            <FormControl className="col-span-2">
              <FormLabel>Keywords to include</FormLabel>
              <Input
                placeholder="optional"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                type="text"
              />
            </FormControl>
          </div>
          <Center mt={8}>
            <Tooltip
              label="👈 Start here!"
              placement="right"
              isOpen
              hasArrow
              fontSize="md"
            >
              <Button
                size="lg"
                w="fit-content"
                leftIcon={<FontAwesomeIcon icon={faMagicWandSparkles} />}
                colorScheme="teal"
                isLoading={generate.isLoading}
                loadingText="Doing magic..."
                onClick={() => {
                  generate.mutate({
                    topic,
                    language,
                    level,
                    length: paragraphs,
                    keywords,
                  });
                }}
              >
                Generate
              </Button>
            </Tooltip>
          </Center>

          <Flex mt={4} align="center" gap={4}>
            <Divider />
            <Text
              mb={4}
              whiteSpace="nowrap"
              textAlign="center"
              mt={4}
              fontWeight="medium"
            >
              or use one of our templates:
            </Text>
            <Divider />
          </Flex>
          <div className="grid grid-cols-3 grid-rows-1 gap-4">
            {templates.map((template) => (
              <TemplateCard
                key={template.name}
                template={template}
                onClick={() => {
                  setTopic(template.topic);
                  setLanguage(template.language);
                  setLevel(template.level);
                  setParagraphs(template.length === "Short" ? "1" : "3");
                  setKeywords(template.keywords);
                }}
              />
            ))}
          </div>
        </CardBody>
      </Card>
    </>
  );
};

export default Home;

const TemplateCard = ({
  template,
  onClick,
}: {
  template: (typeof templates)[0];
  onClick: () => void;
}) => {
  return (
    <Card
      onClick={onClick}
      bg={useColorModeValue("#f9fafb", "#374151")}
      transition="all 0.2s"
      _hover={{ shadow: "md" }}
      cursor="pointer"
    >
      <CardBody>
        <Heading size="md">{template.name}</Heading>
        <Text mt={2} color="slategray" fontSize="sm">
          {template.description}
        </Text>

        <Wrap mt={2} fontSize="sm">
          <Tag colorScheme={"blue"}>{template.topic}</Tag>
          <Tag mt={2} colorScheme={"green"}>
            in {template.language}
          </Tag>
          <Tag colorScheme={"orange"}>for {template.level}</Tag>
          <Tag colorScheme={"teal"}>{template.length}</Tag>
        </Wrap>
      </CardBody>
    </Card>
  );
};

const HomeIntro = () => {
  return (
    <>
      <Heading>Welcome to TextMastery Tutor</Heading>
      <Text color="slategray" mt={4}>
        Empower your language teaching with TextMastery Tutor. Generate engaging
        reading materials and simplify texts for your students. Improve your
        students&apos; reading and comprehension skills with TextMastery Tutor
      </Text>
      <div className="mt-6 grid grid-cols-3 grid-rows-1 gap-4">
        <Card>
          <CardBody>
            <Heading size="md">Step 1</Heading>
            <Text mt={2}>
              Set the
              <span className="font-bold"> topic</span>,{" "}
              <span className="font-bold">length</span> and{" "}
              <span className="font-bold">level</span> of the text you want to
              practice.
            </Text>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Heading size="md">Step 2</Heading>
            <Text mt={2}>
              Ask to simplify the text by clicking the{" "}
              <span className="font-bold">Simplify</span> button.
            </Text>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Heading size="md">Step 3</Heading>
            <Text mt={2}>
              Sign In to save your progress and get personalized
              recommendations.
            </Text>
          </CardBody>
        </Card>
      </div>
    </>
  );
};
