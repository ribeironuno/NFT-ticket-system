import AgreementToTerms from "./AgreementToTerms";
import PrivacyPolicy from "./PrivacyPolicy";
import UseLicence from "./UseLicence";
import Disclaimer from "./Disclaimer";
import Limitations from "./Limitations";
import Corrections from "./Corrections";
import Links from "./Links";
import TouModification from "./TouModification";
import ApplicableLaw from "./ApplicableLaw";
import Contact from "./Contact";
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/solid'
import React, { Fragment } from 'react';


/* DORPDOWN FUNCTION */
function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

const Main = ({ mainItems }) => {

    return (
        <>
            <div id="main" className="p-5 sm:p-10 dark:bg-slate-900">

                <div className="lg:hidden flex flex-row justify-end w-full animate-fade-in-down space-x-5">

                    <Menu as="div" className="relative inline-block text-left duration-300 ease-in-out hover:scale-[1.05]">
                        <div className="mb-5">
                            <Menu.Button className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-gray-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-500">
                                Sections
                                <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
                            </Menu.Button>
                        </div>

                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                        >
                            <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md hover:cursor-pointer bg-gray-700 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                <div className="py-1">
                                    {mainItems.map((mainItem, key) => (
                                        <Menu.Item>
                                            {({ active }) => (
                                                <p
                                                    className={classNames(
                                                        active ? 'bg-gray-100 text-gray-900' : 'text-white',
                                                        'block px-4 py-2 text-sm'
                                                    )}
                                                    onClick={mainItem.onClick}
                                                >
                                                    {mainItem.text}
                                                </p>
                                            )}
                                        </Menu.Item>
                                    ))}
                                </div>
                            </Menu.Items>
                        </Transition>
                    </Menu>
                </div>

                <aside id="aside" className="hidden lg:block w-56" aria-label="Sidebar">
                    <div className="overflow-y-auto py-4 px-3 dark:bg-slate-700 rounded bg-slate-900">
                        <ul className="space-y-2">
                            {mainItems.map((mainItem, key) => (
                                <button
                                    key={key}
                                    onClick={
                                        mainItem.onClick
                                    }
                                    aria-current="page" className="w-full flex items-center p-2 text-base font-bold rounded-lg text-white dark:hover:bg-slate-900 hover:bg-gray-700">
                                    <span className="ml-3">{mainItem.text}</span>
                                </button>
                            ))}
                        </ul>
                    </div>
                </aside>

                <div className="lg:pl-[270px] space-y-5 sm:space-y-0">
                    <AgreementToTerms />
                    <PrivacyPolicy />
                    <UseLicence />
                    <Disclaimer />
                    <Limitations />
                    <Corrections />
                    <Links />
                    <TouModification />
                    <ApplicableLaw />
                    <Contact />
                </div>
            </div>
        </>
    )
}

export default Main;