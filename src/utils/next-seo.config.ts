import type { DefaultSeoProps } from "next-seo";

const seo: DefaultSeoProps = {
  title: "TextMastery Tutor",
  description:
    "Empower your language teaching with TextMastery Tutor. Generate engaging reading materials and simplify texts for your students. Improve your students' reading and comprehension skills with TextMastery Tutor",
  titleTemplate: "%s | TextMastery Tutor",
  openGraph: {
    type: "website",
    locale: "en_IE",

    siteName: "TextMastery Tutor",
  },
};

export default seo;
