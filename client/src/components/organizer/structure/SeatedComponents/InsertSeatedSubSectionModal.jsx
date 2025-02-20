/* This example requires Tailwind CSS v2.0+ */
import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { PlusCircleIcon, XIcon } from '@heroicons/react/outline'



const InsertSeatedSubSectionModal = ({ setOpen, addSubSectionFunction }) => {

    const [rowName, setRowName] = useState("")
    const [capacity, setCapacity] = useState("")

    function createSeatedSubSection() {
        const newSection = {
            "row": rowName,
            "capacity": capacity,
        }

        if (addSubSectionFunction(newSection)) {
            setRowName("")
            setCapacity(0)
            setOpen(false)
        }
    }

    return (
        <Transition.Root show={true} as={Fragment}>
            <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" onClose={setOpen}>
                <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                    </Transition.Child>

                    {/* This element is to trick the browser into centering the modal contents. */}
                    <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                        &#8203;
                    </span>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        enterTo="opacity-100 translate-y-0 sm:scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                        leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">

                        <div className="inline-block bg-white dark:bg-gray-800 align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                            <div className="hidden sm:block absolute top-0 right-0 pt-4 pr-4 ">
                                <button
                                    type="button"
                                    className="rounded-md text-gray-400 hover:text-gray-500"
                                    onClick={() => setOpen(false)}
                                >
                                    <span className="sr-only">Close</span>
                                    <XIcon className="h-6 w-6" aria-hidden="true" />
                                </button>
                            </div>
                            <div className="sm:flex sm:items-start">
                                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                                    <PlusCircleIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
                                </div>
                                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">

                                    <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-300 mb-8">
                                        Creating a subsection
                                    </Dialog.Title>
                                    <div className="flex justify-center flex-wrap">
                                        {/* Section name */}
                                        <div className="w-full">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Row name</label>
                                            <input
                                                type="text"
                                                value={rowName}
                                                onChange={(e) => { setRowName(e.target.value) }}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white sm:text-sm"
                                            />
                                        </div>

                                        {/* Capacity */}
                                        <div className="w-full pt-6">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Capacity</label>
                                            <input
                                                   type="number"
                                                   value={capacity}
                                                   onChange={(e) => { setCapacity(e.target.value) }}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white sm:text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                            </div>
                            <div className="mt-8 sm:mt-4 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={() => createSeatedSubSection()}>
                                    Create
                                </button>
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm mt-4 sm:mt-0 px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={() => setOpen(false)}>
                                    Cancel
                                </button>
                            </div>
                        </div>

                    </Transition.Child>
                </div>
            </Dialog>
        </Transition.Root>)
}

export default InsertSeatedSubSectionModal
