const Project = () => {
  return (
    <div
      id="project"
      className="my-16 flex flex-col items-center justify-center space-y-14 md:space-y-20">
      <span className="group text-center text-4xl font-bold text-gray-700 transition duration-300 md:text-5xl">
        About the Project
        <span className="mt-5 block h-0.5 max-w-0 bg-indigo-300 transition-all duration-500 group-hover:max-w-full"></span>
      </span>
      <div className="grid grid-flow-col grid-rows-4 items-center justify-center gap-6 md:grid-rows-2">
        <div className="flex h-fit w-full flex-col items-center justify-center space-y-8 rounded-lg border bg-gray-100 p-2 shadow-lg md:w-[450px] md:p-5">
          <img
            src="https://img.icons8.com/color/96/000000/gear.png"
            alt=""
            className="h-16 animate-spin"
          />
          <span className="text-center font-sans text-base text-black md:text-lg">
            This project's main goal is to take the ticketing system to the next level,
            the new era of web3. For that, we use tickets as NFTs to allow the users to
            have the most secure and shareable experiences in events.
          </span>
        </div>
        <div className="flex h-fit w-full flex-col items-center justify-center space-y-8 rounded-lg border bg-gray-100 p-2 shadow-lg md:w-[450px] md:p-5">
          <svg height="64px" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <g fill="none">
              <circle fill="#6F41D8" cx="16" cy="16" r="16" />
              <path
                d="M21.092 12.693c-.369-.215-.848-.215-1.254 0l-2.879 1.654-1.955 1.078-2.879 1.653c-.369.216-.848.216-1.254 0l-2.288-1.294c-.369-.215-.627-.61-.627-1.042V12.19c0-.431.221-.826.627-1.042l2.25-1.258c.37-.216.85-.216 1.256 0l2.25 1.258c.37.216.628.611.628 1.042v1.654l1.955-1.115v-1.653a1.16 1.16 0 00-.627-1.042l-4.17-2.372c-.369-.216-.848-.216-1.254 0l-4.244 2.372A1.16 1.16 0 006 11.076v4.78c0 .432.221.827.627 1.043l4.244 2.372c.369.215.849.215 1.254 0l2.879-1.618 1.955-1.114 2.879-1.617c.369-.216.848-.216 1.254 0l2.251 1.258c.37.215.627.61.627 1.042v2.552c0 .431-.22.826-.627 1.042l-2.25 1.294c-.37.216-.85.216-1.255 0l-2.251-1.258c-.37-.216-.628-.611-.628-1.042v-1.654l-1.955 1.115v1.653c0 .431.221.827.627 1.042l4.244 2.372c.369.216.848.216 1.254 0l4.244-2.372c.369-.215.627-.61.627-1.042v-4.78a1.16 1.16 0 00-.627-1.042l-4.28-2.409z"
                fill="#FFF"
              />
            </g>
          </svg>
          <span className="text-center font-sans text-base text-black md:text-lg">
            We use the Polygon Smart Chain because it's an EVM-compatible blockchain
            and we work with smart contracts. The Ethereum network was the
            first smart contracts' deployer and it still regarded as the standard among
            competing blockchains.
          </span>
        </div>
        <div className="flex h-fit w-full flex-col items-center justify-center space-y-8 rounded-lg border bg-gray-100 p-2 shadow-lg md:w-[450px] md:p-5">
          <img
            className=" h-16"
            src="https://img.icons8.com/nolan/64/ticket.png"
            alt=""
          />
          <span className="text-center font-sans text-base text-black md:text-lg">
            Tickets act as an exclusive passport for users by reimagining what
            it means to be part of a community. In this project, Web3 empowers
            ticket issuers to deliver engaging experiences and increase revenue,
            all the while driving loyalty.
          </span>
        </div>
        <div className="flex h-fit w-full flex-col  items-center justify-center space-y-8 rounded-lg border bg-gray-100 p-2 shadow-lg md:w-[450px] md:p-5">
          <img
            className="h-16 "
            src="https://img.icons8.com/external-nawicon-outline-color-nawicon/64/null/external-handshake-business-nawicon-outline-color-nawicon.png"
            alt=""
          />
          <span className="text-center font-sans text-base text-black md:text-lg">
            But not forgetting the users who are also the main key of this whole project.
            As an Organizer, you can create your own events.
            As a client, you can buy multiple tickets for multiple events with an always
            guaranteed security.
          </span>
        </div>
      </div>
    </div>
  );
};

export default Project;
