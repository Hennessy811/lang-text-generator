import { Container } from "@chakra-ui/react";
import React from "react";
import Navbar from "./Navbar";

const AppShell = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Navbar />

      <Container maxW="container.lg" my={12}>
        {children}
      </Container>
    </>
  );
};

export default AppShell;
