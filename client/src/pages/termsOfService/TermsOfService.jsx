import { useState } from "react";
import { Nav, Footer } from "../../layout";
import { ScrollToTopButton } from "../../layout";
import { Main } from "./sections";

const TermsOfService = () => {

  const [navIsOpen, setNavOpen] = useState(false);

  const toggleNavMenu = () => {
    setNavOpen(!navIsOpen);
  };

  const scrollTo = (destination) => {
    const section = document.getElementById(destination);
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <Nav
        isOpen={navIsOpen}
        toggleMenu={toggleNavMenu}
        navItems={[]}
        navButtons={[]}
        transition={true}
        darkModeSwitch={true}
      ></Nav>
      <Main
        mainItems={[
          { text: "Agreement to Terms", onClick: () => scrollTo("agreementToTerms") },
          { text: "Privacy Policy", onClick: () => scrollTo("privacyPolicy") },
          { text: "Use Licence", onClick: () => scrollTo("useLicence") },
          { text: "Disclaimer", onClick: () => scrollTo("disclaimer") },
          { text: "Limitations", onClick: () => scrollTo("limitations") },
          { text: "Corrections", onClick: () => scrollTo("corrections") },
          { text: "Links", onClick: () => scrollTo("links") },
          { text: "TOU Modification", onClick: () => scrollTo("touModification") },
          { text: "Applicable Law", onClick: () => scrollTo("applicableLaw") },
          { text: "Contact", onClick: () => scrollTo("contact") }
        ]}
      />
      <Footer/>
      <ScrollToTopButton/>
    </>
  );
};

export default TermsOfService;
