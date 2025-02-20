import React from 'react'

function GenericButton({ name, onClick, color, className }) {
    return (
        <button
            className={`inline-flex justify-center rounded-md border border-transparent 
         py-2 px-6 text-sm font-medium text-white shadow-sm focus:outline-none my-auto
        hover:bg-${color}-700 bg-${color}-600  ${className}`}
            onClick={onClick}
        >
            {name}
        </button>
    )
}

export default GenericButton