/* This example requires Tailwind CSS v2.0+ */
import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { PlusCircleIcon, XIcon } from "@heroicons/react/outline";

const CreateUserBackOfficeModal = ({ setOpen, createUser }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [typeAccount, setTypeAccount] = useState("Moderator");

  function prepareCreateUser() {
    if (createUser(name, email, password, typeAccount)) {
      setOpen(false);
    }
  }

  return (
    <Transition.Root show={true} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={setOpen}>
        <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block transform overflow-hidden rounded-lg bg-white bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all dark:bg-gray-800 sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
              <div className="absolute top-0 right-0 hidden pt-4 pr-4 sm:block ">
                <button
                  type="button"
                  className="rounded-md bg-white text-gray-400 focus:outline-none focus:ring-indigo-500 focus:ring-offset-2 hover:text-gray-500 dark:bg-gray-800"
                  onClick={() => setOpen(false)}
                >
                  <span className="sr-only">Close</span>
                  <XIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                  <PlusCircleIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
                </div>
                <div className="mt-3 w-full text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <Dialog.Title as="h3" className="mb-8 text-lg font-medium leading-6 text-gray-900 dark:text-gray-300">
                    Create a new backoffice user
                  </Dialog.Title>

                  <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white sm:text-sm"
                    />
                    <label className="mt-3 block text-sm font-medium text-gray-700 dark:text-gray-200">Email</label>
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white sm:text-sm"
                    />
                    <label className="mt-3 block text-sm font-medium text-gray-700 dark:text-gray-200">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white sm:text-sm"
                    />
                    <label className="mt-3 block text-sm font-medium text-gray-700 dark:text-gray-200">Role</label>
                    <select
                      name="typeAccount"
                      value={typeAccount}
                      onChange={(e) => {
                        setTypeAccount(e.target.value);
                        console.log(typeAccount);
                      }}
                      className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:bg-gray-600 dark:text-white sm:text-sm"
                    >
                      <option value="Moderator" defaultValue>Moderator</option>
                      <option value="Admin">Administrator</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="mt-8 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="mb-6 inline-flex w-full justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 hover:bg-green-700 sm:mb-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => prepareCreateUser()}
                >
                  Create
                </button>
                <button
                  type="button"
                  className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default CreateUserBackOfficeModal;
