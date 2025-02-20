import { useState } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { Footer, Nav, ScrollToTopButton } from "../layout";

const Validator = () => {
  const [navIsOpen, setNavOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const path = "/app/validator";

  const toggleNavMenu = () => {
    setNavOpen(!navIsOpen);
  };

  return (
    <div>
      {location.pathname !== "/app/validator/login" ? (
        <Nav
          isOpen={navIsOpen}
          toggleMenu={toggleNavMenu}
          navItems={[{ title: "Events", onClick: () => navigate(path) }]}
          navButtons={[
            {
              text: "Log out",
              onClick: () => {
                localStorage.removeItem("token");
                navigate(path + "/login");
              },
            },
          ]}
          transition={false}
          darkModeSwitch={true}
          onIconClick={() => navigate(path)}
        />
      ) : null}
      <div
        className={`min-h-[calc(100vh-425px)] bg-gray-50 px-2 pt-10 pb-16 sm:min-h-[calc(100vh-377px)] md:min-h-[calc(100vh-286px)] md:px-5 lg:px-8 ${
          location.pathname !== "/app/validator/login" ? "dark:bg-slate-900" : ""
        }`}
      >
        <Outlet />
      </div>
      <Footer onFaqClick={() => navigate("/app/validator/faq")} />
      <ScrollToTopButton></ScrollToTopButton>
    </div>
  );
};

export default Validator;
