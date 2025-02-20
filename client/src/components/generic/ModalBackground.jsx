/**
 * Component that stays on the modal backdroung for when the click happens outside the modal
 * the modal closes
 *
 * @param {boolean} modalIsOpen state variable that tells if the modal is open or not
 * @param {Function} toggleModal Function to be passed to toggle the modal
 * @returns
 */
const ModalBackground = ({ modalIsOpen, toggleModal }) => {
  return (
    <div
      className={
        modalIsOpen
          ? "fixed top-0 left-0 z-10 h-full w-full scale-100 bg-gray-600 opacity-30"
          : "h-0 w-0"
      }
      onClick={toggleModal}
    />
  );
};

export default ModalBackground;
