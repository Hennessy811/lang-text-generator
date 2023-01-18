import { openai } from "@/utils/openai";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

export const openaiRouter = createTRPCRouter({
  generate: publicProcedure
    .input(
      z.object({
        topic: z.string(),
        language: z.string(),
        level: z.string(),
        length: z.string().default("1"),
        keywords: z.string().optional().default(""),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { topic, language, level, length, keywords } = input;
      const user = ctx.session?.user;

      /**
       * I'm a language tutor. Give me a 1-paragraph text about travel topic in English language. Write it so beginner level student can understand it on their own
       * Also, include the following keywords and phrases: raining cats and dogs, watermelon, pumped-up
       */

      const prompt = `I'm a language tutor. Give me a ${length}-paragraph text about ${topic} topic in ${language} language. Write it so ${level} level student can understand it on their own
${
  !!keywords.trim().length
    ? `Also, include the following keywords and phrases: ${keywords}`
    : ""
}`;
      const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: prompt,
        temperature: 0.7,
        max_tokens: 256,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });

      const text = response.data.choices[0]?.text;
      if (!text)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "No response from OpenAI",
        });

      const saved = await ctx.prisma.generatedText.create({
        data: {
          text,
          ...(!!user?.id && { userId: user.id }),
          keywords,
          language,
          level,
          topic,
          prompt,
        },
      });

      return saved;
    }),

  getById: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const text = await ctx.prisma.generatedText.findUnique({
      where: { id: input },
      include: { user: true },
    });
    return text;
  }),

  rewrite: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      let text = await ctx.prisma.generatedText.findUnique({
        where: { id: input },
        include: { user: true },
      });

      if (!text) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Text not found",
        });
      }

      /**
       * If the text is not owned by any user, clone it and create a new one
       */
      if (!text.user) {
        text = await ctx.prisma.generatedText.create({
          data: {
            text: text.text,
            ...(!!ctx.session?.user?.id && { userId: ctx.session?.user?.id }),
            keywords: text.keywords,
            language: text.language,
            level: text.level,
            topic: text.topic,
            prompt: text.prompt,
          },
          include: { user: true },
        });
      }

      if (text.user?.id !== ctx.session?.user?.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only rewrite your own texts",
        });
      }

      const prompt = `${text.prompt}`;

      const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: prompt,
        temperature: 0.7,
        max_tokens: 256,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });
      const newText = response.data.choices[0]?.text;

      if (!newText) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "No response from OpenAI",
        });
      }

      const saved = await ctx.prisma.generatedText.update({
        where: { id: text.id },
        data: {
          text: newText,
        },
      });

      return saved;
    }),

  simplify: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      let text = await ctx.prisma.generatedText.findUnique({
        where: { id: input },
        include: { user: true },
      });

      if (!text) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Text not found",
        });
      }

      /**
       * If the text is not owned by any user, clone it and create a new one
       */
      if (!text.user) {
        text = await ctx.prisma.generatedText.create({
          data: {
            text: text.text,
            ...(!!ctx.session?.user?.id && { userId: ctx.session?.user?.id }),
            keywords: text.keywords,
            language: text.language,
            level: text.level,
            topic: text.topic,
            prompt: text.prompt,
          },
          include: { user: true },
        });
      }

      if (text.user?.id !== ctx.session?.user?.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only simplify your own texts",
        });
      }

      const prompt = `Rewrite the following text, so 5-years old can understand easily:
${text.prompt}`;

      const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: prompt,
        temperature: 0.7,
        max_tokens: 256,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });
      const newText = response.data.choices[0]?.text;

      if (!newText) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "No response from OpenAI",
        });
      }

      const saved = await ctx.prisma.generatedText.update({
        where: { id: text.id },
        data: {
          text: newText,
        },
      });

      return saved;
    }),

  updateSaved: protectedProcedure
    .input(
      z.object({
        text: z.string(),
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { text, id } = input;

      const exists = await ctx.prisma.generatedText.findUnique({
        where: { id },
      });

      if (!exists)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Text not found",
        });
      if (ctx.session.user.id !== exists.userId)
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only update your own texts",
        });

      const updated = await ctx.prisma.generatedText.update({
        where: { id },
        data: {
          text,
        },
      });
      return updated;
    }),
});
