import React, { useState, useEffect } from "react";
import jwt_decode from "jwt-decode";
import { useNavigate } from "react-router-dom";
import ReactTooltip from "react-tooltip";
import { CubeTransparentIcon, CalendarIcon, UsersIcon, PlusSmIcon, XIcon, PencilIcon, RefreshIcon } from "@heroicons/react/outline";
import { Switch } from "@headlessui/react";
import GenericButton from "../../generic/GenericButton";
import { Toaster, toast, ToastBar } from "react-hot-toast";
import Toast, { ToastType } from "../../generic/Toast";
import ErrorModel from "../../generic/ErrorModal";
import { InsertNonSeatedModal, InsertSeatedPage, EditNonSeatedModal, InsertSeatedSubSectionModal, EditSeatedSubSectionModal } from "./index";
import { Accordion, AccordionHeader, AccordionBody } from "@material-tailwind/react";
import EditSeatedModal from "./SeatedComponents/EditSeatedModal";
import constants from "../../../configs/constants";

//Information to display the stats sections.
const stats = [
    { statName: "Creation date", "statNotation": "creationDate", statIcon: CalendarIcon },
    { statName: "Total sections", "statNotation": "totalSections", statIcon: CubeTransparentIcon },
    { statName: "Total capacity", "statNotation": "totalSeats", statIcon: UsersIcon },
]

/**
 * Displays all information about the details of a structure
 */
const StructureDetails = ({ structInfo, deleteStruct, isCreating, statusAccount }) => {
  //all struct
  const [struct, setStruct] = useState(structInfo);
  //control of accord and edit mode
  const [openAccord, setOpenAccord] = useState([]);
  const [editMode, setEditMode] = useState(isCreating);

  //navigation
  const navigate = useNavigate();

  const url = constants.URL_STRUCTURES;

  /**
   * Function to handle the accordion open/close
   *
   * @param {int} value the accordion index to open
   */
  const handleOpen = (value) => {
    var index = openAccord.indexOf(value);
    //if its closed
    if (index !== -1) {
      var updatedArr = [];
      for (let i = 0; i < openAccord.length; i++) {
        if (i !== index) {
          updatedArr.push(openAccord[i]);
        }
      }
      setOpenAccord(updatedArr);
    } else {
      setOpenAccord((openAccord) => [value, ...openAccord]);
    }
  };

  //Use state for the toggle in order to show or not the sections
  const [nonSeteadEnabled, nonSeteadSetEnabled] = useState(true);
  const [seteadEnabled, seteadSetEnabled] = useState(true);

  //counters of new, remove and edited operations
  const [newSectionCounter, setNewSectionCounter] = useState(0);
  const [removedSectionCounter, setRemovedSectionCounter] = useState(0);
  const [editedSectionCounter, setEditedSectionCounter] = useState(0);

  /**
   * Given a name checks if that name exists in created sections
   *
   * @param {String} newName
   * @param {Boolean} isEditing boolean that will indicate if the validation is from a editing operation
   * @param {String} oldName only needed if the isEditing is true
   *
   * @returns {Number}    1 -> if name is VALID \n
   *                      0 -> NOT VALID -> there is a section (new, toRemove tag, or normal) with that name \n
   *                      -1 -> NOT VALID -> there is a section edited where the old name was the name received \n
   */
  function isSectionNameAvailable(newName, isEditing = false, oldName = null) {
    var flag = 1;
    //concat both arrays
    var totalArr = nonSeatedArr.slice();
    totalArr.push.apply(totalArr, seatedArr.slice());

    totalArr.forEach((section) => {
      //if name is equals to some section that was edited
      if (section.oldName && section.oldName === newName) {
        flag = -1;
        return;
      }
      //is there is a section with the same name
      if (section.name === newName) {
        //check if the section found is not the exact section that is being editing,
        //if its the case than the 'repeated name' is a false alarm because it's the same
        if (isEditing && newName !== oldName) {
          flag = 0;
          return;
        }

        //if is not editing and there is a section with the name
        if (!isEditing || (isEditing && oldName !== newName)) {
          flag = 0;
          return;
        }
      }
    });
    return flag;
  }

  /* ############################  Accord ############################ */

  function AccordIcon({ id, open }) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className={`${id === open ? "rotate-180" : ""} h-5 w-5 transition-transform`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    );
  }

  /* ############################ NON SEATED SECTION MANAGEMENT ############################ */

  //array that tracks the non seated arr, with the edition done by user
  const [nonSeatedArr, setNonSeatedArr] = useState(struct.nonSeatedSections);
  //array that tracks always the updated information
  const [updatedNonSeated, setUpdatedNonSeated] = useState(struct.nonSeatedSections);
  //when clicked on open modal marks the actual section to edit
  const [actualEditNonSeatedSection, setActualEditNonSeatedSection] = useState({});

  //Use state for status of modals
  const [isOpenEditNonSeatedModal, setIsOpenEditNonSeatedModal] = useState(false);
  const [isOpenInsertionNonSeatedModal, setIsOpenInsertionNonSeatedModal] = useState(false);

  /**
   * Toggles the insertion of a non seated modal
   */
  const toggleInsertionNonSeated = () => {
    setIsOpenInsertionNonSeatedModal(!isOpenInsertionNonSeatedModal);
  };

  /**
   * Toggles the edit modal of a non seated
   */
  const toggleEditNonSeated = (section) => {
    setActualEditNonSeatedSection(section);
    setIsOpenEditNonSeatedModal(!isOpenEditNonSeatedModal);
  };

  /**
   * Validate if a section contains valid information
   * @return true if its valid, false otherwise
   */
  function validateNonSeatedInfo(name, door, capacity) {
    if (name.length < 3) {
      Toast("Bad input!", "Section name must contain at least three characters", ToastType.DANGER);
      return false;
    }

    if (door.length < 1) {
      Toast("Bad input!", "Door must contain at least one character", ToastType.DANGER);
      return false;
    }

    //check if the capacity is not a string, and if its valid
    var intCapacity = parseInt(capacity);

    if (Number.isNaN(intCapacity) || capacity.toString().includes(" ") || capacity <= 0) {
      Toast("Bad input!", "Capacity must be a number and must be higher than 0", ToastType.DANGER);
      return false;
    }

    return true;
  }

  /**
   * if the received information is valid: adds the section into the updated and normal array,
   * but in the normal array will be added a tag "new"
   *
   * @param {Object} prepared struct
   * @return {Boolean} true is success, false otherwise
   */
  function addNonSeatedSection(newSection) {
    var isNameValid = isSectionNameAvailable(newSection.name);

    if (isNameValid === -1) {
      Toast("Bad input!", "The section name is already in a section that was edited.", ToastType.DANGER);
      return false;
    }

    if (isNameValid === 0) {
      Toast("Bad input!", "The section name already exists", ToastType.DANGER);
      return false;
    }

    if (validateNonSeatedInfo(newSection.name, newSection.door, newSection.capacity)) {
      //update counter and arrays
      setNewSectionCounter(newSectionCounter + 1);
      //obtains the copy of object to prevent from references changes
      var objByValue = Object.assign({}, newSection);
      setUpdatedNonSeated((updatedNonSeated) => [objByValue, ...updatedNonSeated]);

      newSection.new = true;
      setNonSeatedArr((nonSeatedArr) => [newSection, ...nonSeatedArr]);

      return true;
    } else {
      return false;
    }
  }

  /**
   * This function will work together with the useState 'actualEditNonSeatedSection'
   * where its store the section to be edited.
   *
   * Will be given a new info, will be updated in the updated array, and the normal array
   * the will be store the old info and the new
   *
   * @returns true if success
   */
  function editNonSeatedSection(newName, newDoor, newCapacity) {
    var sectionToEdit = actualEditNonSeatedSection;

    var isNameValid = isSectionNameAvailable(newName, true, sectionToEdit.name);

    if (isNameValid === -1) {
      Toast("Bad input!", "The section name is already in a section that was edited.", ToastType.DANGER);
      return false;
    }

    if (isNameValid === 0) {
      Toast("Bad input!", "The section name already exists", ToastType.DANGER);
      return false;
    }

    if (validateNonSeatedInfo(newName, newDoor, newCapacity)) {
      var copyArr = nonSeatedArr.slice();
      var copyUpdated = updatedNonSeated.slice();

      //tmp information to be inserted in updated array
      var tmpUpdated = [];
      var updatedObj = {
        name: newName,
        door: newDoor,
        capacity: newCapacity,
      };
      //search for the section and push the new object in the place of old
      copyUpdated.forEach((section) => {
        if (section.name !== sectionToEdit.name) {
          tmpUpdated.push(section);
        } else {
          tmpUpdated.push(updatedObj);
        }
      });

      //updates from the main nonSeatedArr, where is store the new and old information
      copyArr.forEach((section) => {
        if (section.name === sectionToEdit.name) {
          //old
          section.oldName = sectionToEdit.name;
          section.oldDoor = sectionToEdit.door;
          section.oldCapacity = sectionToEdit.capacity;
          //new
          section.name = newName;
          section.door = newDoor;
          section.capacity = newCapacity;
          //tag
          section.edited = true;
        }
      });
      setEditedSectionCounter(editedSectionCounter + 1);
      setNonSeatedArr(copyArr);
      setUpdatedNonSeated(tmpUpdated);
      return true;
    }
    return false;
  }

  /**
   * Given a edited section removes the 'edited' tag from the normal array, and
   * insert a new updated object in the updated array
   *
   * @param {*}  section to remove the "edited" tag
   */
  function cancelNonSeatedEdit(sectionToCancelNonSeatedEdit) {
    if (sectionToCancelNonSeatedEdit.edited) {
      //store in var because of referencing problems
      var nameOfSectionToEdit = sectionToCancelNonSeatedEdit.name;
      var copyNonSeated = nonSeatedArr.slice();
      var copyUpdated = updatedNonSeated.slice();
      var tmpUpdated = [];
      var updatedObj;

      //find the section and updates the data
      copyNonSeated.forEach((section) => {
        if (section.name === sectionToCancelNonSeatedEdit.name) {
          //remove tag
          delete section.edited;
          //set the old information before the edit
          section.name = section.oldName;
          section.door = section.oldDoor;
          section.capacity = section.oldCapacity;
          //remove old information in the normal array
          delete section.oldName;
          delete section.oldDoor;
          delete section.oldCapacity;
          //create e new object to be inserted in updated array
          updatedObj = Object.assign({}, section);
        }
      });

      //insert in updated array
      copyUpdated.forEach((section) => {
        if (section.name === nameOfSectionToEdit) {
          tmpUpdated.push(updatedObj);
        } else {
          tmpUpdated.push(section);
        }
      });

      //updates the states
      setEditedSectionCounter(editedSectionCounter - 1);
      setUpdatedNonSeated(tmpUpdated);
      setNonSeatedArr(copyNonSeated);
    }
  }

  /**
   * Given a section to remove, will identify with the "toRemove" tag in the normal array
   * and will deletes it from the updated array
   *
   * @param {Object} struct to remove
   */
  function removeNonSeatedSection(sectionToRemove) {
    var copyNonSeated = nonSeatedArr.slice();
    var copyUpdatedNonSeated = updatedNonSeated.slice();
    var tmpUpdatedArr = [];

    //remove from the updated nonSeatedArr and update the data
    copyUpdatedNonSeated.forEach((section) => {
      if (section.name !== sectionToRemove.name) {
        tmpUpdatedArr.push(section);
      }
    });
    setUpdatedNonSeated(tmpUpdatedArr);

    //adds the toRemove tag into the object
    copyNonSeated.forEach((section) => {
      if (section.name === sectionToRemove.name) {
        section.toRemove = true;
      }
    });
    //updates the states
    setRemovedSectionCounter(removedSectionCounter + 1);
    setNonSeatedArr(copyNonSeated);
  }

  /**
   * Given a toRemove section, the function will recover the information,
   * by removing the tag on the normal arr, and will insert again in the
   * updated array
   *
   * @param {*} sectionToRecover the section to recover from a remotion
   */
  function cancelRemoveNonSeatedSection(sectionToRecover) {
    var copyNonSeated = nonSeatedArr.slice();
    //obj to insert in updated
    var newSection = {
      name: sectionToRecover.name,
      door: sectionToRecover.door,
      capacity: sectionToRecover.capacity,
    };

    //set the toRemove tag into the object
    copyNonSeated.forEach((section) => {
      if (section.name === sectionToRecover.name) {
        delete section.toRemove;
      }
    });

    //updates the states
    setRemovedSectionCounter(removedSectionCounter - 1);
    setNonSeatedArr(copyNonSeated);
    setUpdatedNonSeated((updatedNonSeated) => [newSection, ...updatedNonSeated]);
  }

  /* ############################ SEATED SECTION MANAGEMENT ############################*/

  //array that will track editions done by user
  const [seatedArr, setSeatedArr] = useState(JSON.parse(JSON.stringify(struct.seatedSections)));
  //array that will keep always the updated information
  const [updatedSeated, setUpdatedSeated] = useState(JSON.parse(JSON.stringify(struct.seatedSections)));

  //Use state for view control in models
  const [isOpenInsertionSeatedPage, setIsOpenInsertionSeatedPage] = useState(false);
  const [isOpenInsertionSubSectionSeated, setIsOpenInsertionSubSectionSeated] = useState(false);
  const [isOpenEditSubSectionSeated, setIsOpenEditSubSectionSeated] = useState(false);
  const [isDeleteStructModalOpen, setIsDeleteStructModalOpen] = useState(false);
  const [isOpenEditSectionSeated, setIsOpenEditSectionSeated] = useState(false);

  //will track the sections and sub section to be manipulated when the specific operation is call
  const [actualInsertSeatedSection, setActualInsertSeatedSection] = useState({});
  const [actualEditSubSeatedSection, setActualEditSubSeatedSection] = useState(false);
  const [actualEditSeatedSection, setActualEditSeatedSection] = useState({});

  /**
   * Toggles the insertion of a seated page
   */
  function toggleInsertionSeatedPage() {
    setIsOpenInsertionSeatedPage(!isOpenInsertionSeatedPage);
  }

  /**
   * Toggles the edit of a sub section modal in seated, and specify
   * the section and sub that will be edited
   */
  const toggleEditSectionSeated = (section) => {
    setActualEditSeatedSection(section);
    setIsOpenEditSectionSeated(!isOpenEditSectionSeated);
  };

  /**
   * Toggles the insertion of a sub section modal in seated, and specify the section that will
   * be inserted
   */
  const toggleInsertionSubSectionSeated = (section) => {
    setActualInsertSeatedSection(section);
    setIsOpenInsertionSubSectionSeated(!isOpenInsertionSubSectionSeated);
  };

  /**
   * Toggles the edit of a sub section modal in seated, and specify
   * the section and sub that will be edited
   */
  const toggleEditSubSectionSeated = (section, subSection) => {
    setActualEditSeatedSection(section);
    setActualEditSubSeatedSection(subSection);
    setIsOpenEditSubSectionSeated(!isOpenEditSubSectionSeated);
  };

  /**
   * Validate if a seated section contains valid information
   * @return true if its valid, false otherwise
   */
  function validateSeatedSectionInfo(name, door) {
    var flag = true;

    if (name.length < 3) {
      Toast("Bad input!", "Section name must have at least three characters", ToastType.DANGER);
      flag = false;
    }

    if (door.length < 1) {
      Toast("Bad input!", "Door must contain at least one character", ToastType.DANGER);
      flag = false;
    }

    return flag;
  }

  /**
   * Validate if a sub sections contains valid information
   * @return true if its valid, false otherwise
   */
  function validateSubSeatedSectionInfo(row, capacity) {
    if (row.length < 1) {
      Toast("Bad input!", "Row must have at least one character", ToastType.DANGER);
      return false;
    }

    //check if the capacity is not a string, and if its valid
    var intCapacity = parseInt(capacity);

    if (Number.isNaN(intCapacity) || capacity.toString().includes(" ") || capacity <= 0) {
      Toast("Bad input!", "Capacity must be a number and must be higher than 0", ToastType.DANGER);
      return false;
    }

    return true;
  }

  /**
   * Validates the information from a seated section
   *
   * @param {String} newName
   * @param {Boolean} isEditing boolean that will indicate if the validation is from a editing operation
   * @param {String} oldName only needed if the isEditing is true
   *
   * @returns true if its valid, false otherwise
   */
  function isSeatedValid(section, isEditing = false, oldName = null) {
    if (!validateSeatedSectionInfo(section.name, section.door)) {
      return false;
    }
    var checkName = isSectionNameAvailable(section.name);

    if (checkName === -1) {
      Toast("Bad input!", "The section name is already in a section that was edited.", ToastType.DANGER);
      return false;
    }

    if (checkName === 0) {
      Toast("Bad input!", "The section name already exists.", ToastType.DANGER);
      return false;
    }

    //after name is validated check if inputs are valid
    var flag = true;
    section.subSections.forEach((subSection) => {
      if (!validateSubSeatedSectionInfo(subSection.row, subSection.capacity)) {
        flag = false;
        return;
      }
    });
    return flag;
  }

  /**
   * Given a correct section adds to the both arrays, normal and updated.
   * If the values received are wrong the operation is cancel and the user is notified
   *
   * @param {*} section to insert
   * @returns true if success
   */
  function addSeatedSection(section) {
    //check if the data is valid
    if (isSeatedValid(section)) {
      //sets the temporary vars
      var subSectionToNormal = [];
      var subSectionToUpdate = [];

      /*
            for each row in section, creates a copy of the object to prevent
            reference problems, adds a tag to the normal array and insert into updated
            */
      section.subSections.forEach((row) => {
        var updatedRowObj = Object.assign({}, row);
        subSectionToUpdate.push(updatedRowObj);

        subSectionToNormal.push(row);
      });

      var updatedObj = {
        name: section.name,
        door: section.door,
        subSections: subSectionToUpdate,
      };

      section.new = true;
      setNewSectionCounter(newSectionCounter + 1);
      setSeatedArr((seatedArr) => [section, ...seatedArr]);
      setUpdatedSeated((updatedSeated) => [updatedObj, ...updatedSeated]);
      toggleInsertionSeatedPage();
      return true;
    } else {
      return false;
    }
  }

  /**
   * Edits a seated section
   *
   * @returns true if success
   */
  function editSeatedSection(newName, newDoor) {
    var sectionToEdit = actualEditSeatedSection;

    var isNameValid = isSectionNameAvailable(newName, true, sectionToEdit.name);

    if (isNameValid === 0) {
      Toast("Bad input!", "The section name already exists", ToastType.DANGER);
      return false;
    }

    if (isNameValid === -1) {
      Toast("Bad input!", "The section name is already in a section that was edited.", ToastType.DANGER);
      return false;
    }

    if (validateSeatedSectionInfo(newName, newDoor, true, sectionToEdit.name)) {
      var copyArr = seatedArr.slice();
      var copyUpdated = JSON.parse(JSON.stringify(updatedSeated.slice()));

      //search for the section and push the new object in the place of old
      copyUpdated.forEach((section) => {
        if (section.name === sectionToEdit.name) {
          section.name = newName;
          section.door = newDoor;
        }
      });

      //updates from the main seatedArr, where is store the new and old information
      copyArr.forEach((section) => {
        if (section.name === sectionToEdit.name) {
          //old
          section.oldName = sectionToEdit.name;
          section.oldDoor = sectionToEdit.door;
          //new
          section.name = newName;
          section.door = newDoor;
          //tag
          section.edited = true;
        }
      });
      setEditedSectionCounter(editedSectionCounter + 1);
      setSeatedArr(copyArr);
      setUpdatedSeated(copyUpdated);
      return true;
    }
    return false;
  }

  /**
   * Given a edited section removes the 'edited' tag from the normal array, and
   * insert a new updated object in the updated array
   *
   */
  function cancelSeatedEdit(sectionToCancelSeatedEdit) {
    if (sectionToCancelSeatedEdit.edited) {
      //store in var because of referencing problems
      var nameOfSectionToEdit = sectionToCancelSeatedEdit.name;
      var copySeated = seatedArr.slice();
      var copyUpdated = updatedSeated.slice();
      var tmpUpdated = [];
      var updatedObj;

      //find the section and updates the data
      copySeated.forEach((section) => {
        if (section.name === sectionToCancelSeatedEdit.name) {
          //remove tag
          delete section.edited;
          //set the old information before the edit
          section.name = section.oldName;
          section.door = section.oldDoor;
          //remove old information in the normal array
          delete section.oldName;
          delete section.oldDoor;
          //create e new object to be inserted in updated array
          updatedObj = JSON.parse(JSON.stringify(section));
        }
      });

      //insert in updated array
      copyUpdated.forEach((section) => {
        if (section.name === nameOfSectionToEdit) {
          tmpUpdated.push(updatedObj);
        } else {
          tmpUpdated.push(section);
        }
      });

      //updates the states
      setEditedSectionCounter(editedSectionCounter - 1);
      setUpdatedSeated(tmpUpdated);
      setSeatedArr(copySeated);
    }
  }

  /**
   * Mark as 'to remove' from the normal array, and remove the object
   * from the updated array
   *
   * @param {*} sectionToRemove
   */
  function removeSeatedSection(sectionToRemove) {
    var copySeatedArr = seatedArr.slice();
    var copyUpdated = updatedSeated.slice();
    var tmpUpdatedArr = [];

    //remove from the updated array
    copyUpdated.forEach((section) => {
      if (section.name !== sectionToRemove.name) {
        tmpUpdatedArr.push(section);
      }
    });

    copySeatedArr.forEach((section) => {
      if (section.name === sectionToRemove.name) {
        section.toRemove = true;
      }
    });
    setSeatedArr(copySeatedArr);

    //updates the states
    setUpdatedSeated(tmpUpdatedArr);
    setRemovedSectionCounter(removedSectionCounter + 1);
  }

  /**
   * Cancel the operation of remotion done. In normal array deletes the tag
   * 'to remove' in the updated reinsert the section removed
   * @param {*} sectionToRecover
   */
  function cancelRemoveSeatedSection(sectionToRecover) {
    var copySeatedArr = JSON.parse(JSON.stringify(seatedArr));
    var sectionUpdated = { name: sectionToRecover.name, door: sectionToRecover.door };
    var subSectionUpdated = [];

    //create a tmp array clean of tags
    sectionToRecover.subSections.forEach((row) => {
      //if the section was not marked to be removed
      if (!row.toRemove) {
        var cleanRow = {
          row: row.row,
          capacity: row.capacity,
        };
        subSectionUpdated.push(cleanRow);
      }
    });
    sectionUpdated["subSections"] = subSectionUpdated;

    //set the toRemove tag into the object
    copySeatedArr.forEach((section) => {
      if (section.name === sectionToRecover.name) {
        delete section.toRemove;
      }
    });

    //updates the states
    setRemovedSectionCounter(removedSectionCounter - 1);
    setUpdatedSeated((updatedSeated) => [sectionUpdated, ...updatedSeated]);
    setSeatedArr(copySeatedArr);
  }

  // FOR SUBSECTIONS

  /**
   * Given a name checks if that name exists is valid for the row name
   * @returns {Number}     1 -> if name is VALID
   *                       0 -> NOT VALID -> there is a section (new, toRemove tag, or normal) with that name
   *                       -1 -> NOT VALID -> there is a section edited where the old name was the name received
   */
  function isSubRowNameAvailable(section, newName, isEditing = false, oldName = null) {
    var flag = 1;

    section.subSections.forEach((row) => {
      //there is a section with the name
      if (row.row === newName) {
        if (isEditing && newName !== oldName) {
          flag = -1;
          return;
        }
      }

      //the name is taken by a edited row
      if (row.oldRow && row.oldRow === newName) {
        flag = 0;
        return;
      }
    });
    return flag;
  }

  /**
   * Validates the information from a seated section
   */
  function isSeatedSubSectionValid(section, subSectionToAdd) {
    var flag = true;

    //check if basic info is valid
    if (!validateSubSeatedSectionInfo(subSectionToAdd.row, subSectionToAdd.capacity)) {
      return false;
    }

    //check if the sub section name is unique in section
    section.subSections.forEach((subSection) => {
      if (subSection.row === subSectionToAdd.row) {
        Toast("Bad input!", "The sub section name already exists.", ToastType.DANGER);
        flag = false;
        return;
      }
    });

    return flag;
  }

  /**
   * Adds a sub section to the arrays
   *
   * @param {*} subSectionToAdd {"row": rowName, "capacity": capacity}
   * @returns true if success
   */
  function addSubSection(subSectionToAdd) {
    var sectionToAdd = actualInsertSeatedSection;
    var checkName = isSubRowNameAvailable(sectionToAdd, subSectionToAdd.row);

    //check if name is available
    if (checkName === 0) {
      Toast("Bad input!", "The row name is already in the section, but in a edited row.", ToastType.DANGER);
      return false;
    }
    if (checkName === -1) {
      Toast("Bad input!", "The row name name already exists", ToastType.DANGER);
      return false;
    }

    //check if the information is valid
    if (isSeatedSubSectionValid(sectionToAdd, subSectionToAdd)) {
      //executes the changes on the updated array

      var copyUpdatedArr = JSON.parse(JSON.stringify(updatedSeated));
      var newUpdateSub = { row: subSectionToAdd.row, capacity: subSectionToAdd.capacity };
      copyUpdatedArr.forEach((section) => {
        if (section.name === sectionToAdd.name) {
          section.subSections.push(newUpdateSub);
        }
      });

      //makes the operation for the normal array
      var copySeatedArr = JSON.parse(JSON.stringify(seatedArr));
      var newNormalSub = { row: subSectionToAdd.row, capacity: subSectionToAdd.capacity, new: true };
      copySeatedArr.forEach((section) => {
        if (section.name === sectionToAdd.name) {
          section.subSections.push(newNormalSub);
        }
      });

      //updates the states
      setRemovedSectionCounter(removedSectionCounter + 1);
      setSeatedArr(copySeatedArr);
      setUpdatedSeated(copyUpdatedArr);
      return true;
    } else {
      return false;
    }
  }

  /**
   * Edits a sub section. In the normal array will change and add a information about the edition,
   * on the updated array will change the core information
   * @returns true if success
   */
  function editSubSeatedSection(newRowName, newCapacity) {
    var subSectionToEdit = actualEditSubSeatedSection;
    var sectionToEdit = actualEditSeatedSection;

    var checkName = isSubRowNameAvailable(sectionToEdit, newRowName, true, subSectionToEdit.row);

    if (checkName === 0) {
      Toast("Bad input!", "The row name is already in the section, but in a edited row.", ToastType.DANGER);
      return false;
    }

    if (checkName === -1) {
      Toast("Bad input!", "The row name name already exists", ToastType.DANGER);
      return false;
    }

    if (validateSubSeatedSectionInfo(newRowName, newCapacity)) {
      //updates in the updated array
      var copyUpdatedArr = JSON.parse(JSON.stringify(updatedSeated));
      copyUpdatedArr.forEach((section) => {
        if (section.name === sectionToEdit.name) {
          section.subSections.forEach((subSection) => {
            if (subSection.row === subSectionToEdit.row) {
              subSection.row = newRowName;
              subSection.capacity = newCapacity;
            }
          });
        }
      });

      //add the meta information in the normal array
      var copySeatedArr = JSON.parse(JSON.stringify(seatedArr));
      copySeatedArr.forEach((section) => {
        if (section.name === sectionToEdit.name) {
          section.subSections.forEach((subSection) => {
            if (subSection.row === subSectionToEdit.row) {
              subSection.oldRow = subSectionToEdit.row;
              subSection.oldCapacity = subSectionToEdit.capacity;

              subSection.row = newRowName;
              subSection.capacity = newCapacity;

              subSection.edited = true;
            }
          });
        }
      });
      setEditedSectionCounter(editedSectionCounter + 1);
      setSeatedArr(copySeatedArr);
      setUpdatedSeated(copyUpdatedArr);
      return true;
    } else {
      return false;
    }
  }

  /**
   * Cancels the edit. In the normal array removes the edit and tag information and change
   * the actual information, on the updated array the core information is updated
   */
  function cancelEditSubSeatedSection(sectionEdited, subSectionEdited) {
    var oldRowName, oldCapacity;
    //updates from the normal array
    var copySeatedArr = JSON.parse(JSON.stringify(seatedArr));
    copySeatedArr.forEach((section) => {
      if (section.name === sectionEdited.name) {
        section.subSections.forEach((subSection) => {
          //when found the subsection
          if (subSection.row === subSectionEdited.row) {
            oldRowName = subSection.oldRow;
            oldCapacity = subSection.oldCapacity;

            delete section.edited;

            subSection.row = subSection.oldRow;
            subSection.capacity = subSection.oldCapacity;

            delete subSection.oldRow;
            delete subSection.oldCapacity;

            delete subSection.edited;
          }
        });
      }
    });

    //updates in the updated array
    var copyUpdatedArr = JSON.parse(JSON.stringify(updatedSeated));
    copyUpdatedArr.forEach((section) => {
      if (section.name === sectionEdited.name) {
        section.subSections.forEach((subSection) => {
          if (subSection.row === subSectionEdited.row) {
            subSection.row = oldRowName;
            subSection.capacity = oldCapacity;
          }
        });
      }
    });
    //updates the states
    setEditedSectionCounter(editedSectionCounter + 1);
    setSeatedArr(copySeatedArr);
    setUpdatedSeated(copyUpdatedArr);
  }

  /**
   * Removes a sub section. On the normal array is marked as toRemove, on the update array
   * is removed.
   * If the sub section to remove is the only one in the section or is the last one active
   * (not marked as to remove) all section is deleted
   */
  function removeSubSectionFromSeated(sectionToRemove, subSectionToRemove) {
    // if there has ever been any removal in the section
    if (sectionToRemove.countSubSectionRemoved) {
      //check if the sub section to remove is the last that active (without toRemove tag)
      if (sectionToRemove.countSubSectionRemoved === sectionToRemove.subSections.length - 1) {
        removeSeatedSection(sectionToRemove);
        return;
      }
    } else {
      //if the sub section if the only one in section
      if (sectionToRemove.subSections.length === 1) {
        removeSeatedSection(sectionToRemove);
        return;
      }
    }

    var copySeatedArr = JSON.parse(JSON.stringify(seatedArr));
    //remove from the normal array
    copySeatedArr.forEach((section) => {
      if (section.name === sectionToRemove.name) {
        section.subSections.forEach((subSection) => {
          //when found the subsection adds the tag toRemove
          if (subSection.row === subSectionToRemove.row) {
            subSection.toRemove = true;
            //adds a counter to check how much subsection is current with toRemove tag
            if (section.countSubSectionRemoved) {
              section.countSubSectionRemoved++;
            } else {
              section.countSubSectionRemoved = 1;
            }
            return;
          }
        });
        return;
      }
    });

    var copyUpdatedSeated = JSON.parse(JSON.stringify(updatedSeated));
    //remove from the normal array
    copyUpdatedSeated.forEach((section) => {
      //find the index and remove directly
      if (section.name === sectionToRemove.name) {
        let tmpArr = [];
        section.subSections.forEach((subSection) => {
          if (subSection.row !== subSectionToRemove.row) {
            tmpArr.push(subSection);
          }
        });
        section.subSections = tmpArr;
      }
    });

    //updates the states
    setRemovedSectionCounter(removedSectionCounter + 1);
    setSeatedArr(copySeatedArr);
    setUpdatedSeated(copyUpdatedSeated);
  }

  /**
   * Cancel the toRemove tag in the normal array, and inserts again in the
   * updated array
   */
  function cancelRemoveSubSection(sectionAffected, subSectionToRecover) {
    var copySeatedArr = JSON.parse(JSON.stringify(seatedArr));
    //searches in the normal array and delete the toRemove tag
    copySeatedArr.forEach((section) => {
      if (section.name === sectionAffected.name) {
        section.subSections.forEach((subSection) => {
          if (subSection.row === subSectionToRecover.row) {
            delete subSection.toRemove;
            section.countSubSectionRemoved--;
            return;
          }
        });
        return;
      }
    });

    var copyUpdatedArr = JSON.parse(JSON.stringify(updatedSeated));
    //searches in the normal array and delete the toRemove tag
    copyUpdatedArr.forEach((section) => {
      if (section.name === sectionAffected.name) {
        var newObj = {
          row: subSectionToRecover.row,
          capacity: subSectionToRecover.capacity,
        };
        //if was a row added recently
        if (subSectionToRecover.true) {
          newObj.new = true;
        }
        section.subSections.push(newObj);
        return;
      }
    });

    //updates the states
    setRemovedSectionCounter(removedSectionCounter - 1);
    setSeatedArr(copySeatedArr);
    setUpdatedSeated(copyUpdatedArr);
  }

  /* ############################ Other operations ############################*/

  //decode the token and get email
  var decodedJwt = jwt_decode(localStorage.getItem("token"));
  var id = decodedJwt[constants.ID_DECODE];

  /**
   * When call save all changes done.
   * Calls father function to update struct
   */
  function saveChanges() {
    var newStruct = struct;
    delete newStruct.organizerEmail;
    newStruct.seatedSections = updatedSeated;
    newStruct.nonSeatedSections = updatedNonSeated;

    if (checkIfStructureValidToSave(newStruct)) {
      console.log("updated", newStruct);

      if (isCreating) {
        if (statusAccount === "Banned") {
          Toast("Your account was banned!", "Strucutre information are read-only", ToastType.DANGER);
        } else {
          fetch(url + "create", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newStruct),
          })
            .then((res) => {
              console.log("res", res);
              if (res.status !== 200) throw new Error(res.status);
              else {
                Toast("Structure created", "", ToastType.SUCCESS);
                window.location.href = "/app/organizer/structures";
              }
            })
            .catch((err) => {
              Toast("Operation failed", "It was not possible to operate the task", ToastType.DANGER);
              console.log(err.message);
            });
        }
      } else {
        //is editing

        if (statusAccount === "Banned") {
          Toast("Your account was banned!", "Strucutre information are read-only", ToastType.DANGER);
        } else {
          var bodyToSend = {
            oldStructureName: newStruct.name,
            organizerId: id,
            newStructure: newStruct,
          };

          fetch(url + "update", {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(bodyToSend),
          })
            .then((res) => {
              console.log("res", res);
              if (res.status !== 200) throw new Error(res.status);
              else {
                Toast("Structure edited", "", ToastType.SUCCESS);
                window.location.href = `/app/organizer/structures/${newStruct.name}`;
              }
            })
            .catch((err) => {
              Toast("Operation failed", "It was not possible to operate the task", ToastType.DANGER);
              console.log(err.message);
            });
        }
      }
    }
  }

  function checkIfStructureValidToSave(newStruct) {
    if (newStruct.name.length < 3) {
      Toast("Invalid structure name", "The structure name must have at least 3 characters", ToastType.DANGER);
      return false;
    } else if (newStruct.seatedSections.length === 0 && newStruct.nonSeatedSections.length === 0) {
      Toast("Invalid structure body", "Both seated and non seated section are empty!", ToastType.DANGER);
      return false;
    } else {
      return true;
    }
  }

  // useEffect(() => {
  var totalSections = Number(0);
  var totalSeats = Number(0);

  if (updatedNonSeated.length !== 0) {
    totalSections += updatedNonSeated.length;
    updatedNonSeated.forEach((section) => {
      totalSeats += Number(section.capacity);
    });
  }

  if (updatedSeated.length !== 0) {
    totalSections += updatedSeated.length;
    updatedSeated.forEach((section) => {
      section.subSections.forEach((subSection) => {
        totalSeats += Number(subSection.capacity);
      });
    });
  }

  struct.stats.totalSeats = totalSeats;
  struct.stats.totalSections = totalSections;
  // },
  //     [updatedSeated, updatedNonSeated, struct.stats]
  // );

  return (
    <div>
      {/* Modals */}
      {isOpenInsertionNonSeatedModal && <InsertNonSeatedModal setOpen={setIsOpenInsertionNonSeatedModal} addSectionFunction={addNonSeatedSection} />}

      {isOpenEditNonSeatedModal && <EditNonSeatedModal setOpen={setIsOpenEditNonSeatedModal} editSectionFunction={editNonSeatedSection} sectionInfo={actualEditNonSeatedSection} />}

      {isOpenInsertionSubSectionSeated && <InsertSeatedSubSectionModal setOpen={setIsOpenInsertionSubSectionSeated} addSubSectionFunction={addSubSection} />}

      {isOpenEditSectionSeated && <EditSeatedModal setOpen={setIsOpenEditSectionSeated} editSectionFunction={editSeatedSection} sectionInfo={actualEditSeatedSection} />}

      {isOpenEditSubSectionSeated && (
        <EditSeatedSubSectionModal setOpen={setIsOpenEditSubSectionSeated} editSubSeatedSectionFunction={editSubSeatedSection} sectionToEdit={actualEditSubSeatedSection} />
      )}

      {isDeleteStructModalOpen && (
        <ErrorModel
          tittle={"Delete all structure information"}
          message={"Do you want to delete all information about the structure? \n Once deleted there is no changes to recover "}
          onClick={() => {
            deleteStruct(struct);
          }}
          cancelBtnName={"Cancel"}
          submitBtnName={"Delete"}
          toggleModal={setIsDeleteStructModalOpen}
        />
      )}
      {/* End of modals */}

      <div className="flex w-full flex-wrap justify-center md:justify-between">
        <h1 className="w-full pb-6 text-center text-xl font-bold decoration-4 dark:text-gray-400 md:w-fit md:text-start md:text-3xl">{struct.name}</h1>

        <div className={`grid ${!editMode ? "grid-cols-2" : "grid-cols-1"}  gap-4`}>
          {!editMode && (
            <button
              className="m-auto ml-3 inline-flex justify-center rounded-md border border-transparent bg-yellow-600 py-2 px-6 
                                    text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 
                                     focus:ring-offset-2 hover:bg-yellow-700"
              onClick={() => {
                setEditMode(true);
              }}
            >
              Edit mode
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              isCreating ? window.location.reload(false) : setIsDeleteStructModalOpen(!isDeleteStructModalOpen);
            }}
            className="p-auto m-auto flex justify-center rounded-lg border border-transparent bg-red-600 px-2 py-2 text-sm
                                    font-medium text-white shadow-sm hover:bg-red-400 dark:bg-red-700  dark:text-gray-200 dark:hover:bg-red-500 "
          >
            {isCreating ? <p>Cancel creation</p> : <p>Delete structure</p>}
          </button>
        </div>
      </div>
      {/* Stats details */}

      <div className="pt-10">
        <h3 className="text-2xl font-medium leading-6 text-gray-900 dark:text-gray-400">Statistics</h3>

        <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, key) => (
            <div key={key} className="relative overflow-hidden rounded-lg bg-gray-200 px-4 pt-5 shadow dark:bg-gray-600 sm:px-6 sm:pt-6">
              <dt>
                <div className="absolute rounded-md bg-indigo-500 p-3">
                  <stat.statIcon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <p className="ml-16 truncate text-sm font-medium text-gray-500 dark:text-gray-200">{stat.statName}</p>
              </dt>
              <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">{struct.stats[stat.statNotation]}</p>
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Sections details */}
      <div className="pt-24">
        <div className="flex justify-between md:justify-start">
          <section className="my-auto flex w-full flex-wrap justify-between">
            <p className="mt-2 text-2xl font-medium leading-6 text-gray-900 dark:text-gray-400">Sections</p>
            {(((newSectionCounter > 0 || removedSectionCounter > 0 || editedSectionCounter > 0) && !isCreating) || isCreating) && (
              <button
                type="button"
                onClick={saveChanges}
                className="p-auto flex animate-bounce animate-pulse justify-center rounded-lg border border-transparent bg-green-600 px-2 py-2 text-lg text-sm
            font-medium text-white shadow-sm hover:bg-green-400 dark:bg-green-700  dark:text-gray-200 dark:hover:bg-green-500 "
              >
                <p>Save changes</p>
              </button>
            )}
          </section>
        </div>

        {/* ############################ NON SEATED DETAILS ############################ */}

        <div className=" pt-14 md:justify-start">
          <div className="flex justify-between">
            <div className="flex justify-start pb-8 align-middle">
              <div className="my-2 align-middle">
                <h1 className="my-auto pb-6 pr-6 text-lg dark:text-gray-400">
                  <strong>Unseated sections</strong>
                </h1>
              </div>
              {editMode && (
                <div className="">
                  <button
                    type="button"
                    onClick={() => {
                      toggleInsertionNonSeated();
                    }}
                    className="inline-flex items-center rounded-full border border-transparent bg-green-700 p-3 text-white shadow-sm 
                                    hover:bg-green-600  dark:bg-green-800 dark:text-gray-300 dark:hover:bg-green-600"
                  >
                    <PlusSmIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>
            {nonSeatedArr.length !== 0 && (
              <div className="align-center my-2 pt-1">
                <Switch
                  checked={nonSeteadEnabled}
                  onChange={nonSeteadSetEnabled}
                  className="bg-gray group relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer items-center justify-center rounded-full "
                >
                  <span aria-hidden="true" className="pointer-events-none absolute h-full w-full rounded-md bg-transparent" />
                  <span
                    aria-hidden="true"
                    className={` ${nonSeteadEnabled ? "bg-indigo-600" : "bg-gray-600"}
                                            pointer-events-none absolute mx-auto h-4 w-9 rounded-full duration-200 ease-in-out`}
                  />
                  <span
                    aria-hidden="true"
                    className={` ${nonSeteadEnabled ? "translate-x-5" : "translate-x-0"}
                                            pointer-events-none absolute left-0 inline-block h-5 w-5 transform rounded-full border border-gray-600 bg-white shadow ring-0 transition-transform duration-200 ease-in-out`}
                  />
                </Switch>
              </div>
            )}
          </div>

          {nonSeatedArr.length === 0 && <h1 className="w-full text-xl text-red-600 dark:text-red-800">There are currently no unseated sections</h1>}

          {/* Loop for each section */}
          {nonSeatedArr.length !== 0 && nonSeteadEnabled && (
            <ul className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {nonSeatedArr.map((nonSeatedSection, key) => (
                <div
                  key={key}
                  className="/50 relative col-span-1 divide-y
                                divide-gray-200 rounded-lg bg-gray-200 shadow hover:shadow-lg hover:shadow-gray-900/50 hover:shadow-gray-400 dark:divide-transparent dark:bg-gray-600"
                >
                  {/* New badge */}
                  {nonSeatedSection.new && (
                    <div className={`absolute -top-2 ${nonSeatedSection.edited || nonSeatedSection.toRemove ? "left-24" : "-left-2 md:-left-4"} rounded-full bg-sky-500 px-3 py-1 text-sm font-bold`}>
                      New
                    </div>
                  )}

                  {/* Edited badge */}
                  {nonSeatedSection.edited && <div className="absolute -top-2 -left-2 rounded-full bg-yellow-500 px-3 py-1 text-sm font-bold md:-left-4">Edited</div>}

                  {/* Deleted badge */}
                  {nonSeatedSection.toRemove && <div className="absolute -top-2 -left-2 rounded-full bg-red-500 px-3 py-1 text-sm font-bold md:-left-4">To remove</div>}

                  <div className="flex w-full flex-wrap items-center justify-between space-x-1 p-6 md:flex-nowrap">
                    <div className="w-full flex-1 truncate">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-md truncate font-medium text-gray-900 dark:text-gray-200">{nonSeatedSection.name}</h3>
                      </div>
                      <p className="text-md mt-1 truncate text-gray-500 dark:text-gray-300">{nonSeatedSection.door}</p>
                      <p className="text-md mt-1 truncate text-gray-500 dark:text-gray-300">{nonSeatedSection.capacity}</p>
                    </div>

                    <div className="mt-6 flex grid w-full grid-cols-2 justify-center gap-6 md:mt-0 md:w-fit md:grid-cols-1 ">
                      {/* If is tagged as to remove the button turns to recover */}
                      {!nonSeatedSection.toRemove && editMode ? (
                        <button
                          type="button"
                          onClick={() => {
                            removeNonSeatedSection(nonSeatedSection);
                          }}
                          className="p-auto m-auto flex w-24 justify-center rounded-lg border border-transparent bg-red-600 px-2 py-2 text-sm
                                                        font-medium text-white shadow-sm hover:bg-red-400 dark:bg-red-700  dark:text-gray-200 dark:hover:bg-red-500 "
                        >
                          <p>Delete</p>
                        </button>
                      ) : (
                        <>
                          {editMode && (
                            <button
                              type="button"
                              onClick={() => {
                                cancelRemoveNonSeatedSection(nonSeatedSection);
                              }}
                              className="col-span-2  flex w-24 justify-center rounded-lg border border-transparent bg-sky-600 px-2 py-2 text-sm font-medium
                                            text-white shadow-sm hover:bg-sky-400 dark:bg-sky-700 dark:text-gray-200  dark:hover:bg-sky-500 md:col-span-1 "
                            >
                              <p>Recover</p>
                            </button>
                          )}
                        </>
                      )}

                      {!nonSeatedSection.toRemove && !nonSeatedSection.edited && editMode && (
                        <button
                          type="button"
                          onClick={() => {
                            toggleEditNonSeated(nonSeatedSection);
                          }}
                          className="flex w-24 items-center justify-center rounded-lg border border-transparent bg-yellow-500 px-2 py-2 text-sm
                                            font-medium text-white shadow-sm hover:bg-yellow-400 dark:text-gray-200 "
                        >
                          <p>Edit</p>
                        </button>
                      )}

                      {/* ToolTip to show old information */}
                      {nonSeatedSection.edited && !nonSeatedSection.toRemove && editMode && (
                        <a data-tip data-for="nonSeated">
                          <button
                            id="editedButton"
                            type="button"
                            onClick={() => {
                              cancelNonSeatedEdit(nonSeatedSection);
                            }}
                            className="flex w-24 items-center justify-center rounded-lg border border-transparent bg-sky-500 px-2 py-2 text-sm
                                            font-medium text-white shadow-sm hover:bg-sky-400 dark:text-gray-200 "
                          >
                            <p>Cancel edit</p>
                          </button>
                        </a>
                      )}
                      {nonSeatedSection.edited && editMode && (
                        <ReactTooltip id="nonSeated" aria-haspopup="true">
                          <p className="mb-4 text-lg">Old information</p>
                          <ul>
                            <li className="text-md font-bold">Name: {nonSeatedSection.oldName} </li>
                            <li className="text-md font-bold">Door: {nonSeatedSection.oldDoor}</li>
                            <li className="text-md font-bold">Capacity: {nonSeatedSection.oldCapacity}</li>
                          </ul>
                        </ReactTooltip>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </ul>
          )}
        </div>

        {/* ############################  SEATED DETAILS ############################ */}

        {/* SECTION DETAILS */}
        <div className=" pt-14 md:justify-start">
          <div className="flex justify-between">
            <div className="flex justify-start pb-4 align-middle">
              <div className="my-2 align-middle">
                <h1 className="my-auto pb-6 pr-6 text-lg dark:text-gray-400">
                  <strong>Seated sections</strong>
                </h1>
              </div>
              <div className="">
                {!isOpenInsertionSeatedPage && editMode && (
                  <button
                    type="button"
                    onClick={toggleInsertionSeatedPage}
                    className="inline-flex items-center rounded-full border border-transparent bg-green-700 p-3 text-white shadow-sm 
                                        hover:bg-green-600  dark:bg-green-800 dark:text-gray-300 dark:hover:bg-green-600"
                  >
                    <PlusSmIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
            {!isOpenInsertionSeatedPage && seatedArr.length !== 0 && (
              <div className="align-center my-2 pt-1">
                <Switch
                  checked={seteadEnabled}
                  onChange={seteadSetEnabled}
                  className="group relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer items-center justify-center rounded-full bg-transparent "
                >
                  <span aria-hidden="true" className="pointer-events-none absolute h-full w-full rounded-md bg-transparent" />
                  <span
                    aria-hidden="true"
                    className={`duration-200 ${seteadEnabled ? "bg-indigo-600" : "bg-gray-600"} pointer-events-none 
                                        absolute mx-auto h-4 w-9 rounded-full  ease-in-out`}
                  />
                  <span
                    aria-hidden="true"
                    className={` ${seteadEnabled ? "translate-x-5" : "translate-x-0"}
                                            pointer-events-none absolute left-0 inline-block h-5 w-5 transform rounded-full border border-gray-600 bg-white shadow ring-0 transition-transform duration-200 ease-in-out`}
                  />
                </Switch>
              </div>
            )}
          </div>

          {seatedArr.length === 0 && !isOpenInsertionSeatedPage && <h1 className="w-full text-xl text-red-600 dark:text-red-800">There are currently no sitting sections</h1>}

          {seatedArr.length !== 0 && seteadEnabled && !isOpenInsertionSeatedPage && (
            <ul className="col-span-1 grid h-fit grid-cols-1  gap-6 pt-6 md:grid-cols-2 lg:grid-cols-3">
              {seatedArr.map((seatedSection, key) => (
                <div
                  key={key}
                  className="border:black mx-auto mb-6 h-fit w-full
                                    items-center rounded-lg border shadow-md hover:shadow-lg dark:border-gray-800"
                >
                  <Accordion
                    open={openAccord.indexOf(key) !== -1}
                    icon={
                      <button
                        onClick={() => {
                          handleOpen(key);
                        }}
                      >
                        <AccordIcon id={key} open={openAccord} />
                      </button>
                    }
                    key={key}
                    className="mb-0 rounded-lg bg-gray-200 p-4 dark:bg-gray-700"
                  >
                    <AccordionHeader className="border-b-0 border-b-2 border-gray-400 bg-gray-200 p-0 py-1 dark:border-gray-400 dark:bg-gray-700">
                      <div
                        className="flex h-full w-full flex-wrap 
                                                rounded-t-lg border-0 bg-gray-200 px-4 py-2 dark:bg-gray-700"
                      >
                        <div
                          onClick={() => {
                            handleOpen(key);
                          }}
                          className="flex w-full flex-wrap justify-center md:justify-start"
                        >
                          <p className="mr-6 mb-2 w-full text-lg font-bold dark:text-gray-300 sm:mr-0">{seatedSection.name}</p>

                          <p className="mr-6 mb-4 w-full text-lg font-bold dark:text-gray-300 sm:mr-0 md:mb-0">{seatedSection.door}</p>

                          {/* New badge */}
                          {seatedSection.new && (
                            <div
                              className={`absolute ${seatedSection.toRemove || seatedSection.edited ? "left-24" : "-left-2 md:-left-4"} -top-2 rounded-full bg-sky-500 px-3 py-1 text-sm 
                                                         font-bold text-black`}
                            >
                              New
                            </div>
                          )}

                          {/* Deleted badge */}
                          {seatedSection.toRemove && <div className="absolute -top-2 -left-2 rounded-full bg-red-500 px-3 py-1 text-sm font-bold text-black dark:bg-red-800 md:-left-4">To remove</div>}

                          {/* Edited badge */}
                          {seatedSection.edited && !seatedSection.toRemove && <div className="absolute -top-2 -left-2  rounded-full bg-yellow-500 px-3 py-1 text-sm font-bold text-black">Edited</div>}
                        </div>
                        <div
                          className={`md:grid-0 grid w-full grid-cols-3  gap-4 md:flex
                                                        md:flex-wrap ${editMode ? "mb-4 mt-6" : "mt-4 mb-0"} justify-around`}
                        >
                          {!seatedSection.toRemove && editMode && (
                            <>
                              <div className="flex justify-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    toggleInsertionSubSectionSeated(seatedSection);
                                  }}
                                  className="inline-flex items-center rounded-full border border-transparent bg-green-700 p-3 text-white shadow-sm 
                                                         hover:bg-green-600  dark:bg-green-800 dark:text-gray-300 dark:hover:bg-green-600"
                                >
                                  <PlusSmIcon className="h-6 w-6" aria-hidden="true" />
                                </button>
                              </div>

                              <div className="flex justify-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    removeSeatedSection(seatedSection);
                                  }}
                                  className="inline-flex items-center rounded-full border border-transparent bg-red-700 p-3 text-white shadow-sm 
                                                         hover:bg-red-600  dark:bg-red-800 dark:text-gray-300 dark:hover:bg-red-600"
                                >
                                  <XIcon className="h-6 w-6" aria-hidden="true" />
                                </button>
                              </div>

                              <div className="flex justify-center">
                                {!seatedSection.edited && editMode && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActualEditSeatedSection(seatedSection);
                                      toggleEditSectionSeated(seatedSection);
                                    }}
                                    className="inline-flex items-center rounded-full border border-transparent bg-yellow-500 p-3 text-white 
                                                                    shadow-sm hover:bg-yellow-400 dark:hover:bg-yellow-600"
                                  >
                                    <PencilIcon className="h-6 w-6" aria-hidden="true" />
                                  </button>
                                )}

                                {seatedSection.edited && editMode && (
                                  <a data-tip data-for="seated" className="w-full md:w-fit">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        cancelSeatedEdit(seatedSection);
                                      }}
                                      className="inline-flex items-center rounded-full border border-transparent bg-sky-500 p-3 text-white 
                                                                    shadow-sm hover:bg-sky-400 dark:hover:bg-sky-600"
                                    >
                                      <RefreshIcon className="h-6 w-6" aria-hidden="true" />
                                    </button>
                                  </a>
                                )}

                                {seatedSection.edited && editMode && (
                                  <ReactTooltip id="seated" aria-haspopup="true">
                                    <p className="mb-4 text-lg">Old information</p>
                                    <ul>
                                      <li className="text-md font-bold">Name: {seatedSection.oldName} </li>
                                      <li className="text-md font-bold">Door: {seatedSection.oldDoor}</li>
                                    </ul>
                                  </ReactTooltip>
                                )}
                              </div>
                            </>
                          )}

                          {seatedSection.toRemove && editMode && (
                            <button
                              type="button"
                              onClick={() => {
                                cancelRemoveSeatedSection(seatedSection);
                              }}
                              className="mt-3 flex w-32 justify-center rounded-lg border border-transparent bg-sky-600 px-2 py-2 text-sm 
                                                            font-medium text-white shadow-sm hover:bg-sky-400 dark:bg-sky-600 dark:text-gray-200 dark:hover:bg-sky-500"
                            >
                              <p>Recover</p>
                            </button>
                          )}
                        </div>
                      </div>
                    </AccordionHeader>

                    <AccordionBody
                      className={`mb-0 h-96 w-full w-full overflow-y-auto py-6 
                                                scrollbar-thin scrollbar-track-gray-200 scrollbar-thumb-gray-400 scrollbar-track-rounded-lg scrollbar-thumb-rounded-lg 
                                                ${seatedSection.subSections.length > 3 ? "pr-4" : "pr-0"}`}
                    >
                      <div
                        key={key}
                        className="col-span-1 w-full divide-y
                                                                    divide-gray-800 rounded-lg  border-0 bg-gray-100 shadow dark:divide-gray-200 dark:bg-gray-600"
                      >
                        {seatedSection.subSections.map((subSection, key) => (
                          <div key={key} className="relative flex h-full w-full flex-wrap items-center justify-between space-x-1 p-6 md:flex-nowrap">
                            {/* Deleted badge */}
                            {subSection.toRemove && !seatedSection.toRemove && (
                              <div className="absolute -top-1 left-1 rounded-full bg-red-500 px-3 py-1 text-sm font-bold text-black dark:bg-red-800">To remove</div>
                            )}

                            {/* New badge */}
                            {subSection.new && !seatedSection.toRemove && (
                              <div
                                className={`absolute ${subSection.toRemove || subSection.edited ? "left-24" : "left-1"} -top-1 rounded-full bg-sky-500 px-3 py-1 text-sm 
                                                         font-bold text-black`}
                              >
                                New
                              </div>
                            )}

                            {/* Edited badge */}
                            {subSection.edited && !seatedSection.toRemove && <div className="absolute -top-1 left-1  rounded-full bg-yellow-500 px-3 py-1 text-sm font-bold text-black">Edited</div>}
                            <div className=" relative z-10 flex h-full flex-wrap truncate py-2">
                              <div className="relative flex flex-wrap">
                                <div className="text-md flex w-full justify-start truncate font-medium">
                                  <h1 className="text-md mr-2 text-gray-700 dark:text-gray-300"> Row: </h1>
                                  <h1 className="dark:text-gray-200 ">{subSection.row}</h1>
                                </div>

                                <div className="text-md flex w-full justify-start truncate font-medium">
                                  <h1 className="mr-2 text-gray-700 dark:text-gray-300"> Capacity: </h1>
                                  <h1 className="dark:text-gray-200">{subSection.capacity}</h1>
                                </div>
                              </div>
                            </div>

                            {!seatedSection.toRemove && !subSection.toRemove && !subSection.edited && editMode && (
                              <div className="mt-6 grid w-full grid-cols-2 gap-6 md:mt-0 md:w-fit md:grid-cols-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    removeSubSectionFromSeated(seatedSection, subSection);
                                  }}
                                  className="col-span-1 flex justify-center rounded-lg border border-transparent bg-red-600 px-2 py-2 text-sm
                                                                        font-medium text-white shadow-sm hover:bg-red-400 dark:bg-red-700 dark:text-gray-200 dark:hover:bg-red-500"
                                >
                                  <p>Delete</p>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    toggleEditSubSectionSeated(seatedSection, subSection);
                                  }}
                                  className="col-span-1 flex items-center justify-center rounded-lg border border-transparent bg-yellow-500 px-2 py-2 
                                                                            text-sm font-medium text-white shadow-sm hover:bg-yellow-400"
                                >
                                  <p>Edit</p>
                                </button>
                              </div>
                            )}

                            {subSection.edited && editMode && (
                              <a data-tip data-for="seated" className="mt-6 w-full sm:mt-0 md:w-fit">
                                <button
                                  id="editedButton"
                                  type="button"
                                  onClick={() => {
                                    cancelEditSubSeatedSection(seatedSection, subSection);
                                  }}
                                  className="flex w-full items-center justify-center rounded-lg border border-transparent bg-sky-500 px-2 py-2 text-sm font-medium
                                                                        text-white shadow-sm hover:bg-sky-400 dark:text-gray-200 md:w-fit "
                                >
                                  <p>Cancel edition</p>
                                </button>
                              </a>
                            )}

                            {subSection.edited && editMode && (
                              <ReactTooltip id="seated" aria-haspopup="true">
                                <p className="mb-4 text-lg">Old information</p>
                                <ul>
                                  <li className="text-md font-bold">Row: {subSection.oldRow} </li>
                                  <li className="text-md font-bold">Capacity: {subSection.oldCapacity}</li>
                                </ul>
                              </ReactTooltip>
                            )}

                            {!seatedSection.toRemove && subSection.toRemove && editMode && (
                              <button
                                type="button"
                                onClick={() => {
                                  cancelRemoveSubSection(seatedSection, subSection);
                                }}
                                className="mt-6 flex w-full justify-center rounded-lg border border-transparent bg-sky-600 px-2 py-2 text-sm font-medium text-white 
                                                                    shadow-sm hover:bg-sky-400 dark:bg-sky-600 dark:text-gray-200 dark:hover:bg-sky-500 sm:mt-0 md:w-fit"
                              >
                                <p>Recover</p>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </AccordionBody>
                  </Accordion>
                </div>
              ))}
            </ul>
          )}

          {/* CREATE A SECTION PAGE */}
          {isOpenInsertionSeatedPage && (
            <InsertSeatedPage
              togglePage={toggleInsertionSeatedPage}
              addSection={addSeatedSection}
              isSectionNameAvailable={isSectionNameAvailable}
              validateSection={validateSeatedSectionInfo}
              validateSubSection={validateSubSeatedSectionInfo}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default StructureDetails;
