import { XIcon } from "@heroicons/react/solid";

/**
 *
 * @param {boolean} modalIsOpen state variable that tells if the modal is open or not
 * @param {Function} toggleModal Function to be passed to toggle the modal
 * @param {JSX.Element} modalContent The modal content
 * @returns
 */
const Modal = ({ modalIsOpen, toggleModal, modalContent, icon }) => {
  return (
    <div
      className={
        modalIsOpen
          ? "fixed top-[50%] left-[50%] z-20 h-fit w-[90%] translate-x-[-50%] translate-y-[-50%] scale-100 rounded-lg bg-white p-4 drop-shadow-2xl transition duration-300 dark:bg-gray-700 md:mx-0 md:w-fit"
          : "h-0 w-0 scale-0"
      }
    >
      <div className="flex flex-col space-y-4 p-2">
        <div className="flex flex-row justify-between align-middle">
          <button>{icon}</button>
          <button className="self-end" onClick={toggleModal}>
            <XIcon className="h-6 w-6 text-black hover:text-gray-500 dark:text-white dark:hover:text-gray-500 " />
          </button>
        </div>
        <div id="modal-content">{modalContent}</div>
      </div>
    </div>
  );
};

export default Modal;
