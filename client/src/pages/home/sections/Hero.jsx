const Hero = () => {
  return (
    <div id="hero" className="w-fit bg-slate-900 px-4 py-16 lg:px-40">
      <div className="flex h-fit w-full flex-col items-center justify-center space-y-7 bg-slate-900 md:flex-row md:space-x-14">
        <div className="flex w-full flex-col items-center justify-center space-y-6 md:w-1/2">
          <h1 className="text-center text-4xl font-bold text-white lg:text-5xl">
            E-ticketing
          </h1>
          <h2 className="text-center text-2xl font-bold text-violet-400 lg:text-3xl">
            Bringing the tickets to the future
          </h2>
          <p className="sm:text-md text-center text-white md:text-lg lg:text-xl">
          We use tickets as Non-Fungible Tokens, in order to use the blockchain's safety and transparency, 
          so as the functionalities of the NFTs. Join us in this journey of taking tickets to the next level.
          </p>
        </div>
        <div className="flex w-full justify-center md:w-1/2">
          <img
            className="h-full w-auto "
            src={require("../../../assets/images/blockchain.webp")}
            alt=""
          />
        </div>
      </div>
    </div>
  );
};

export default Hero;
