import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Hero, Project, Team } from "./sections";
import { Nav,Footer } from "../../layout";
import { ScrollToTopButton } from "../../layout";

const Home = () => {
  const [navIsOpen, setNavOpen] = useState(false);
  const navigate = useNavigate();

  const toggleNavMenu = () => {
    setNavOpen(!navIsOpen);
  };

  const scrollTo = (destination) => {
    const section = document.querySelector("#" + destination);
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  window.addEventListener("scroll", () => {
    const navbar = document.querySelector("#navbar");

    if (window.scrollY >= 80) {
      navbar.classList.add("drop-shadow-2xl");
    } else {
      navbar.classList.remove("drop-shadow-2xl");
    }
  });

  return (
    <>
      <Nav
        isOpen={navIsOpen}
        toggleMenu={toggleNavMenu}
        navItems={[
          { title: "Home", onClick: () => scrollTo("hero") },
          { title: "About the Project", onClick: () => scrollTo("project") },
          { title: "Our team", onClick: () => scrollTo("team") },
        ]}
        navButtons={[
          { text: "Launch App", onClick: () => navigate("/app/client") },
          {
            text: "Organizer",
            onClick: () => navigate("/app/organizer/login"),
          },
          {
            text: "BackOffice",
            onClick: () => navigate("/app/back-office/login"),
          }
        ]}
        transition={true}
        darkModeSwitch={false}
      ></Nav>
      <Hero></Hero>
      <Project></Project>
      <Team></Team>
      <Footer onFaqClick={() => navigate("/app/client/faq")} />
      <ScrollToTopButton></ScrollToTopButton>
    </>
  );
};
export default Home;
