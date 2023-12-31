import { Grid, Center, Heading, Icon, Link, Box } from "@chakra-ui/react";
import { MdHomeFilled } from "react-icons/md";

const NavBar = () => {
  return (
    <Grid
      bg="brand.100"
      p={4}
      alignItems="center"
      justifyContent={"center"}
      templateColumns="4rem 1fr 4rem"
    >
      <Box gridColumn="1">
        <Link href="/" variant="outline">
          <Icon as={MdHomeFilled} h="2rem" w="2rem" />
        </Link>
      </Box>
      <Box gridColumn="2">
        <Center>
          <Heading textDecoration={"underline"}>Endless History</Heading>
        </Center>
      </Box>
      <Box gridColumn="3"></Box>
    </Grid>
  );
};

export default NavBar;
