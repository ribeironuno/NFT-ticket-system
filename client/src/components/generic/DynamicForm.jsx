/**
 * Dynamic Form component
 *
 * @param {List<object>} inputs list of inputs ex: [{name: "name",label: "Group name", type: "text", placeholder: "group xyz",
 * onChange: handleGroupName, value: groupNameInput}]
 * @param {string} submitText the text to be added to the submit button
 * @param {string} width tailwind with class
 * @param {object} submitStatus object that represents if the inputs can be submited ex:
 *  {status: false, error: "E-mail already added to this group"}
 * @param {Function} onSubmit Function that executes on the submit
 */
const DynamicForm = ({ inputs, submitText, width, submitStatus, onSubmit }) => {
  return (
    <form
      id="form"
      onSubmit={onSubmit}
      action="#"
      className={"flex flex-col space-y-5 " + width}>
      {inputs.map((input) => (
        <div className="flex flex-col space-y-1">
          <label
            className="text-sm font-medium text-gray-700 dark:text-gray-200"
            htmlFor={input.name}>
            {input.label}
          </label>
          {input.type === "text" ? (
            <input
              type={input.type}
              className="font-sm rounded-lg border border-gray-300 p-1 px-2 text-gray-600 shadow-sm transition duration-300 focus:bg-gray-100 focus:ring-indigo-500 hover:bg-gray-100 dark:bg-gray-600 dark:text-white dark:focus:bg-gray-900 dark:focus:ring-indigo-500 dark:hover:bg-gray-800"
              placeholder={input.placeholder}
              onChange={input.onChange}
              value={input.value}
            />
          ) :
            input.type === "number" ? (
              <input
                type="number"
                id={input.id}
                className="font-sm rounded-lg border border-gray-300 p-1 px-2 text-gray-600 shadow-sm transition duration-300 
                focus:bg-gray-100 focus:ring-indigo-500 hover:bg-gray-100 dark:bg-gray-600 dark:text-white dark:focus:bg-gray-900 
                dark:focus:ring-indigo-500 dark:hover:bg-gray-800"
                placeholder={input.placeholder}
                onChange={input.onChange}
                min={input.min}
                value={input.value}
              />
            ) : input.type === "textarea" ? (
              <textarea
                type={input.type}
                className="font-sm rounded-lg border border-gray-300 p-1 px-2 text-gray-600 shadow-sm transition duration-300 focus:bg-gray-100 focus:ring-indigo-500 hover:bg-gray-100 dark:bg-gray-600 dark:text-white dark:focus:bg-gray-900 dark:focus:ring-indigo-500 dark:hover:bg-gray-800"
                placeholder={input.placeholder}
                onChange={input.onChange}
                value={input.value}
                cols="30"
                rows="10"
              />
            ) : input.type === "select" ? (
              <select
                className="font-sm rounded-lg border-gray-300 text-gray-600 shadow-sm transition duration-300 focus:bg-gray-100 focus:ring-indigo-500 hover:bg-gray-100 dark:bg-gray-600 dark:text-white dark:focus:bg-gray-900 dark:focus:ring-indigo-500 dark:hover:bg-gray-800"
                id={input.id}
                onChange={input.onChange}
                value={input.value}>
                {input.options.map((option) => (
                  <option disabled={option.disabled} value={option.value}>
                    {option.value}
                  </option>
                ))}
                <option disabled selected value={input.optionText}>
                  {input.optionText}
                </option>
              </select>
            ) : null}
          {/* MORE TYPES OF INPUTS CAN BE ADDED HERE (KEEP IN MIND THE GENERIC ASPECT) */}
        </div>
      ))}
      {submitStatus.status === false && submitStatus.error !== "" ? (
        <span className="text-sm text-red-600">{submitStatus.error}</span>
      ) : null}
      <button
        type="Submit"
        disabled={!submitStatus.status}
        className="w-fit self-center rounded-md border border-transparent bg-indigo-600 py-2 px-6 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:text-indigo-400 hover:bg-indigo-700 disabled:hover:bg-indigo-600">
        {submitText}
      </button>
    </form>
  );
};

export default DynamicForm;
