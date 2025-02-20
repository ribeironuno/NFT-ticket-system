import { useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { Nav, Footer, ScrollToTopButton } from "../layout";
import { ethers } from "ethers";
import { useEffect } from "react";

const Client = () => {
  const [navIsOpen, setNavOpen] = useState(false);
  const navigate = useNavigate();
  const path = "/app/client";
  const [walletAddress, setWalletAddress] = useState(null);
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  const toggleNavMenu = () => {
    setNavOpen(!navIsOpen);
  };

  useEffect(() => {
    if (walletAddress == null) {
      provider
        .send("eth_requestAccounts", [])
        .then((result) => {
          setWalletAddress(result[0]);
        })
        .catch((err) => {
          setWalletAddress(null);
        });
    }
  }, []);

  return (
    <div>
      <Nav
        isOpen={navIsOpen}
        toggleMenu={toggleNavMenu}
        navItems={
          walletAddress != null
            ? [
                { title: "Events", onClick: () => navigate(path) },
                {
                  title: "Your tickets",
                  onClick: () => {
                    navigate(path + "/purchased-tickets");
                  },
                },
                { title: "Refunds", onClick: () => navigate(path + "/refunds") },
              ]
            : [{ title: "Events", onClick: () => navigate("path") }]
        }
        navButtons={
          walletAddress != null
            ? [
                {
                  text:
                    walletAddress.substring(0, 4) +
                    "..." +
                    walletAddress.substring(
                      walletAddress.length - 4,
                      walletAddress.length
                    ),
                  onClick: () => {
                    setWalletAddress(null);
                  },
                },
              ]
            : [
                {
                  text: "Connect Wallet",
                  onClick: () => {
                    provider
                      .send("eth_requestAccounts", [])
                      .then((result) => {
                        setWalletAddress(result[0]);
                      })
                      .catch((err) => {
                        setWalletAddress(null);
                      });
                  },
                },
              ]
        }
        transition={false}
        darkModeSwitch={true}
        onIconClick={() => navigate(path)}
      />
      <div className="min-h-[calc(100vh-425px)] bg-gray-50 px-2 pt-10 pb-16 dark:bg-slate-900 sm:min-h-[calc(100vh-377px)] md:min-h-[calc(100vh-286px)] md:px-5 lg:px-8">
        <Outlet />
      </div>
      <Footer onFaqClick={() => navigate("/app/client/faq")} />
      <ScrollToTopButton></ScrollToTopButton>
    </div>
  );
};

export default Client;
