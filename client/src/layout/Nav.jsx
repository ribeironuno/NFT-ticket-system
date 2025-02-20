import Switcher from "./Switcher";

const Nav = ({
  isOpen,
  toggleMenu,
  navItems,
  navButtons,
  transition,
  darkModeSwitch,
  onIconClick,
}) => {
  return (
    <nav
      id="navbar"
      className={`sticky top-0 z-10 bg-slate-900 ${
        isOpen ? "drop-shadow-2xl" : ""
      }`}>
      {/* DESKTOP */}

      <div
        className={` ${
          transition ? "animate-fade-in-down" : ""
        } px-2 md:px-5 lg:px-8`}>
        <div className="relative flex h-20 items-center justify-between">
          {/* MOBILE MENU BUTTON */}

          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-slate-700"
              aria-controls="mobile-menu"
              aria-expanded="false"
              onClick={toggleMenu}>
              <span className="sr-only">Open main menu</span>

              {!isOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  aria-hidden="true">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* NAVBAR BUTTONS */}

          <div className="ml-12 flex flex-1 items-center justify-start sm:ml-0 sm:items-stretch">
            <div
              onClick={() => onIconClick()}
              className="flex flex-shrink-0 items-center hover:cursor-pointer">
              <img
                className="block h-10 w-auto lg:hidden"
                src={require("../assets/images/logo.png")}
                alt="Your Company"
              />
              <img
                className="hidden h-10 w-auto lg:block"
                src={require("../assets/images/logo.png")}
                alt="Your Company"
              />
            </div>
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex h-full items-center space-x-4">
                {navItems.map((navItem, key) => (
                  <button
                    onClick={navItem.onClick}
                    className="transtition rounded-md px-3 py-2 text-sm font-medium text-white duration-500 ease-linear hover:bg-slate-700"
                    aria-current="page"
                    key={key}>
                    {navItem.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-row items-center justify-center space-x-3 align-middle">
            {darkModeSwitch ? <Switcher /> : null}
            {navButtons.map((button, key) => (
              <button
                onClick={button.onClick}
                type="button"
                className="transtion flex rounded-md bg-violet-800 p-2 text-xs duration-500 ease-in-out focus:outline-none focus:ring-1 focus:ring-white hover:scale-[1.02] hover:bg-violet-700 hover:shadow-md hover:shadow-violet-400 md:text-sm "
                id="user-menu-button"
                aria-expanded="false"
                aria-haspopup="true"
                key={key}>
                <span className="font-bold text-white">{button.text}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MOBILE */}

      <div
        className={`absolute top-0 left-0 -z-10 h-fit w-full bg-slate-900 px-3 pt-[100px] pb-10 text-white duration-500 ease-in-out ${
          isOpen ? "translate-y-0 " : "-translate-y-full"
        }`}>
        {isOpen ? (
          <div className="flex animate-fade-in-down flex-col justify-center space-y-2">
            {navItems.map((navItem) => (
              <button
                onClick={() => {
                  navItem.onClick();
                  toggleMenu();
                }}
                className="rounded-lg p-2 text-start transition duration-200 ease-linear hover:bg-slate-700 md:text-center">
                {navItem.title}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </nav>
  );
};

export default Nav;
