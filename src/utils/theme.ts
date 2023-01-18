import { extendTheme } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";

const theme = extendTheme({
  config: {},
  styles: {
    global: (props) => ({
      body: {
        bg: mode("#f8fafc", "#1e293b")(props),
      },
    }),
  },
  //   styles: {
  //     global: (props) => ({
  //       body: {
  //         bg: mode(*color for light mode(string)*,*color for dark mode(string)*)(props),
  //       }
  //     })
  //   },
});

export default theme;
