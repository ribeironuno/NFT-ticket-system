/* This example requires Tailwind CSS v2.0+ */
import { useState } from 'react'
import { PlusSmIcon } from '@heroicons/react/outline'
import Toast, { ToastType } from '../../../generic/Toast'


const InsertSeatedPage = ({ togglePage, addSection, isSectionNameAvailable, validateSection, validateSubSection }) => {
    const [sectionName, setSectionName] = useState("")
    const [sectionDoor, setSectionDoor] = useState("")
    const [subSectionArr, setSubSectionArr] = useState([])

    const [rowName, setRowName] = useState("")
    const [capacity, setCapacity] = useState()

    /**
     * Check if the row name is already in the section info
     */
    function isRowNameAvailable(name) {
        var copyArr = subSectionArr.slice()
        var isAvailable = true

        //remove from the main nonSeatedArr
        copyArr.forEach(row => {
            if (row.row === name) {
                isAvailable = false
                Toast("Error!", "The row name already exists", ToastType.DANGER)
                return
            }
        })
        return isAvailable
    }

    /**
     * Adds a row to the section with the values in the states
     */
    function addRow() {

        if (validateSubSection(rowName, capacity) && isRowNameAvailable(rowName)) {
            var newRow = { "row": rowName, "capacity": capacity }
            setSubSectionArr(setSubSectionArr => [newRow, ...setSubSectionArr])

            setRowName("")
            setCapacity('')
        }
    }

    /**
     * Submits the section into the main array
     */
    function insertSection() {
        if (subSectionArr.length < 1) {
            Toast("Error!", "The section must have at least one row", ToastType.DANGER)
            return
        }


        if (validateSection(sectionName, sectionDoor)) {
            var section = { "name": sectionName, "door": sectionDoor }
            section.subSections = subSectionArr.slice()

            addSection(section)
        }
    }

    /**
     * Remove a subsection from the section
     */
    function removeSubSection(name) {
        var copyArr = subSectionArr.slice()
        var tmpsubSectionArr = []

        //remove from the main nonSeatedArr
        copyArr.forEach(row => {
            if (row.row !== name) {
                tmpsubSectionArr.push(row)
            }
        })

        setSubSectionArr(tmpsubSectionArr)
    }


    return (
        <div className='bg-gray-200 dark:bg-gray-600 rounded-lg p-8 w-full mt-6'>
            {/* Section name */}
            <div className="flex justify-between flex-wrap">
                <div className="flex flex-wrap justify-between pb-8 align-middle w-full">
                    <div className="my-2 align-middle">
                        <h1 className='my-auto pb-6 pr-6 text-xl font-medium dark:text-gray-200'>Creating a seated section</h1>
                    </div>
                    <div className="justify-end w-full md:w-fit">
                        <button
                            type="button"
                            onClick={() => { togglePage() }}
                            className="inline-flex items-center p-3 mr-6 border border-transparent rounded-xl shadow-sm text-white bg-red-700 
                            hover:bg-red-600  dark:text-gray-300 font-medium w-full justify-center
                            dark:bg-red-800 dark:hover:bg-red-600">
                            <p>Cancel</p>
                        </button>

                        <button
                            type="button"
                            onClick={() => { insertSection() }}
                            className="inline-flex items-center p-3 border border-transparent rounded-xl shadow-sm text-white bg-green-700 
                            hover:bg-green-600  dark:text-gray-300 font-medium w-full justify-center mt-4
                            dark:bg-green-800 dark:hover:bg-green-600">
                            <p>Save information</p>
                        </button>
                    </div>
                </div>


                <div className='w-full grid grid-cols-1 mt-8 md:mt-0 md:grid-cols-2 gap-6'>
                    {/* Section Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Section name</label>
                        <input
                            type="text"
                            value={sectionName}
                            onChange={(e) => { setSectionName(e.target.value) }}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white sm:text-sm"
                        />
                    </div>

                    {/* Door name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Door name</label>
                        <input
                            type="text"
                            value={sectionDoor}
                            onChange={(e) => { setSectionDoor(e.target.value) }}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white sm:text-sm"
                        />
                    </div>

                </div>

                <hr className="mt-10 h-px bg-gray-200 border-0 dark:bg-gray-400 w-full" />


                {/* Input section */}
                <div className='w-full mt-4'>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-6 w-full mt-8">
                        {/* Row name */}
                        <div className='md:col-span-1 lg:col-span-3'>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Row name</label>
                            <input
                                type="text"
                                value={rowName}
                                onChange={(e) => { setRowName(e.target.value) }}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white sm:text-sm"
                            />
                        </div>
                        {/* Capacity */}
                        <div className='md:col-span-1 lg:col-span-3'>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Capacity</label>
                            <input
                                type="number"
                                value={capacity}
                                onChange={(e) => { setCapacity(e.target.value) }}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white sm:text-sm"
                            />
                        </div>

                        <div className='col-span-2 lg:col-span-1 mt-auto flex justify-center lg:justify-end'>
                            <button
                                type="button"
                                onClick={() => { addRow() }}
                                className="inline-flex items-center  p-3 border border-transparent rounded-full shadow-sm text-white bg-green-700 
                                    hover:bg-green-600  dark:text-gray-100 dark:bg-green-700 dark:hover:bg-green-600">
                                <PlusSmIcon className="h-5 w-5" aria-hidden="true" />
                                <label className="block text-sm font-medium text-gray-100 dark:text-gray-200 pl-1">Add row</label>
                            </button>
                        </div>

                    </div>
                </div>

                <hr className="mt-10 h-px bg-gray-200 border-0 dark:bg-gray-400 w-full" />

                {/* Data inserted */}

                <div className='md:justify-start mt-8 mb-8 w-full' >
                    <h1 className='text-lg text-gray-800 dark:text-gray-300 mb-8 font-medium'>Subsections information</h1>
                    {subSectionArr.length === 0 &&
                        <h1 className='text-xl text-red-700 dark:text-red-600 font-semibold w-full'>Empty subsections body</h1>
                    }

                    {/* Loop for each section */}
                    {subSectionArr.length !== 0 &&
                        <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
                            {subSectionArr.map((row) => (
                                <div className="hover:shadow-lg hover:shadow-gray-900/50 col-span-1 rounded-lg
                                     shadow bg-gray-100 dark:bg-gray-800 hover:shadow-gray-400/50">

                                    <div className="w-full flex flex-wrap items-center justify-between p-6 space-x-1 w-full">
                                        <div className="flex-1 truncate">
                                            <p className="mt-1 text-gray-500 text-md truncate dark:text-gray-300"><strong>Row: </strong> {row.row}</p>
                                            <p className="mt-1 text-gray-500 text-md truncate dark:text-gray-300" ><strong>Capacity: </strong>: {row.capacity}</p>
                                        </div>

                                        <div className='grid grid-cols-1 w-full sm:w-fit mt-4'>
                                            <button
                                                type="button"
                                                onClick={() => { removeSubSection(row.row) }}
                                                className="flex w-full sm:w-fit justify-center px-2 py-2 border border-transparent text-sm font-medium rounded-lg
                                    shadow-sm text-white dark:text-gray-200 bg-red-600 hover:bg-red-400 dark:bg-red-700 dark:hover:bg-red-500 ">
                                                <p>Delete</p>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </ul>
                    }
                </div>
            </div>
        </div>
    )
}

export default InsertSeatedPage