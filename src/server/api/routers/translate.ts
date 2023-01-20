import * as googleTTS from "google-tts-api"; // ES6 or TypeScript
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";
import axios from "axios";

// const translationClient = new TranslationServiceClient({

// });
export async function translate({ text, to }: { text: string; to: string }) {
  const url = `https://translation.googleapis.com/language/translate/v2?key=${process
    .env.GOOGLE_TRANSLATE_API_KEY!}`;
  const response = await axios.post<{
    data: {
      translations: {
        translatedText: string;
        detectedSourceLanguage: string;
      }[];
    };
  }>(url, {
    target: to,
    format: "text",
    q: text,
  });

  const data = response.data?.data?.translations[0];

  return {
    text: data?.translatedText,
    detectedSourceLanguage: data?.detectedSourceLanguage,
  };
}

export const translateRouter = createTRPCRouter({
  translate: publicProcedure
    .input(
      z.object({
        text: z.string(),
        to: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return translate({ text: input.text, to: input.to });
    }),

  voiceover: publicProcedure
    .input(
      z.object({
        text: z.string(),
        lang: z.string(),
      })
    )
    .query(async ({ input }) => {
      const text = input.text.split(".").filter(i => !!i.trim().length)

      const res = await Promise.all(text.map(i => googleTTS.getAllAudioBase64(i, {
        lang: input.lang,
        slow: true,
      })))
      return res.flat();


      // return googleTTS.getAllAudioBase64(input.text, {
      //   lang: input.lang,
      //   slow: true,
      //   host: "https://translate.google.com",
      //   timeout: 10000,
      //   splitPunct: ",.?",
      // });
    }),
});
