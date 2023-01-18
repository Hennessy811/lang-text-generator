import * as googleTTS from "google-tts-api"; // ES6 or TypeScript
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { TranslationServiceClient } from "@google-cloud/translate";
import axios from "axios";

// const translationClient = new TranslationServiceClient({

// });
async function translate({
  from,
  text,
  to,
}: {
  text: string;
  from: string;
  to: string;
}) {
  const url = `https://translation.googleapis.com/language/translate/v2?key=${process
    .env.GOOGLE_TRANSLATE_API_KEY!}`;
  const response = await axios.post<{
    data: { translations: { translatedText: string }[] };
  }>(url, {
    target: to,
    format: "text",
    q: text,
  });

  const data = response.data?.data?.translations[0]?.translatedText;

  return data;
}

export const translateRouter = createTRPCRouter({
  translate: publicProcedure
    .input(
      z.object({
        text: z.string(),
        from: z.string(),
        to: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return translate({ text: input.text, from: input.from, to: input.to });
    }),

  voiceover: publicProcedure
    .input(
      z.object({
        text: z.string(),
        lang: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return googleTTS.getAllAudioBase64(input.text, {
        lang: input.lang,
        slow: false,
        host: "https://translate.google.com",
        timeout: 10000,
        splitPunct: ",.?",
      });
    }),
});
