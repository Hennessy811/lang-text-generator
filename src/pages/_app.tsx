import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { ToastContainer, toast } from "react-toastify";
import { ChakraProvider } from "@chakra-ui/react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
config.autoAddCss = false;

import { api } from "../utils/api";

import "react-toastify/dist/ReactToastify.css";
import "../styles/globals.css";
import AppShell from "../components/AppShell";
import theme from "../utils/theme";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <ChakraProvider theme={theme}>
        <AppShell>
          <Component {...pageProps} />
          <ToastContainer />
        </AppShell>
        {process.env.NODE_ENV === "development" && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </ChakraProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
