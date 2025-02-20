import React, { useState } from 'react'
import SearchBar from '../../generic/SearchBar';
import { StructureCard } from "./index";


const StructureListing = ({ setShowType, structsArr, setStructToDetail, deleteStruct, setIsCreating }) => {

    const [searchInput, setSearchInput] = useState("")

    return (
        <div className='min-h-screen mt-0'>

            {/* Structure cards  */}

            {(structsArr) && structsArr.length === 0
                ? //if
                <h1 className="mb-4 self-start font-extrabold tracking-tight text-center w-full dark:text-white text-lg xl:text-xl">
                    There is no structures to show
                </h1>
                : //else
                <>
                    {/* Title */}
                    <div className='flex justify-end'>
                        <div className='flex justify-end flex-wrap w-full md:w-2/6'>
                            <SearchBar placeholder={"Structure name"} stateValue={searchInput} onChangeFunction={setSearchInput} />
                        </div>
                    </div>
                    <div className="flex justify-between flex-wrap pt-6">
                        {structsArr.map((struct, key) => (
                            <React.Fragment key={key}>
                                {struct.name.toLowerCase().includes(searchInput.toLowerCase()) &&
                                    <StructureCard key={key} setShowType={setShowType} struct={struct}
                                        setStructToDetail={setStructToDetail} deleteStruct={deleteStruct}
                                        setIsCreating={setIsCreating} />
                                }
                            </React.Fragment >
                        ))}
                    </div>
                </>
            }
        </div>
    )
}

export default StructureListing