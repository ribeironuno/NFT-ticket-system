import { useState } from "react";

const ScrollToTopButton = () => {
  const [button, setState] = useState(false);

  window.addEventListener("scroll", () => {
    if (window.scrollY > 80) {
      setState(true);
    } else {
      setState(false);
    }
  });

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div>
      {button ? (
        <div className="fixed bottom-6 right-6 flex h-12 w-12 animate-fade-in-down items-center justify-center rounded-full bg-slate-200 shadow-xl transition ease-out md:h-14 md:w-14">
          <button
            onClick={scrollToTop}
            className="flex items-center justify-center transition duration-500 hover:scale-125">
            <img
              className="w-2/3"
              src="https://img.icons8.com/color/48/000000/collapse-arrow.png"
              alt=""
            />
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default ScrollToTopButton;
