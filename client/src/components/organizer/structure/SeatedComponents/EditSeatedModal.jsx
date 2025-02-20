/* This example requires Tailwind CSS v2.0+ */
import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { PencilIcon, XIcon } from '@heroicons/react/outline'

const EditSeatedModal = ({ setOpen, editSectionFunction, sectionInfo }) => {
    const [sectionName, setSectionName] = useState(sectionInfo.name || '')
    const [nameDoor, setDoorName] = useState(sectionInfo.door || '')

    function editSeatedSection() {
        if (editSectionFunction(sectionName, nameDoor, true, sectionInfo.name)) {
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
                                    className="bg-white dark:bg-gray-800 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none  focus:ring-offset-2 focus:ring-indigo-500"
                                    onClick={() => setOpen(false)}
                                >
                                    <span className="sr-only">Close</span>
                                    <XIcon className="h-6 w-6" aria-hidden="true" />
                                </button>
                            </div>
                            <div className="sm:flex sm:items-start">
                                <div className='w-full flex justify-start flex-wrap'>
                                    <div className="mx-auto flex-shrink-0 mb-6 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <PencilIcon className="h-6 w-6 text-yellow-600" aria-hidden="true" />
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full md:w-fit align-middle b">
                                        <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-300 mb-8">
                                            Editing a seated section
                                        </Dialog.Title>
                                    </div>

                                    <div className='w-full'>
                                        <div className="flex justify-center flex-wrap w-full ">
                                            {/* Section name */}
                                            <div className="w-full">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Section name</label>
                                                <input
                                                    type="text"
                                                    value={sectionName}
                                                    onChange={(e) => { setSectionName(e.target.value) }}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white sm:text-sm"
                                                />
                                            </div>

                                            {/* Door name */}
                                            <div className="w-full pt-6">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Door name</label>
                                                <input
                                                      type="text"
                                                      value={nameDoor}
                                                      onChange={(e) => { setDoorName(e.target.value) }}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white sm:text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                            <div className="mt-8 sm:mt-4 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-yellow-600 text-base 
                                    font-medium text-white hover:bg-yellow-700 focus:outline-none  focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={editSeatedSection}>
                                    Edit
                                </button>
                                <button
                                    type="button"
                                    className="mt-6 sm:mt-0 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base 
                                    font-medium text-white hover:bg-red-700 focus:outline-none  focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={() => setOpen(false)}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition.Root>
    )
}

export default EditSeatedModal