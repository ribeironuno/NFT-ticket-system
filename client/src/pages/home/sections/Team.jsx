const Team = () => {
  return (
    <div
      id="team"
      className="mt-16 flex flex-col items-center justify-center space-y-14 bg-slate-900 py-16 md:space-y-20">
      <span className="group text-4xl font-bold text-white transition duration-300 md:text-5xl">
        Our Team
        <span className="mt-5 block h-0.5 max-w-0 bg-indigo-300 transition-all duration-500 group-hover:max-w-full"></span>
      </span>
      <div className="grid grid-flow-col grid-rows-3 items-center justify-center gap-3 md:grid-rows-2 lg:grid-rows-1">
        <div className="border-gray flex h-fit w-32 flex-col items-center justify-center space-y-4 rounded-lg border bg-gray-200 px-3 shadow-lg shadow-black">
          <img
            src="https://img.icons8.com/color/96/null/user.png"
            alt=""
            className="h-20 w-auto"
          />
          <span className="font-medium">Simão Santos</span>
          <a href="/">
            <img
              className="h-8 w-auto transition duration-300 hover:scale-110"
              src="https://img.icons8.com/fluency/48/null/linkedin-circled.png"
              alt=""
            />
          </a>
        </div>
        <div className="border-gray flex h-fit w-32 flex-col items-center justify-center space-y-4 rounded-lg border bg-gray-200 px-3 shadow-lg shadow-black">
          <img
            src="https://img.icons8.com/color/96/null/user.png"
            alt=""
            className="h-20 w-auto"
          />
          <span className="font-medium">Rui Neto</span>
          <a href="/">
            <img
              className="h-8 w-auto transition duration-300 hover:scale-110"
              src="https://img.icons8.com/fluency/48/null/linkedin-circled.png"
              alt=""
            />
          </a>
        </div>
        <div className="border-gray flex h-fit  w-32 flex-col items-center justify-center space-y-4 rounded-lg border bg-gray-200 px-3 shadow-lg shadow-black">
          <img
            src="https://img.icons8.com/color/96/null/user.png"
            alt=""
            className="h-20 w-auto"
          />
          <span className="font-medium">Nuno Ribeiro</span>
          <a href="/">
            <img
              className="h-8 w-auto transition duration-300 hover:scale-110"
              src="https://img.icons8.com/fluency/48/null/linkedin-circled.png"
              alt=""
            />
          </a>
        </div>
        <div className="border-gray flex h-fit w-32 flex-col items-center justify-center space-y-4 rounded-lg border bg-gray-200 px-3  shadow-lg shadow-black">
          <img
            src="https://img.icons8.com/color/96/null/user.png"
            alt=""
            className="h-20 w-auto"
          />
          <span className="font-medium">Josué Freitas</span>
          <a href="/">
            <img
              className="h-8 w-auto transition duration-300 hover:scale-110"
              src="https://img.icons8.com/fluency/48/null/linkedin-circled.png"
              alt=""
            />
          </a>
        </div>
        <div className="border-gray flex h-fit w-32 flex-col items-center justify-center space-y-4 rounded-lg border bg-gray-200 px-3 shadow-lg shadow-black">
          <img
            src="https://img.icons8.com/color/512/person-female.png"
            alt=""
            className="h-20 w-auto"
          />
          <span className="whitespace-nowrap font-medium  ">Lúcia Maduro</span>
          <a href="/">
            <img
              className="h-8 w-auto transition duration-300 hover:scale-110"
              src="https://img.icons8.com/fluency/48/null/linkedin-circled.png"
              alt=""
            />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Team;
