import { toast } from "react-hot-toast";

export const ToastType = {
    DANGER: 1,
    SUCCESS: 2
}


const Toast = (title, message, toastType) => {
    return (
        toast.custom((t) => (
            <div className="flex">
                <div id="toast"
                    className="mb-4 flex w-full max-w-xs items-center rounded-lg bg-white p-4 text-gray-500 shadow dark:bg-gray-800 dark:text-gray-400 p-6"
                    role="alert">
                    <div className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-500 dark:bg-red-800 dark:text-red-200">

                        {toastType === ToastType.DANGER ?
                            <svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd"
                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                    clipRule="evenodd"></path>
                                <span className="sr-only">Error icon</span>
                            </svg>
                            :
                            <div className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200">
                                <svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                                </svg>
                                <span className="sr-only">Check icon</span>
                            </div>
                        }

                    </div>
                    <div className="ml-3 text-sm font-normal">
                        <span className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">{title}</span>
                        <div className="mb-2 text-sm font-normal">{message}</div>
                    </div>
                    <button onClick={() => toast.remove(t.id)}>
                        <svg aria-hidden="true" className="ml-4 my-auto h-5 w-5" fill="currentColor" viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"></path>
                        </svg>
                    </button>
                    <span className="sr-only">Error icon</span>
                </div>
            </div>
        ))
    )
}

export default Toast