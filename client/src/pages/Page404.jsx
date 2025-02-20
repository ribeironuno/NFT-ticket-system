export default function Page404() {
  return (
    <div className="absolute top-0 left-0 z-10 w-full">
      <section className="flex h-screen items-center bg-slate-900 p-16 dark:bg-gray-900 dark:text-gray-100">
        <div className="container mx-auto my-8 flex flex-col items-center justify-center px-5">
          <div className="max-w-md text-center">
            <h2 className="mb-8 text-9xl font-extrabold text-violet-400 dark:text-gray-600">
              <span className="sr-only">Error</span>404
            </h2>
            <p className="text-2xl font-semibold text-white md:text-3xl">
              Oops! Page not found.
            </p>
            <p className="mt-4 mb-8 text-white dark:text-gray-400">
              We are sorry, but the page you requested was not found.
            </p>
            <a href="/">
              <button
                type="button"
                className="transtion m-auto flex rounded-md bg-violet-800 p-2 text-xs duration-500 ease-in-out focus:outline-none focus:ring-1 focus:ring-white hover:scale-[1.02] hover:bg-violet-700 hover:shadow-md hover:shadow-violet-400 md:text-sm "
                id="user-menu-button"
                aria-expanded="false"
                aria-haspopup="true">
                <span className="font-bold text-white">Home Page</span>
              </button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
