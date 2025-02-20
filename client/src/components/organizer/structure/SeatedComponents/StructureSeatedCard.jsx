import React, { useState } from 'react'

const StructureSeatedCard = (seatedSection) => {
    seatedSection = seatedSection.seatedSection
    const [openErrorModal, setOpenErrorModal] = useState(false);

    const openModalErrorModal = () => {
        setOpenErrorModal(!openErrorModal)
    }

    return (
        <ul className="grid grid-cols-1 w-full gap-6 h-fit pt-6">
            <div className="hover:shadow-lg hover:shadow-gray-400/50 col-span-1
          shadow divide-y divide-gray-200 bg-gray-200 dark:bg-gray-600 dark:divide-gray-900 border-0 rounded-xl">
                <div className='py-4 px-6 bg-gray-400 border border-gray-300 dark:bg-gray-700 dark:border-0 rounded-t-lg'>
                    <p className='text-lg font-medium dark:text-gray-300'>{seatedSection.name}</p>
                </div>
                {seatedSection.subSection.map((subSection) => (
                    <div className="w-full flex items-center justify-between px-6 py-4 space-x-6">
                        <div className="flex-1 truncate">
                            <div className="flex items-center space-x-3">
                                <h3 className="text-gray-900 text-md font-medium truncate">{subSection.row}</h3>
                            </div>
                            <p className="mt-1 text-gray-900 dark:text-gray-200 text-md truncate">{subSection.door}, {subSection.capacity} </p>
                        </div>

                        <div className='flex flex-nowrap'>
                            <button
                                type="button"
                                onClick={openModalErrorModal}
                                className="flex justify-center px-2 py-2 border border-transparent text-sm font-medium rounded-lg 
                    shadow-sm text-white dark:text-gray-200 bg-red-600 hover:bg-red-400  dark:bg-red-700 dark:hover:bg-red-500 
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ">
                                <p>Delete</p>
                            </button>

                            <div className="w-6"></div>
                            <button
                                type="button"
                                className="flex justify-center items-center px-2 py-2 border border-transparent text-sm font-medium rounded-lg 
                     shadow-sm text-white bg-yellow-500 hover:bg-yellow-400  
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                <p>Edit</p>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </ul>
    )
}

export default StructureSeatedCard
