import { useState } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { Nav, Footer, ScrollToTopButton } from "../layout";
import jwt_decode from "jwt-decode";

const BackOffice = () => {
  const [navIsOpen, setNavOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const path = "/app/back-office";

  const toggleNavMenu = () => {
    setNavOpen(!navIsOpen);
  };

  let navItem = [
    {
      title: "Critical events",
      onClick: () => navigate(path + "/moderator"),
    },
    {
      title: "Validate organizers",
      onClick: () => navigate(path + "/moderator/validate-organizers"),
    },
  ];

  //check token to set nav bar based on authorization
  let token = localStorage.getItem("token");
  if (token != null) {
    let decodedToken = jwt_decode(token);
    const roleDecoded =
      decodedToken[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
      ];

    if (roleDecoded === "Admin") {
      var tmp = [];
      tmp.push({
        title: "Dashboard",
        onClick: () => navigate(path + "/admin"),
      });
      navItem.map((item) => tmp.push(item));
      navItem = tmp;
      navItem.push({
        title: "Users",
        onClick: () => navigate(path + "/admin/manage-users"),
      });
    }
  }

  return (
    <div>
      {location.pathname !== "/app/back-office/login" ? (
        <Nav
          isOpen={navIsOpen}
          toggleMenu={toggleNavMenu}
          navItems={navItem}
          navButtons={[
            {
              text: "Log out",
              onClick: () => {
                localStorage.removeItem("token");
                navigate(path);
              },
            },
          ]}
          transition={false}
          darkModeSwitch={true}
        />
      ) : null}
      <div
        className={`min-h-[calc(100vh-425px+80px)] bg-gray-50 px-2 pt-10 pb-16 sm:min-h-[calc(100vh-377px+80px)] md:min-h-[calc(100vh-286px+80px)] md:px-5 lg:px-8 ${
          location.pathname !== "/app/back-office/login"
            ? "dark:bg-slate-900"
            : ""
        }`}>
        <Outlet />
      </div>
      <Footer onFaqClick={() => navigate("/app/client/faq")} />
      <ScrollToTopButton></ScrollToTopButton>
    </div>
  );
};

export default BackOffice;
