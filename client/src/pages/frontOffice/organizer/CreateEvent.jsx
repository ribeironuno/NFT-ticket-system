import { useState, Fragment, useEffect } from "react";
import { Toaster, toast, ToastBar } from "react-hot-toast";
import ReactTooltip from "react-tooltip";
import Toast, { ToastType } from "../../../components/generic/Toast";
import { ethers } from "ethers";
import jwt_decode from "jwt-decode";
import ReactLoading from "react-loading";
import { HiX } from "react-icons/hi";
import { Dialog, Transition } from "@headlessui/react";
import { PlusIcon, XIcon } from "@heroicons/react/outline";
import { InformationCircleIcon } from "@heroicons/react/solid";
import constants from "../../../configs/constants";
import moment from "moment/moment";

export const imageType = {
  EVENT_IMAGE: 1,
  SECTION_IMAGE: 2,
};

export const durationType = {
  ONE_DAY: 1,
  MULTIPLE_DAYS: 2,
};

export const origin = {
  STRUCT: 1,
  GROUP: 2,
};

export const validationType = {
  VALIDATORS: 1,
  HASH: 2,
  BOTH: 3,
};

export const CreateEvent = () => {
  // #################### DATA VALIDATION  ####################
  const regexEmail = new RegExp(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/);
  const regexNumbers = new RegExp("^[+]?[(]?[0-9]{3}[)]?[-s.]?[0-9]{3}[-s.]?[0-9]{4,6}$");
  const regexDate = new RegExp(
    /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/
  );
  const regexNumberTickets = new RegExp(/^[1-9][0-9]*$/);
  const regexTime = new RegExp(/^([01]?[0-9]|2[0-3])h[0-5][0-9]$/);
  const regexUrl = new RegExp(
    /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/
  );

  // #################### USE STATES (INIT)  ####################

  //track the option chosen by organizer about using a image to the NFT or multiple by section
  const [imageTypeChosen, setImageTypeChosen] = useState(imageType.EVENT_IMAGE);
  //track the option chosen by organizer about the duration of the event (one day or multiple)
  const [durationTypeChosen, setDurationTypeChosen] = useState(durationType.ONE_DAY);
  //track the option chosen by organizer about validation type (validators, hash or both)
  const [validationTypeChosen, setValidationTypeChosen] = useState(validationType.VALIDATORS);
  //total groups of validators associated with the organizer
  const [totalGroups, setTotalGroups] = useState([]);
  //total groups static, its used to recover information in case of organizer resets the validation type
  const [groupsChosen, setGroupsChosen] = useState([]);
  //structures of organizer
  const [structuresOfOrganizer, setStructuresOfOrganizer] = useState([]);
  //tracks the struct chosen
  const [structChosen, setStructChosen] = useState({});
  const [isLoadingStructures, setIsLoadingStructures] = useState(false);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [maticPrice, setMaticPrice] = useState();
  const [statusAccount, setStatusAccount] = useState();

  const [showImageOn, setShowImageOn] = useState(true);

  function getStatusAccount() {
    fetch(constants.URL_ORGANIZERS + "information-account", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(res.status);
        else return res.json();
      })
      .then((data) => {
        if (data.statusAccount === "Banned") {
          Toast("Your account was banned!", "Validators groups information are read-only", ToastType.DANGER);
        }
        setStatusAccount(data.statusAccount);
      })
      .catch((error) => {
        Toast("Error getting your data", "Try again later", ToastType.DANGER);
        console.log(error);
      });
  }

  useEffect(() => {
    updateMaticPrice();
    getStatusAccount();
  }, []);

  // #################### INFO MANIPULATION ####################

  //info about the event
  const [eventInfo, setEventInfo] = useState({
    eventName: "",
    location: "",
    country: "",
    ageRestriction: "",
    category: "",
    maxTicketsPerPerson: "",
    description: "",
    nftDistribution: "event_level",
    eventNFT: "",
    datesInfo: {
      duration: "one_day",
      startDate: {
        date: "",
        startTime: "",
        endTime: "",
      },
    },
    banner: "",
    floorPlan: "",
    webSite: "",
    contacts: [],
    emails: [],
    validation: {
      type: "validators",
      validators: [],
    },
  });

  //additional info control
  const [contactInput, setContactInput] = useState("");
  const [emailInput, setEmailInput] = useState("");

  /**
   * Adds a new contact to the array of contact in event info
   */
  function addContact(newContact) {
    if (eventInfo.contacts.indexOf(newContact) !== -1) {
      Toast("Bad contact", "Repeated contact", ToastType.DANGER);
      return;
    }
    if (!regexNumbers.test(newContact)) {
      Toast("Bad contact", "The contact must be in format +XXXYYYYYYYYY", ToastType.DANGER);
      return;
    }
    setContactInput("");
    var tmp = eventInfo.contacts.slice();
    tmp.push(newContact);
    setEmailInput("");
    setEventInfo({
      ...eventInfo,
      contacts: tmp,
    });
  }

  /**
   * Removes a contact from the array of contacts of eventx
   */
  function removeContact(contactToRemove) {
    var tmp = eventInfo.contacts.filter((contact) => contact !== contactToRemove);
    setEventInfo({
      ...eventInfo,
      contacts: tmp,
    });
  }

  /**
   * Adds a new email to the array of emails in event info
   */
  function addEmail(newEmail) {
    if (eventInfo.emails.indexOf(newEmail) !== -1) {
      Toast("Bad email", "Repeated email", ToastType.DANGER);
      return;
    }
    if (!regexEmail.test(newEmail)) {
      Toast("Bad email", "The format is incorrect", ToastType.DANGER);
      return;
    }
    var tmp = eventInfo.emails.slice();
    tmp.push(newEmail);
    setEmailInput("");
    setEventInfo({
      ...eventInfo,
      emails: tmp,
    });
  }

  /**
   * Removes a email from the array of contacts of event
   */
  function removeEmail(emailToRemove) {
    var tmp = eventInfo.emails.filter((email) => email !== emailToRemove);
    setEventInfo({
      ...eventInfo,
      emails: tmp,
    });
  }

  /**
   * Handles the work to need to change the validation type.
   * Recreates the object 'validation' on event information object
   */
  function changeValidationType(validationTypeToChange) {
    var newObject = {};
    if (validationTypeToChange === validationType.VALIDATORS) {
      newObject.type = "validators";
      newObject.validators = [];
    } else if (validationTypeToChange === validationType.HASH) {
      newObject.type = "hash";
      newObject.hashes = [];
    } else {
      newObject.type = "both";
      newObject.validators = [];
      newObject.hashes = [];
    }
    setValidationTypeChosen(validationTypeToChange);
    setEventInfo({
      ...eventInfo,
      validation: newObject,
    });
  }

  /**
   * Given a new type of image, execute the process of changing
   */
  function changeTypeNFT(newType) {
    setImageTypeChosen(newType);
    var tmpEventInfo = { ...eventInfo };
    //to change to the event image, we need to delete the nft in the section if there is a section associated
    if (newType === imageType.EVENT_IMAGE) {
      tmpEventInfo.eventNFT = "";
      tmpEventInfo.nftDistribution = "event_level";
      //check if the structure was not associated
      if (tmpEventInfo.structure) {
        //for all section will remove the section nft value
        var tmp = { ...tmpEventInfo.structure };
        tmp.nonSeatedSections.forEach((section) => {
          delete section.sectionNFT;
          delete section.sectionblob;
          console.log("section", section);
        });

        /**
         * Given a group adds it to the chosen group, and removes it from the total array
         */
        function addGroup(groupToAdd) {
          //adds to the event object

          console.log(groupToAdd);

          var tmValidatorsArr = eventInfo.validation.validators.slice();
          tmValidatorsArr.push({ validatorsGroupName: groupToAdd.validatorsGroupName, groupId: groupToAdd.groupId });

          var newValidationObj = JSON.parse(JSON.stringify(eventInfo.validation));
          newValidationObj.validators = tmValidatorsArr;

          setEventInfo({
            ...eventInfo,
            validation: newValidationObj,
          });
          console.log(totalGroups);
          let tmp = [];
          totalGroups.forEach((group) => {
            if (group.validatorsGroupName !== groupToAdd.validatorsGroupName) {
              tmp.push(group);
            }
          });
          console.log(totalGroups);
          setTotalGroups(tmp);
          console.log(tmp);
        }

        tmp.seatedSections.forEach((section) => {
          delete section.sectionNFT;
          delete section.sectionNFTblob;
        });
        tmpEventInfo.structure = tmp;
      }
      setEventInfo(tmpEventInfo);
    } else {
      delete tmpEventInfo.eventNFT;
      delete tmpEventInfo.eventNFTblob;
      tmpEventInfo.nftDistribution = "section_level";
      //check if the event was not associated
      if (tmpEventInfo.structure) {
        tmp = { ...tmpEventInfo.structure };
        tmp.nonSeatedSections.forEach((section) => {
          section.sectionNFT = "";
        });

        tmp.seatedSections.forEach((section) => {
          section.sectionNFT = "";
        });
        tmpEventInfo.structure = tmp;
      }
      setEventInfo(tmpEventInfo);
    }
  }

  function changeDurationType(newType) {
    setDurationTypeChosen(newType);
    var tmpEventInfo = { ...eventInfo };

    if (newType === durationType.ONE_DAY) {
      var newOneDayDatesInfo = {
        duration: "one_day",
        startDate: {
          date: "",
          startTime: "",
          endTime: "",
        },
      };
      tmpEventInfo.datesInfo = newOneDayDatesInfo;
    } else {
      var newMultipleDaysDatesInfo = {
        duration: "multiple_days",
        startDate: {
          date: "",
          startTime: "",
        },
        endDate: {
          date: "",
          endTime: "",
        },
      };
      tmpEventInfo.datesInfo = newMultipleDaysDatesInfo;
    }
    setEventInfo(tmpEventInfo);
  }

  /**
   * Given a group adds it to the chosen group, and removes it from the total array
   */
  function addGroup(groupToAdd) {
    //adds to the event object
    var tmValidatorsArr = eventInfo.validation.validators.slice();
    tmValidatorsArr.push({ validatorsGroupName: groupToAdd.validatorsGroupName, groupId: groupToAdd.groupId });

    var newValidationObj = JSON.parse(JSON.stringify(eventInfo.validation));
    newValidationObj.validators = tmValidatorsArr;

    setEventInfo({
      ...eventInfo,
      validation: newValidationObj,
    });

    let tmp = [];
    totalGroups.forEach((group) => {
      if (group.validatorsGroupName !== groupToAdd.validatorsGroupName) {
        tmp.push(group);
      }
    });
    setTotalGroups(tmp);
  }

  /**
   * Removes a group from the chosen group, and adds it to the total array
   */
  function removeGroup(groupToRemove) {
    var newValidationObj = JSON.parse(JSON.stringify(eventInfo.validation));
    var tmpChosenArr = [];

    eventInfo.validation.validators.forEach((group) => {
      if (group !== groupToRemove) {
        tmpChosenArr.push(group);
      }
    });
    newValidationObj.validators = tmpChosenArr;

    setEventInfo({
      ...eventInfo,
      validation: newValidationObj,
    });
  }

  /**
   * Associates the struct to the event.
   * Adds to the event struct.
   */
  function associateStruct(struct) {
    var tmpEventInfo = { ...eventInfo };
    var cleanStruct = JSON.parse(JSON.stringify(struct));

    //if the image type chosen is setting a nft for section so deletes the eventNFT
    if (imageTypeChosen === imageType.SECTION_IMAGE) {
      delete tmpEventInfo.eventNFT;
    }

    //adds the new information (nft ticket image (optional), ticket price, and tickets number
    cleanStruct.nonSeatedSections.forEach((nonSeated) => {
      if (imageTypeChosen === imageType.SECTION_IMAGE) {
        nonSeated.sectionNFT = "";
      }
      nonSeated.price = "";
      nonSeated.numTickets = "";
    });
    //in the seated, the nft stays associated with the section, and the price and the number with the subsection
    cleanStruct.seatedSections.forEach((seated) => {
      if (imageTypeChosen === imageType.SECTION_IMAGE) {
        seated.sectionNFT = "";
      }
      seated.subSections.forEach((subSection) => {
        subSection.price = "";
        subSection.numTickets = "";
      });
    });

    tmpEventInfo.structure = cleanStruct;
    setEventInfo(tmpEventInfo);
    setStructChosen(cleanStruct);
    toggleModal();
  }

  /**
   * Checks if a image is valid
   */
  async function validateImgFile(e) {
    const file = e.target.files[0];
    const name = e.target.name;

    //check types
    if (file.type !== "image/png" && file.type !== "image/jpeg" && file.type !== "image/jpg") {
      Toast("Bad input", "Only allowed png, jpeg and jpg", ToastType.DANGER);
      return false;
    }
    //check size
    if (file.size > 5 * 1024 * 1024) {
      Toast("Bad input", "Size allowed only until 5MB", ToastType.DANGER);
      return false;
    }
    //check width x height
    const reader = new FileReader();
    reader.readAsDataURL(file);
    let flag;
    reader.onload = () => {
      const image = new Image();
      image.src = reader.result;
      image.onload = () => {
        const width = image.naturalWidth;
        const height = image.naturalHeight;

        console.log(width);
        console.log(height);

        if (name === "banner") {
          if (width < 1000 || width > 1200 || height < 600 || height > 700) {
            Toast("Bad input", "Banner image boundaries are weight [1000px - 1200px] and height [600px - 700px]", ToastType.DANGER);
            setEventInfo({
              ...eventInfo,
              banner: "",
              bannerblob: "",
            });
            e.target.value = "";
            flag = false;
          } else {
            flag = true;
          }
        } else if (name === "floorPlan") {
          if (width < 400 || width > 600 || height < 400 || height > 600) {
            Toast("Bad input", "Flor plan image boundaries are weight [400px - 600px] and height [400px - 600px]", ToastType.DANGER);
            setEventInfo({
              ...eventInfo,
              floorPlan: "",
              floorPlanblob: "",
            });
            e.target.value = "";
            flag = false;
          } else {
            flag = true;
          }
        } else {
          if (width < 400 || width > 600 || height < 400 || height > 600) {
            Toast("Bad input", "NFT image boundaries are weight [400px - 600px] and height [400px - 600px]", ToastType.DANGER);
            setEventInfo({
              ...eventInfo,
              eventNFT: "",
              eventNFTblob: "",
            });
            e.target.value = "";
            flag = false;
          } else {
            flag = true;
          }
        }
      };
    };
    return true;
  }

  /**
   * Adds a image to a non seated
   */
  async function addNonSeatedNFT(event, indexSection) {
    if (!validateImgFile(event)) {
      event.target.value = "";
      var tmpStructure = { ...eventInfo };
      tmpStructure.structure.nonSeatedSections[indexSection].sectionNFTblob = "";
      tmpStructure.structure.nonSeatedSections[indexSection].sectionNFTbase64 = "";
      tmpStructure.structure.nonSeatedSections[indexSection].sectionNFT = "";
      setEventInfo(tmpStructure);
      return;
    }

    getBase64(event.target.files[0])
      .then((base64) => {
        let cleanBase64 = base64.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
        tmpStructure.structure.nonSeatedSections[indexSection].sectionNFTbase64 = cleanBase64;
      })
      .catch((error) => console.error(error));
    var tmpStructure = { ...eventInfo };
    tmpStructure.structure.nonSeatedSections[indexSection].sectionNFTblob = URL.createObjectURL(event.target.files[0]);
    tmpStructure.structure.nonSeatedSections[indexSection].sectionNFT = event.target.files[0];
    setEventInfo(tmpStructure);
  }

  /**
   * Adds a image to a seated
   */
  async function addSeatedNFT(event, indexSection) {
    if (!validateImgFile(event)) {
      event.target.value = "";
      var tmpStructure = { ...eventInfo };
      tmpStructure.structure.seatedSections[indexSection].sectionNFTblob = "";
      tmpStructure.structure.seatedSections[indexSection].sectionNFT = "";
      tmpStructure.structure.seatedSections[indexSection].sectionNFTbase64 = "";
      setEventInfo(tmpStructure);
      return;
    }

    getBase64(event.target.files[0])
      .then((base64) => {
        let cleanBase64 = base64.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
        tmpStructure.structure.seatedSections[indexSection].sectionNFTbase64 = cleanBase64;
      })
      .catch((error) => console.error(error));
    var tmpStructure = { ...eventInfo };
    tmpStructure.structure.seatedSections[indexSection].sectionNFTblob = URL.createObjectURL(event.target.files[0]);
    tmpStructure.structure.seatedSections[indexSection].sectionNFT = event.target.files[0];
    setEventInfo(tmpStructure);
  }

  /**
   * Handles the input given by user
   */
  const inputHandle = (e) => {
    //if has files
    if (e.target.files) {
      if (!validateImgFile(e)) {
        e.target.value = "";
        setEventInfo({
          ...eventInfo,
          [e.target.name + "blob"]: "",
          [e.target.name]: "",
        });
        return;
      }

      setEventInfo({
        ...eventInfo,
        [e.target.name + "blob"]: URL.createObjectURL(e.target.files[0]),
        [e.target.name]: e.target.files[0],
      });
    } else {
      setEventInfo({
        ...eventInfo,
        [e.target.name]: e.target.value,
      });
    }
  };

  /**
   * Handles the set of a price in a non seated section
   *
   * @param {Number} price to be set (0.00 format and > 0.01)
   */
  function inputHandlePriceSeated(price, sectionIndex, rowIndex) {
    var tmpStructure = { ...eventInfo };
    var floatPrice = parseFloat(price);
    if (!Number.isNaN(floatPrice)) {
      tmpStructure.structure.seatedSections[sectionIndex].subSections[rowIndex].price = floatPrice;
      setEventInfo(tmpStructure);
    }
  }

  /**
   * Handles
   */
  function inputHandleOneDayDate(e) {
    if (e.target.name === "date") {
      console.log(e.target.value);
      const date = moment(e.target.value, "YYYY-MM-DD");
      const formatedDate = date.format("DD-MM-YYYY");
      var tmpEvent = { ...eventInfo };
      tmpEvent.datesInfo.startDate[e.target.name] = formatedDate;
      setEventInfo(tmpEvent);
    } else {
      var tmpEvent = { ...eventInfo };
      tmpEvent.datesInfo.startDate[e.target.name] = e.target.value.replace(":", "h");
      setEventInfo(tmpEvent);
    }
  }

  /**
   * Handles
   */
  function inputHandleMultipleDaysDate(isStartDate, e) {
    var tmpEvent = { ...eventInfo };

    if (isStartDate) {
      if (e.target.name === "date") {
        const date = moment(e.target.value, "YYYY-MM-DD").format("DD-MM-YYYY");
        var tmpEvent = { ...eventInfo };
        tmpEvent.datesInfo.startDate[e.target.name] = date;
        setEventInfo(tmpEvent);
      } else {
        var tmpEvent = { ...eventInfo };
        tmpEvent.datesInfo.startDate[e.target.name] = e.target.value.replace(":", "h");
        setEventInfo(tmpEvent);
      }
    } else {
      if (e.target.name === "date") {
        const date = moment(e.target.value, "YYYY-MM-DD").format("DD-MM-YYYY");
        var tmpEvent = { ...eventInfo };
        tmpEvent.datesInfo.endDate[e.target.name] = date;
        setEventInfo(tmpEvent);
      } else {
        var tmpEvent = { ...eventInfo };
        tmpEvent.datesInfo.endDate[e.target.name] = e.target.value.replace(":", "h");
        setEventInfo(tmpEvent);
      }
    }
  }

  /**
   * Handles the set of the total tickets
   *
   * @param {Number} ticket number > 0
   */
  function inputHandleTicketsSeated(numTickets, sectionIndex, rowIndex) {
    var tmpStructure = { ...eventInfo };
    var numTicketsInt = parseInt(numTickets);
    if (!Number.isNaN(numTicketsInt)) {
      tmpStructure.structure.seatedSections[sectionIndex].subSections[rowIndex].numTickets = numTicketsInt;
      setEventInfo(tmpStructure);
    }
  }

  /**
   * Handles the set of a price in a non seated section
   *
   * @param {Number} price to be set (0.00 format and > 0.01)
   */
  function inputHandlePriceNonSeated(price, sectionIndex) {
    var tmpStructure = { ...eventInfo };
    var floatPrice = parseFloat(price);
    if (!Number.isNaN(floatPrice)) {
      tmpStructure.structure.nonSeatedSections[sectionIndex].price = floatPrice;
      setEventInfo(tmpStructure);
    }
  }

  function cleanNonSeatedPrice(sectionIndex) {
    var tmpStructure = { ...eventInfo };
    tmpStructure.structure.nonSeatedSections[sectionIndex].price = "";
    setEventInfo(tmpStructure);
  }

  function cleanNonSeatedTickets(sectionIndex) {
    var tmpStructure = { ...eventInfo };
    tmpStructure.structure.nonSeatedSections[sectionIndex].tickets = "";
    setEventInfo(tmpStructure);
  }

  function cleanSeatedPrice(sectionIndex, rowIndex) {
    var tmpStructure = { ...eventInfo };
    tmpStructure.structure.seatedSections[sectionIndex].subSections[rowIndex].price = "";
    setEventInfo(tmpStructure);
  }

  function cleanSeatedTickets(sectionIndex, rowIndex) {
    var tmpStructure = { ...eventInfo };
    tmpStructure.structure.seatedSections[sectionIndex].subSections[rowIndex].numTickets = "";
    setEventInfo(tmpStructure);
  }

  /**
   * Handles the set of the total tickets
   *
   * @param {Number} ticket number > 0
   */
  function inputHandleTicketsNonSeated(numTickets, sectionIndex) {
    var tmpStructure = { ...eventInfo };
    var numTicketsInt = parseInt(numTickets);
    if (!Number.isNaN(numTicketsInt)) {
      tmpStructure.structure.nonSeatedSections[sectionIndex].numTickets = numTicketsInt;
      setEventInfo(tmpStructure);
    }
  }

  // #################### MODAL  ####################

  //Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [originModal, setOriginModal] = useState(false);

  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  const urlStructures = constants.URL_STRUCTURES;
  const urlGroups = constants.URL_VALIDATORSGROUP;
  const urlEvent = constants.URL_EVENTS;

  //decode the token and get id
  var decodedJwt = jwt_decode(localStorage.getItem("token"));
  var id = decodedJwt[constants.ID_DECODE];

  /**
   * Toggles the modal about groups and structures
   */
  function toggleModal(origin) {
    setOriginModal(origin);
    setIsModalOpen(!isModalOpen);

    if (origin === "struct") {
      setIsLoadingStructures(true);
      //gets the organizer structures
      fetch(urlStructures + `getAll?organizerId=${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
        .then((res) => {
          setIsLoadingStructures(false);
          if (!res.ok) throw new Error(res.status);
          else return res.json();
        })
        .then((data) => {
          setIsLoadingStructures(false);
          setStructuresOfOrganizer(data);
        })
        .catch((err) => {
          setIsLoadingStructures(false);
          console.log(err.message);
        });
    } else {
      setIsLoadingGroups(true);
      //gets the organizer validatos
      fetch(urlGroups + `getAll?organizerId=${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
        .then((res) => {
          setIsLoadingGroups(false);
          if (!res.ok) throw new Error(res.status);
          else return res.json();
        })
        .then((data) => {
          setIsLoadingGroups(false);
          if (!eventInfo.validation) {
            setTotalGroups(data);
          } else {
            let tmp = [];
            data.forEach((group) => {
              let flag = true;
              eventInfo.validation.validators.forEach((groupEvent) => {
                if (group.validatorsGroupName === groupEvent.validatorsGroupName) {
                  flag = false;
                }
              });
              if (flag) {
                tmp.push(group);
              }
            });
            setTotalGroups(tmp);
            console.log(tmp);
          }
        })
        .catch((err) => {
          setIsLoadingGroups(false);
          console.log(err.message);
        });
    }
  }

  function updateMaticPrice() {
    fetch("https://min-api.cryptocompare.com/data/price?fsym=MATIC&tsyms=EUR&api_key=75f02885dbeb28e0b3246d853c034710651551458928107c735e28b37afbe814")
      .then((res) => {
        if (!res.ok) throw new Error(res.status);
        else return res.json();
      })
      .then((data) => {
        setMaticPrice(data.EUR);
      })
      .catch((err) => {
        console.log(err.message);
      });
  }

  /**
   * Toggles the info modal
   *
   */
  function toggleInfoModal() {
    setIsInfoModalOpen(!isInfoModalOpen);
  }

  // #################### SUBMIT  ####################

  function validatePrice(price) {
    return price > 0.000000000000000001;
  }

  function isValidForm() {
    let message = "";

    if (statusAccount !== "Active") {
      message = "Your account should be valid!";
      Toast("Bad input", message, ToastType.DANGER);
      return false;
    }

    if (eventInfo.eventName.length < 5) {
      message = "Invalid event name, should have at least 5 characters";
      Toast("Bad input", message, ToastType.DANGER);
      return false;
    }

    if (eventInfo.location.length < 3) {
      message = "Invalid location, should have at least 3 characters";
      Toast("Bad input", message, ToastType.DANGER);
      return false;
    }
    if (eventInfo.location.length < 3) {
      message = "Invalid location, should have at least 3 characters";
      Toast("Bad input", message, ToastType.DANGER);
      return false;
    }
    if (eventInfo.country === "" || eventInfo.country === "-- Country --") {
      message = "Invalid country, choose one";
      Toast("Bad input", message, ToastType.DANGER);
      return false;
    }
    if (eventInfo.ageRestriction === "" || eventInfo.ageRestriction === "-- Allowed age --") {
      message = "Invalid age restriction, choose one";
      Toast("Bad input", message, ToastType.DANGER);
      return false;
    }
    if (eventInfo.category === "" || eventInfo.category === "-- Category --") {
      message = "Invalid category, choose one";
      Toast("Bad input", message, ToastType.DANGER);
    }
    if (eventInfo.maxTicketsPerPerson !== "" && !regexNumberTickets.test(eventInfo.maxTicketsPerPerson)) {
      message = "Invalid max number of tickets, should be a integer >= 0";
      Toast("Bad input", message, ToastType.DANGER);
      return false;
    }

    if (eventInfo.description.length < 30) {
      message = "Invalid description, should have at least 30 characters";
      Toast("Bad input", message, ToastType.DANGER);
      return false;
    }

    //date check one day
    if (eventInfo.datesInfo.duration === "one_day") {
      if (eventInfo.datesInfo.startDate.date === "" || eventInfo.datesInfo.startDate.startTime === "" || eventInfo.datesInfo.startDate.endTime === "") {
        message = "Missing fields in date";
        Toast("Bad input", message, ToastType.DANGER);
        return false;
      }

      if (!regexDate.test(eventInfo.datesInfo.startDate.date)) {
        message = "Date must be in type DD/MM/YYYY";
        Toast("Bad input", message, ToastType.DANGER);
        return false;
      }
      if (!regexTime.test(eventInfo.datesInfo.startDate.startTime)) {
        message = "Invalid start time. Example: 22h30";
        Toast("Bad input", message, ToastType.DANGER);
        return false;
      }
      if (!regexTime.test(eventInfo.datesInfo.startDate.endTime)) {
        message = "Invalid end time. Example: 22h30";
        Toast("Bad input", message, ToastType.DANGER);
        return false;
      }

      //check date validation
      const currentDate = moment();
      const formattedDate = currentDate.format("DD-MM-YYYY HH:mm:ss");
      var current = moment(formattedDate, "DD-MM-YYYY HH:mm:ss");
      var startDateTime = eventInfo.datesInfo.startDate.date + " " + eventInfo.datesInfo.startDate.startTime.replace("h", ":") + ":00";
      var startDateTotal = moment(startDateTime, "DD-MM-YYYY HH:mm:ss");
      var duration = moment.duration(current.diff(startDateTotal));

      if (duration.asHours() >= -4) {
        message = "The event must starts, at least, in 4 hours.";
        Toast("Bad input", message, ToastType.DANGER);
        return false;
      }

      let startTime = eventInfo.datesInfo.startDate.startTime.split("h");
      let endTime = eventInfo.datesInfo.startDate.endTime.split("h");

      if (endTime[0] < startTime[0]) {
        message = "End time must be after start time";
        Toast("Bad input", message, ToastType.DANGER);
        return false;
      }

      if (endTime[0] === startTime[0]) {
        if (endTime[1] <= startTime[1]) {
          message = "End time must be after start time";
          Toast("Bad input", message, ToastType.DANGER);
          return false;
        }
      }

      //date check multiple days
    } else {
      if (eventInfo.datesInfo.startDate.date === "" || eventInfo.datesInfo.startDate.startTime === "" || eventInfo.datesInfo.endDate.date === "" || eventInfo.datesInfo.endDate.endTime === "") {
        message = "Missing fields in date";
        Toast("Bad input", message, ToastType.DANGER);
        return false;
      }

      if (!regexDate.test(eventInfo.datesInfo.startDate.date)) {
        message = "Start date must be in type DD/MM/YYYY";
        Toast("Bad input", message, ToastType.DANGER);
        return false;
      }
      if (!regexDate.test(eventInfo.datesInfo.endDate.date)) {
        message = "End date must be in type DD/MM/YYYY";
        Toast("Bad input", message, ToastType.DANGER);
        return false;
      }
      if (!regexTime.test(eventInfo.datesInfo.startDate.startTime)) {
        message = "Invalid start time on start date. Example: 22h30";
        Toast("Bad input", message, ToastType.DANGER);
        return false;
      }
      if (!regexTime.test(eventInfo.datesInfo.endDate.endTime)) {
        message = "Invalid end time on end date. Example: 22h30";
        Toast("Bad input", message, ToastType.DANGER);
        return false;
      }

      //check date validation
      const startDate = moment(eventInfo.datesInfo.startDate.date, "DD-MM-YYYY").toDate();

      const endDate = moment(eventInfo.datesInfo.endDate.date, "DD-MM-YYYY").toDate();

      //future date
      const currentDate = moment();
      const formattedDate = currentDate.format("DD-MM-YYYY HH:mm:ss");
      var current = moment(formattedDate, "DD-MM-YYYY HH:mm:ss");
      var startDateTime = eventInfo.datesInfo.startDate.date + " " + eventInfo.datesInfo.startDate.startTime.replace("h", ":") + ":00";
      var startDateTotal = moment(startDateTime, "DD-MM-YYYY HH:mm:ss");
      var duration = moment.duration(current.diff(startDateTotal));

      //future date
      if (duration.asHours() >= -4) {
        message = "The event must starts, at least, in 4 hours.";
        Toast("Bad input", message, ToastType.DANGER);
        return false;
      }
      //not on the same day, and endDate > startDate
      if (endDate <= startDate) {
        message = "The end date must be after start date. If you want one day event choose the correct option";
        Toast("Bad input", message, ToastType.DANGER);
        return false;
      }
    }

    if (eventInfo.banner === "") {
      message = "Banner is missing";
      Toast("Bad input", message, ToastType.DANGER);
      return false;
    }
    if (eventInfo.floorPlan === "") {
      message = "Floor plan is missing";
      Toast("Bad input", message, ToastType.DANGER);
      return false;
    }
    if (imageTypeChosen === imageType.EVENT_IMAGE && eventInfo.eventNFT === "") {
      message = "Event NFT is missing";
      Toast("Bad input", message, ToastType.DANGER);
      return false;
    }
    if (eventInfo.webSite !== "" && !regexUrl.test(eventInfo.webSite)) {
      message = "Invalid website";
      Toast("Bad input", message, ToastType.DANGER);
      return false;
    }
    if (eventInfo.contacts.length === 0) {
      message = "One contact, minimum, is required";
      Toast("Bad input", message, ToastType.DANGER);
      return false;
    }
    if (eventInfo.emails.length === 0) {
      message = "One email, minimum, is required";
      Toast("Bad input", message, ToastType.DANGER);
      return false;

      //validations verification - if organizer chosen both or validators must have a group in array
    }
    if ((validationTypeChosen === validationType.BOTH || validationTypeChosen === validationType.VALIDATORS) && eventInfo.validation.validators.length === 0) {
      message = "There is no group of validators";
      Toast("Bad input", message, ToastType.DANGER);
      return false;
      //structure validation
    }
    if (!eventInfo.structure) {
      message = "It's necessary to import a structure";
      Toast("Bad input", message, ToastType.DANGER);
      return false;
    }
    if (eventInfo.structure) {
      //check for each non seated
      var tmp = eventInfo.structure.nonSeatedSections;
      for (let i = 0; i < tmp.length; i++) {
        if (!validatePrice(tmp[i].price)) {
          message = "Invalid price on unseated section: " + tmp[i].name;
          Toast("Bad input", message, ToastType.DANGER);
          return false;
        } else if (!regexNumberTickets.test(tmp[i].numTickets)) {
          message = "Invalid number of tickets on unseated section: " + tmp[i].name;
          Toast("Bad input", message, ToastType.DANGER);
          return false;
        } else if (imageTypeChosen === imageType.SECTION_IMAGE && tmp[i].sectionNFT === "") {
          message = "Missing NFT on unseated section: " + tmp[i].name;
          Toast("Bad input", message, ToastType.DANGER);
          return false;
        }
      }

      //check for each seated
      tmp = eventInfo.structure.seatedSections;
      for (let i = 0; i < tmp.length; i++) {
        for (let j = 0; j < tmp[i].length; j++) {
          if (imageTypeChosen === imageType.SECTION_IMAGE && tmp[i][j].sectionNFT === "") {
            Toast("Missing NFT on seated section: " + tmp[i][j].name);
            return false;
          }
          for (let k = 0; j < tmp[i][j].length; j++) {
            if (!validatePrice(tmp[i][j][k].price)) {
              Toast("Invalid price on seated section: " + tmp[i][j][k].name);
              return false;
            } else if (!regexNumberTickets.test(tmp[i][j][k].numTickets)) {
              Toast("Invalid number of tickets on seated section: " + tmp[i][j][k].name);
              return false;
            }
          }
        }
      }
    }
    return true;
  }

  // convert file to base64
  function getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }

  async function submit() {
    if (!isValidForm()) {
      return;
    }
    //create form data
    let formData = new FormData();
    formData.append("eventName", eventInfo.eventName);
    formData.append("location", eventInfo.location);
    formData.append("country", eventInfo.country);
    if (eventInfo.ageRestriction === "No restrictions") {
      formData.append("ageRestriction", "no_restriction");
    } else {
      let age = eventInfo.ageRestriction.split("+")[1];
      formData.append("ageRestriction", "plus_" + age);
    }
    formData.append("category", eventInfo.category);

    //max tickets is optional
    if (eventInfo.maxTicketsPerPerson !== "") {
      formData.append("maxTicketsPerPerson", eventInfo.maxTicketsPerPerson);
    }

    formData.append("description", eventInfo.description);

    //dates
    if (eventInfo.datesInfo.duration === "one_day") {
      //formData.append("datesInfo.duration", eventInfo.datesInfo.duration);

      formData.append("datesInfo.duration", "one_day");
      formData.append("datesInfo.startDate.dayMonthYear", eventInfo.datesInfo.startDate.date);
      formData.append("datesInfo.startDate.startTime", eventInfo.datesInfo.startDate.startTime);
      formData.append("datesInfo.startDate.endTime", eventInfo.datesInfo.startDate.endTime);
    } else {
      //formData.append("datesInfo.duration", eventInfo.datesInfo.duration);

      formData.append("datesInfo.duration", "multiple_days");
      formData.append("datesInfo.startDate.dayMonthYear", eventInfo.datesInfo.startDate.date);
      formData.append("datesInfo.startDate.startTime", eventInfo.datesInfo.startDate.startTime);

      formData.append("datesInfo.endDate.dayMonthYear", eventInfo.datesInfo.endDate.date);
      formData.append("datesInfo.endDate.endTime", eventInfo.datesInfo.endDate.endTime);
    }

    formData.append("banner", eventInfo.banner);
    formData.append("floorPlan", eventInfo.floorPlan);

    //website is optional
    if (eventInfo.webSite !== "") {
      formData.append("webSite", eventInfo.webSite);
    }

    eventInfo.contacts.forEach((contact) => {
      formData.append("contacts", contact);
    });

    eventInfo.emails.forEach((email) => {
      formData.append("emails", email);
    });

    //validators
    if (eventInfo.validation.type === "validators" || eventInfo.validation.type === "both") {
      formData.append("validation.validationType", eventInfo.validation.type);
      formData.append("validation.validators", JSON.stringify(eventInfo.validation.validators));
    } else {
      formData.append("validation.validationType", "hash");
    }

    //image type
    if (eventInfo.eventNFT) {
      formData.append("nftDistribution", "event_level");
      formData.append("eventNFT", eventInfo.eventNFT);
    } else {
      formData.append("nftDistribution", "section_level");
    }

    //structures
    formData.append("structure.name", eventInfo.structure.name);

    //for each non seated string parse
    eventInfo.structure.nonSeatedSections.forEach((section) => {
      let tmpSection = { ...section };
      delete tmpSection.sectionNFTblob;
      delete tmpSection.capacity;

      if (section.sectionNFT) {
        tmpSection.sectionNFT = tmpSection.sectionNFTbase64;
      }
      delete tmpSection.sectionNFTbase64;

      formData.append("structure.nonSeatedSections", JSON.stringify(tmpSection));
    });

    //for each non seated string parse
    eventInfo.structure.seatedSections.forEach(async (section) => {
      let tmpSection = { ...section };
      delete tmpSection.sectionNFTblob;

      section.subSections.forEach((subSection) => {
        delete subSection.capacity;
      });
      if (section.sectionNFT) {
        tmpSection.sectionNFT = tmpSection.sectionNFTbase64;
      }
      delete tmpSection.sectionNFTbase64;

      formData.append("structure.seatedSections", JSON.stringify(tmpSection));
    });

    //request

    fetch(urlEvent + "create", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      method: "POST",
      body: formData,
    })
      .then((data) => {
        data.json().then((json) => {
          switch (json.status) {
            case 200:
              Toast("Sucess", "Event created with success", ToastType.SUCCESS);
              //window.location.href = "/app/organizer/events"
              break;
            case 409:
              Toast("Bad input", "There is a event with the same hash", ToastType.DANGER);
              break;
            default:
              Toast("Bad input", "Some error occurred. Refresh and try again", ToastType.DANGER);
          }
          console.log(json);
        });
      })
      .catch((err) => {
        console.log(err.message);
      });
    console.log("submitJson", eventInfo);
  }

  return (
    <div>
      <div className="flex flex-wrap justify-center md:justify-between">
        <h1 className="text-3xl font-bold dark:text-gray-400 md:text-4xl">Create event</h1>
        <div className="flex w-full justify-center pt-8 md:justify-end">
          <button
            type="submit"
            className="ml-3 inline-flex justify-center rounded-md border border-transparent 
                        bg-green-600 py-2 px-6 text-sm font-medium text-white shadow-sm 
                        focus:outline-none hover:bg-green-700"
          >
            See my events
          </button>
        </div>
      </div>

      <hr className="mt-10 h-px w-full border-0 bg-gray-200 dark:bg-gray-400" />

      <div className="mt-8 flex w-full flex-wrap justify-center sm:justify-between">
        <div className="w-full sm:w-fit">
          <p className="mb-4 dark:text-white">After file chosen, on mouse hover in file input :</p>

          <div>
            <input
              type="radio"
              className="mr-4"
              value="true"
              onChange={(e) => {
                setShowImageOn(!showImageOn);
              }}
              checked={showImageOn}
            />
            <p className="inline text-black dark:text-white">Show images</p>
          </div>

          <div>
            <input
              type="radio"
              className="mr-4"
              value="false"
              onChange={(e) => {
                setShowImageOn(!showImageOn);
              }}
              checked={!showImageOn}
            />
            <p className="inline text-black dark:text-white">Hide images</p>
          </div>
        </div>
        <div className="mt-8 flex w-full flex-col sm:mt-0 sm:w-fit">
          <button
            type="submit"
            className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-6 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 hover:bg-indigo-700"
            onClick={submit}
          >
            Create the event
          </button>
        </div>
      </div>

      <div className="justify-center">
        <div className="flex w-full justify-end">
          <button
            type="button"
            onClick={() => {
              toggleInfoModal();
            }}
          >
            <InformationCircleIcon className="h-8 w-8 text-gray-500 dark:text-gray-400" aria-hidden="true" />
          </button>
        </div>
        <Toaster />
        <div className="mt-10 space-y-6">
          {/* PERSONAL/COMPANY INFORMATION */}
          <label className="animate-pulse text-lg font-bold text-indigo-500 dark:text-indigo-200 ">At the moment : 1 MATIC - {maticPrice}€</label>
          <div className="rounded-lg bg-white px-4 py-5 shadow dark:bg-gray-700 sm:p-6">
            <div className="lg:grid lg:grid-cols-4 lg:gap-6">
              <div className="lg:col-span-1">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-200">Basic information</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Basic information about the event.</p>
              </div>
              <div className="mt-5 md:col-span-3 md:mt-0">
                <div className="grid gap-6 sm:grid-cols-6">
                  <div className="sm:col-span-6 md:col-span-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Event name</label>
                    <input
                      type="text"
                      name="eventName"
                      value={eventInfo.eventName}
                      onChange={inputHandle}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white sm:text-sm"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={eventInfo.location}
                      onChange={inputHandle}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white sm:text-sm"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Country</label>
                    <select
                      name="country"
                      value={eventInfo.country}
                      onChange={inputHandle}
                      className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:bg-gray-600 dark:text-white sm:text-sm"
                    >
                      <option>-- Country --</option>
                      <option>Portugal</option>
                      <option>Spain</option>
                      <option>France</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Allowed age</label>
                    <select
                      name="ageRestriction"
                      value={eventInfo.ageRestriction}
                      onChange={inputHandle}
                      className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:bg-gray-600 dark:text-white sm:text-sm"
                    >
                      <option>-- Allowed age --</option>
                      <option>No restrictions</option>
                      <option>+4</option>
                      <option>+8</option>
                      <option>+12</option>
                      <option>+14</option>
                      <option>+16</option>
                      <option>+18</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Category</label>
                    <select
                      name="category"
                      value={eventInfo.category}
                      onChange={inputHandle}
                      className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:bg-gray-600 dark:text-white sm:text-sm"
                    >
                      <option>-- Category -- </option>
                      <option>Music</option>
                      <option>Sports</option>
                      <option>Comedy</option>
                      <option>Theatre</option>
                      <option>Cinema</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Max ticket per person (optional)</label>
                    <input
                      type="text"
                      name="maxTicketsPerPerson"
                      value={eventInfo.maxTicketsPerPerson}
                      onChange={inputHandle}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white sm:text-sm"
                    />
                  </div>

                  <div className="sm:col-span-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Description</label>
                    <div className="mt-1">
                      <textarea
                        rows={5}
                        name="description"
                        value={eventInfo.description}
                        onChange={inputHandle}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex justify-start sm:col-span-6">
                    <label className="mr-1 text-black dark:text-white">
                      <input
                        type="radio"
                        className="mr-2"
                        value="eventImage"
                        onChange={(e) => {
                          changeDurationType(durationType.ONE_DAY);
                        }}
                        checked={durationTypeChosen === durationType.ONE_DAY}
                      />
                    </label>
                    <label className="mt-0.5 mr-6 text-black dark:text-white">One day</label>

                    <label className="mr-1 text-black dark:text-white">
                      <input
                        type="radio"
                        className="my-auto mr-2"
                        value="sectionImages"
                        onChange={(e) => {
                          changeDurationType(durationType.MULTIPLE_DAYS);
                        }}
                        checked={durationTypeChosen === durationType.MULTIPLE_DAYS}
                      />
                    </label>
                    <label className="mt-0.5 text-black dark:text-white">Multiple days</label>
                  </div>

                  {durationTypeChosen === durationType.ONE_DAY && (
                    <>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Date</label>
                        <input
                          type="date"
                          name="date"
                          placeholder="12/12/2020"
                          onChange={inputHandleOneDayDate}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm placeholder:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white dark:placeholder:text-gray-900 sm:text-sm"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Start time</label>
                        <input
                          type="time"
                          name="startTime"
                          placeholder="22h30"
                          onChange={inputHandleOneDayDate}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm placeholder:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white dark:placeholder:text-gray-900 sm:text-sm"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">End time</label>
                        <input
                          type="time"
                          name="endTime"
                          placeholder="22h30"
                          onChange={inputHandleOneDayDate}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm placeholder:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white dark:placeholder:text-gray-900 sm:text-sm"
                        />
                      </div>
                    </>
                  )}

                  {durationTypeChosen === durationType.MULTIPLE_DAYS && (
                    <>
                      <div className="sm:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Start date</label>
                        <input
                          type="date"
                          name="date"
                          placeholder="12/12/2020"
                          onChange={(e) => {
                            inputHandleMultipleDaysDate(true, e);
                          }}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm placeholder:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white dark:placeholder:text-gray-900 sm:text-sm"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Start time</label>
                        <input
                          type="time"
                          name="startTime"
                          placeholder="22h30"
                          onChange={(e) => {
                            inputHandleMultipleDaysDate(true, e);
                          }}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm placeholder:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white dark:placeholder:text-gray-900 sm:text-sm"
                        />
                      </div>

                      <div className="mt-6 sm:col-span-3 sm:mt-0">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">End date</label>
                        <input
                          type="date"
                          name="date"
                          placeholder="15/12/2020"
                          onChange={(e) => {
                            inputHandleMultipleDaysDate(false, e);
                          }}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm placeholder:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white dark:placeholder:text-gray-900 sm:text-sm"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">End time</label>
                        <input
                          type="time"
                          name="endTime"
                          placeholder="12h30"
                          onChange={(e) => {
                            inputHandleMultipleDaysDate(false, e);
                          }}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm placeholder:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white dark:placeholder:text-gray-900 sm:text-sm"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* IMAGE */}
          <div className="rounded-lg bg-white px-4 py-5 shadow dark:bg-gray-700 sm:p-6">
            <div className="my-auto lg:grid lg:grid-cols-4 lg:gap-6">
              <div className="lg:col-span-1">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-200">Images</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Important images to the event. There is the need to choose between having a single image in all NFT's and having a unique image per section
                </p>
              </div>
              <div className="col-span-3 mt-14 lg:col-span-3 lg:mt-0">
                <div className="grid gap-6 sm:grid-cols-6 ">
                  <a className="sm:col-span-3" data-tip data-for="banner">
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">Banner image</label>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-violet-50 file:px-4 file:text-sm file:font-semibold dark:text-white"
                      onChange={inputHandle}
                      name="banner"
                    />
                  </a>

                  {eventInfo.banner !== "" && showImageOn && (
                    <ReactTooltip id="banner" aria-haspopup="true">
                      <div>
                        <img src={eventInfo.bannerblob} alt="preview image" width={250} height={250} />
                      </div>
                    </ReactTooltip>
                  )}

                  <a className="sm:col-span-3" data-tip data-for="floorPlan">
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">Floor plan</label>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-violet-50 file:px-4 file:text-sm file:font-semibold dark:text-white"
                      onChange={inputHandle}
                      name="floorPlan"
                    />
                  </a>

                  {eventInfo.floorPlan !== "" && showImageOn && (
                    <ReactTooltip id="floorPlan" aria-haspopup="true">
                      <div>
                        <img src={eventInfo.floorPlanblob} alt="preview image" width={250} height={250} />
                      </div>
                    </ReactTooltip>
                  )}

                  <div className="mt-1 flex flex-wrap sm:col-span-3">
                    <label className="mr-6 w-full text-black dark:text-white">
                      <input
                        type="radio"
                        className="mr-4"
                        value="eventImage"
                        onChange={(e) => {
                          changeTypeNFT(imageType.EVENT_IMAGE);
                        }}
                        checked={imageTypeChosen === imageType.EVENT_IMAGE}
                      />
                      Event image
                    </label>

                    <label className="mr-6 text-black dark:text-white">
                      <input
                        type="radio"
                        className="mr-4"
                        value="sectionImages"
                        onChange={(e) => {
                          changeTypeNFT(imageType.SECTION_IMAGE);
                        }}
                        checked={imageTypeChosen === imageType.SECTION_IMAGE}
                      />
                      Sections images
                    </label>
                  </div>

                  {imageTypeChosen === imageType.EVENT_IMAGE && (
                    <>
                      <a className="sm:col-span-2" data-tip data-for="eventNFT">
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">NFT image</label>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/jpg"
                          className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-violet-50 file:px-4 file:text-sm file:font-semibold dark:text-white"
                          onChange={inputHandle}
                          name="eventNFT"
                        />
                      </a>
                      {eventInfo.eventNFT !== "" && showImageOn && (
                        <ReactTooltip id="eventNFT" aria-haspopup="true">
                          <div>
                            <img src={eventInfo.eventNFTblob} alt="preview image" width={250} height={250} />
                          </div>
                        </ReactTooltip>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Additional information */}
          <div className="rounded-lg bg-white px-4 py-5 shadow dark:bg-gray-700 sm:p-6">
            <div className="my-auto lg:grid lg:grid-cols-4 lg:gap-6">
              <div className="lg:col-span-1">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-200">Additional information</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Information extra that will help the client reach the event.</p>
              </div>
              <div className="col-span-3 mt-14 lg:col-span-3 lg:mt-0">
                <div className="grid gap-6 sm:grid-cols-6 ">
                  <div className="col-span-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Website</label>
                    <input
                      type="text"
                      name="webSite"
                      value={eventInfo.webSite}
                      onChange={inputHandle}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white sm:text-sm"
                    />
                  </div>

                  <div className="col-span-6 grid grid-cols-6 gap-6">
                    <div className="col-span-6 grid grid-cols-3 gap-6 md:col-span-3">
                      {/* CONTACTS */}
                      <div className="col-span-2 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Contact</label>
                        <input
                          type="text"
                          name="contact"
                          value={contactInput}
                          onChange={(e) => {
                            setContactInput(e.target.value);
                          }}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white sm:text-sm"
                        />
                      </div>

                      <div className="col-span-1 mt-4 md:col-span-1">
                        <button
                          type="button"
                          onClick={() => {
                            addContact(contactInput);
                          }}
                          className="inline-flex items-center rounded-full border border-transparent bg-green-700 p-3 text-white shadow-sm 
                                        hover:bg-green-600  dark:bg-green-800 dark:text-gray-300 dark:hover:bg-green-600"
                        >
                          <PlusIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                      </div>

                      <div className="text-md col-span-2 font-medium text-black dark:text-white">
                        {eventInfo.contacts.length === 0 && <p className="w-full">No contacts yet</p>}
                        {eventInfo.contacts.length !== 0 && <p className="animate- mb-4 text-sm">(Click to remove)</p>}
                        {eventInfo.contacts.length !== 0 &&
                          eventInfo.contacts.map((contact, key) => (
                            <p
                              key={key}
                              className={"hover:cursor-pointer"}
                              onClick={() => {
                                removeContact(contact);
                              }}
                            >
                              {contact}
                            </p>
                          ))}
                      </div>
                    </div>

                    {/* EMAIL */}
                    <div className="col-span-6 grid grid-cols-3 gap-6 md:col-span-3">
                      <div className="col-span-2 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Email</label>
                        <input
                          type="text"
                          value={emailInput}
                          onChange={(e) => {
                            setEmailInput(e.target.value);
                          }}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white sm:text-sm"
                        />
                      </div>

                      <div className="col-span-1 mt-4 md:col-span-1">
                        <button
                          type="button"
                          onClick={() => {
                            addEmail(emailInput);
                          }}
                          className="inline-flex items-center rounded-full border border-transparent bg-green-700 p-3 text-white shadow-sm 
                                        hover:bg-green-600  dark:bg-green-800 dark:text-gray-300 dark:hover:bg-green-600"
                        >
                          <PlusIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                      </div>

                      {/* EMAILS */}

                      <div className="text-md col-span-2 font-medium text-black dark:text-white">
                        {eventInfo.emails.length === 0 && <p>No emails yet</p>}
                        {eventInfo.emails.length !== 0 && <p className="mb-4 text-sm">(Click to remove)</p>}
                        {eventInfo.emails.length !== 0 &&
                          eventInfo.emails.map((email, key) => (
                            <p
                              key={key}
                              className={"hover:cursor-pointer"}
                              onClick={() => {
                                removeEmail(email);
                              }}
                            >
                              {email}
                            </p>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* VALIDATORS */}
          <div className="rounded-lg bg-white px-4 py-5 shadow dark:bg-gray-700 sm:p-6">
            <div className="my-auto lg:grid lg:grid-cols-4 lg:gap-6">
              <div className="lg:col-span-1">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-200">Validators</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Section to choose the group validators or simply choose hash generation method only</p>
              </div>
              <div className="col-span-3 mt-14 lg:col-span-3 lg:mt-0">
                <div className="grid gap-6 sm:grid-cols-6 ">
                  <div className="mt-1 sm:col-span-6 ">
                    <label className="mr-6 w-full text-black dark:text-white">
                      <input
                        type="radio"
                        className="mr-4"
                        value="validators"
                        onChange={(e) => {
                          changeValidationType(validationType.VALIDATORS);
                        }}
                        checked={validationTypeChosen === validationType.VALIDATORS}
                      />
                      Only validators
                    </label>

                    <label className="mr-6 text-black dark:text-white">
                      <input
                        type="radio"
                        className="mr-4"
                        value="hash"
                        onChange={(e) => {
                          changeValidationType(validationType.HASH);
                        }}
                        checked={validationTypeChosen === validationType.HASH}
                      />
                      Only hash
                    </label>

                    <label className="mr-6 text-black dark:text-white">
                      <input
                        type="radio"
                        className="mr-4"
                        value="both"
                        onChange={(e) => {
                          changeValidationType(validationType.BOTH);
                        }}
                        checked={validationTypeChosen === validationType.BOTH}
                      />
                      Both
                    </label>
                  </div>

                  {(validationTypeChosen === validationType.VALIDATORS || validationTypeChosen === validationType.BOTH) && (
                    <>
                      <div className="mt-1 flex justify-end sm:col-span-2 sm:col-end-7">
                        <button
                          type="submit"
                          className="ml-3 inline-flex justify-center rounded-md border border-transparent 
                                        bg-indigo-600 py-2 px-6 text-sm font-medium text-white shadow-sm 
                                        focus:outline-none hover:bg-indigo-700"
                          onClick={() => {
                            toggleModal("groups");
                          }}
                        >
                          Add validator group
                        </button>
                      </div>

                      <div className="mt-8 grid gap-6 sm:col-span-6 md:grid-cols-3 lg:col-span-6">
                        {eventInfo.validation.validators.length > 0 &&
                          eventInfo.validation.validators.map((group, index) => (
                            <div key={index} className="col-span-1 flex flex-wrap justify-center rounded-lg bg-gray-200 p-6 dark:bg-gray-900">
                              <div className="mb-6 flex w-full justify-center">
                                <p className="text-md dark:text-white ">{group.validatorsGroupName}</p>
                              </div>
                              <button
                                className="inline-flex justify-center rounded-md border border-transparent 
                                                                 bg-red-600 py-2 px-6 text-sm font-medium text-white shadow-sm 
                                                                 focus:outline-none hover:bg-red-700"
                                onClick={() => {
                                  removeGroup(group);
                                }}
                              >
                                Remove
                              </button>
                            </div>
                          ))}

                        {eventInfo.validation.validators.length === 0 && <h1 className="text-lg font-medium dark:text-white">No groups added</h1>}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Structure */}
          <div className="rounded-lg bg-white px-4 py-5 shadow dark:bg-gray-700 sm:p-6">
            <div className="md:grid md:grid-cols-4 md:gap-6">
              <div className="md:col-span-1">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-200">Structure</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Choose the structure that will support the event</p>
              </div>
              <div className="col-span-4 mt-14 lg:col-span-3 lg:mt-0">
                <div className="grid gap-6 sm:grid-cols-6 ">
                  <div className="mt-1 flex justify-end sm:col-span-2 sm:col-end-7">
                    <button
                      type="submit"
                      className="ml-3 inline-flex justify-center rounded-md border border-transparent 
                                        bg-indigo-600 py-2 px-6 text-sm font-medium text-white shadow-sm 
                                        focus:outline-none hover:bg-indigo-700"
                      onClick={() => {
                        toggleModal("struct");
                      }}
                    >
                      Associate structure
                    </button>
                  </div>

                  <div className="mt-8 grid gap-6 sm:col-span-6">
                    {eventInfo.structure && (
                      <>
                        <div className="col-span-6 mb-8 w-full rounded-lg bg-red-800 p-4 text-lg font-medium text-white">
                          <p className="mb-4 animate-pulse text-center">WARNING</p>
                          <label>
                            This project is a prototype and is using the polygon testnet, so it is not possible to create large events, due to the testnet having a low gas limit. The maximum number of
                            minted tickets is currently 50 tickets per event. You still can create a large event but will not be possible mint it due to gas limitations. We will still allow the
                            creation, but will probably fail when minting. Our recommendation is to not exceed the limit of 50 tickets in all event.
                          </label>
                        </div>

                        <h1 className="mb-4 text-lg font-bold dark:text-white sm:col-span-6">{eventInfo.structure.name}</h1>
                        <div className="sm:col-span-6">
                          <h1 className="mb-8 text-lg font-bold underline dark:text-white">Unseated sections</h1>
                          <div className="grid grid-cols-4 gap-6 sm:col-span-1">
                            {eventInfo.structure.nonSeatedSections.map((nonSeatedSection, sectionIndex) => (
                              <div
                                key={sectionIndex}
                                className="/50 relative col-span-4 divide-y divide-gray-200
                                                                  rounded-lg bg-gray-200 shadow hover:shadow-lg hover:shadow-gray-900/50 hover:shadow-gray-400 dark:divide-transparent dark:bg-gray-900 lg:col-span-2"
                              >
                                <div className="flex w-full flex-wrap items-center justify-between space-x-1 p-6">
                                  <div className="flex w-full flex-wrap ">
                                    <div className="flex w-full justify-center">
                                      <h3 className="text-md truncate font-medium text-gray-900 dark:text-gray-200 ">{nonSeatedSection.name}</h3>
                                    </div>
                                    <div className="flex w-full justify-center">
                                      <p className="text-md mt-1 truncate text-gray-500 dark:text-gray-300 ">{nonSeatedSection.door}</p>
                                    </div>
                                    <div className="flex w-full justify-center">
                                      <p className="text-md mt-1 truncate text-gray-500 dark:text-gray-300">Capacity: {nonSeatedSection.capacity}</p>
                                    </div>
                                  </div>

                                  <hr className="mt-4 mb-4 h-px w-full border-0 bg-gray-500 dark:bg-gray-400" />

                                  <div className="mt-6 flex w-full flex-wrap md:mt-0 ">
                                    {imageTypeChosen === imageType.SECTION_IMAGE && (
                                      <>
                                        <a className="w-full" data-tip data-for={`nonSeatedSectionNFT${sectionIndex}`}>
                                          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">NFT image</label>
                                          <input
                                            type="file"
                                            accept="image/png,image/jpeg,image/jpg"
                                            className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-violet-50 file:px-4 file:text-sm file:font-semibold dark:text-white"
                                            onChange={(e) => {
                                              addNonSeatedNFT(e, sectionIndex);
                                            }}
                                            name="sectionNFT"
                                          />
                                        </a>
                                        {eventInfo.structure.nonSeatedSections[sectionIndex].sectionNFT && eventInfo.structure.nonSeatedSections[sectionIndex].sectionNFT !== "" && showImageOn && (
                                          <ReactTooltip id={`nonSeatedSectionNFT${sectionIndex}`} aria-haspopup="true">
                                            <div>
                                              <img src={eventInfo.structure.nonSeatedSections[sectionIndex].sectionNFTblob} alt="preview image" width={250} height={250} />
                                            </div>
                                          </ReactTooltip>
                                        )}
                                      </>
                                    )}

                                    <div className="mt-4 flex w-full flex-wrap justify-between lg:flex-nowrap">
                                      <div className="w-full sm:w-fit md:mr-4">
                                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                                          MATIC ({(eventInfo.structure.nonSeatedSections[sectionIndex].price * maticPrice).toFixed(7)} €)
                                        </label>
                                        <input
                                          type="number"
                                          name="price"
                                          value={eventInfo.structure.nonSeatedSections[sectionIndex].price}
                                          onChange={(e) => {
                                            inputHandlePriceNonSeated(e.target.value, sectionIndex);
                                          }}
                                          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 
                                                                                    focus:ring-indigo-500 dark:bg-gray-600 dark:text-white sm:text-sm 
                                                                                    ${
                                                                                      !validatePrice(eventInfo.structure.nonSeatedSections[sectionIndex].price) &&
                                                                                      eventInfo.structure.nonSeatedSections[sectionIndex].price !== ""
                                                                                        ? "border-2 border-red-500"
                                                                                        : "border-0"
                                                                                    }`}
                                        />
                                        <button
                                          className="text-xs font-medium text-gray-700 dark:text-gray-200"
                                          onClick={() => {
                                            cleanNonSeatedPrice(sectionIndex);
                                          }}
                                        >
                                          <label className="text-red-800 hover:cursor-pointer">Clear</label>
                                        </button>
                                      </div>

                                      <div className="w-full sm:w-fit">
                                        <label className="mt-4 mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200 sm:mt-0">Tickets</label>
                                        <input
                                          type="number"
                                          name="numTickets"
                                          value={eventInfo.structure.nonSeatedSections[sectionIndex].numTickets}
                                          onChange={(e) => {
                                            inputHandleTicketsNonSeated(e.target.value, sectionIndex);
                                          }}
                                          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 
                                                                                    focus:ring-indigo-500 dark:bg-gray-600 dark:text-white sm:text-sm 
                                                                                    ${
                                                                                      (!regexNumberTickets.test(eventInfo.structure.nonSeatedSections[sectionIndex].numTickets) ||
                                                                                        eventInfo.structure.nonSeatedSections[sectionIndex].numTickets >
                                                                                          eventInfo.structure.nonSeatedSections[sectionIndex].capacity) &&
                                                                                      eventInfo.structure.nonSeatedSections[sectionIndex].numTickets !== ""
                                                                                        ? "border-2 border-red-500"
                                                                                        : "border-0"
                                                                                    }`}
                                        />
                                        <button
                                          className="text-xs font-medium text-gray-700 dark:text-gray-200"
                                          onClick={() => {
                                            cleanNonSeatedTickets(sectionIndex);
                                          }}
                                        >
                                          <label className="text-red-800 hover:cursor-pointer">Clear</label>
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="sm:col-span-6">
                          <h1 className="mb-4 mt-8 text-lg font-bold underline dark:text-white">Seated sections</h1>
                          <div className="grid grid-cols-3 gap-6 sm:col-span-1">
                            {!eventInfo.structure.seatedSections || eventInfo.structure.seatedSections.length == 0 ? (
                              <div></div>
                            ) : (
                              <>
                                {eventInfo.structure.seatedSections.map((seatedSection, sectionIndex) => (
                                  <div key={sectionIndex} className="col-span-3 grid grid-cols-3 gap-6">
                                    <h1 className="text-md col-span-3 mt-8 font-medium dark:text-white">{seatedSection.name}</h1>

                                    {imageTypeChosen === imageType.SECTION_IMAGE && (
                                      <>
                                        <a className="col-span-3" data-tip data-for={`seatedSectionNFT${sectionIndex}`}>
                                          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">NFT image</label>
                                          <input
                                            type="file"
                                            accept="image/png,image/jpeg,image/jpg"
                                            className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-violet-50 file:px-4 file:text-sm file:font-semibold dark:text-white"
                                            onChange={(e) => {
                                              addSeatedNFT(e, sectionIndex);
                                            }}
                                            name="sectionNFT"
                                          />
                                        </a>

                                        {eventInfo.structure.seatedSections[sectionIndex].sectionNFT !== "" && showImageOn && (
                                          <ReactTooltip id={`seatedSectionNFT${sectionIndex}`} aria-haspopup="true">
                                            <div>
                                              <img src={eventInfo.structure.seatedSections[sectionIndex].sectionNFTblob} alt="preview image" width={250} height={250} />
                                            </div>
                                          </ReactTooltip>
                                        )}
                                      </>
                                    )}

                                    {seatedSection.subSections.map((subSection, rowIndex) => (
                                      <div
                                        key={rowIndex}
                                        className="/50 col-span-3 divide-y divide-gray-200 rounded-lg
                                                                        bg-gray-200 shadow hover:shadow-lg hover:shadow-gray-900/50 hover:shadow-gray-400 dark:divide-transparent dark:bg-gray-900 lg:col-span-1"
                                      >
                                        <div className="flex w-full flex-wrap items-center justify-between space-x-1 px-6 py-6">
                                          <div className="flex w-full flex-wrap ">
                                            <div className="flex w-full justify-center">
                                              <h3 className="text-md truncate font-medium text-gray-900 dark:text-gray-200">{subSection.row}</h3>
                                            </div>
                                            <div className="flex w-full justify-center">
                                              <p className="text-md mt-1 truncate text-gray-500 dark:text-gray-300">Capacity: {subSection.capacity}</p>
                                            </div>
                                          </div>

                                          <hr className="mt-4 mb-4 h-px w-full border-0 bg-gray-500 dark:bg-gray-400" />

                                          <div className="mt-6 flex grid w-full grid-cols-2 justify-center gap-6 md:mt-0 md:w-fit md:grid-cols-1 ">
                                            <div className="col-span-2 mb-2 sm:col-span-2">
                                              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                                                MATIC ({(eventInfo.structure.seatedSections[sectionIndex].subSections[rowIndex].price * maticPrice).toFixed(7)} €)
                                              </label>
                                              <input
                                                type="number"
                                                step={0.01}
                                                min={0}
                                                value={eventInfo.structure.seatedSections[sectionIndex].subSections[rowIndex].price}
                                                onChange={(e) => {
                                                  inputHandlePriceSeated(e.target.value, sectionIndex, rowIndex);
                                                }}
                                                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 
                                                                                        focus:ring-indigo-500 dark:bg-gray-600 dark:text-white sm:text-sm 
                                                                                        ${
                                                                                          !validatePrice(eventInfo.structure.seatedSections[sectionIndex].subSections[rowIndex].price) &&
                                                                                          validatePrice(eventInfo.structure.seatedSections[sectionIndex].subSections[rowIndex].price !== "")
                                                                                            ? "border-2 border-red-500"
                                                                                            : "border-0"
                                                                                        }`}
                                              />
                                              <button
                                                className="text-xs font-medium text-gray-700 dark:text-gray-200"
                                                onClick={() => {
                                                  cleanSeatedPrice(sectionIndex, rowIndex);
                                                }}
                                              >
                                                <label className="text-red-800 hover:cursor-pointer">Clear</label>
                                              </button>
                                            </div>
                                          </div>

                                          <div className="mt-6 flex grid w-full grid-cols-2 justify-center gap-6 md:mt-0 md:w-fit md:grid-cols-1 ">
                                            <div className="col-span-3 mb-2 sm:col-span-2">
                                              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">Tickets</label>
                                              <input
                                                type="number"
                                                min={0}
                                                value={eventInfo.structure.seatedSections[sectionIndex].subSections[rowIndex].numTickets}
                                                onChange={(e) => {
                                                  inputHandleTicketsSeated(e.target.value, sectionIndex, rowIndex);
                                                }}
                                                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 
                                                                                        focus:ring-indigo-500 dark:bg-gray-600 dark:text-white sm:text-sm 
                                                                                        ${
                                                                                          (!regexNumberTickets.test(
                                                                                            eventInfo.structure.seatedSections[sectionIndex].subSections[rowIndex].numTickets
                                                                                          ) ||
                                                                                            eventInfo.structure.seatedSections[sectionIndex].subSections[rowIndex].numTickets >
                                                                                              eventInfo.structure.seatedSections[sectionIndex].subSections[rowIndex].capacity) &&
                                                                                          eventInfo.structure.seatedSections[sectionIndex].subSections[rowIndex].numTickets !== ""
                                                                                            ? "border-2 border-red-500"
                                                                                            : "border-0"
                                                                                        }`}
                                              />
                                              <button
                                                className="text-xs font-medium text-red-700 dark:text-gray-200"
                                                onClick={() => {
                                                  cleanSeatedTickets(sectionIndex, rowIndex);
                                                }}
                                              >
                                                <label className="text-red-800 hover:cursor-pointer">Clear</label>
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ))}
                              </>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    {!eventInfo.structure && <h1 className="text-lg font-medium dark:text-white">No structure associated</h1>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ############################ INFORMATION MODAL  ############################*/}

      {isInfoModalOpen && (
        <Transition.Root show={true} as={Fragment}>
          <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={toggleInfoModal}>
            <div className="flex items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
              </Transition.Child>

              {/* This element is to trick the browser into centering the modal contents. */}
              <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">
                &#8203;
              </span>
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <div
                  className="inline-block w-full max-w-lg transform overflow-hidden 
                                         rounded-lg bg-white bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl 
                                         transition-all dark:bg-gray-700 sm:my-8 sm:p-6 sm:align-middle"
                >
                  <div className="absolute top-0 right-0 hidden pt-4 pr-4 sm:block ">
                    <button type="button" className="rounded-md text-gray-400 hover:text-gray-500" onClick={() => toggleInfoModal()}>
                      <span className="sr-only">Close</span>
                      <XIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="sm:flex sm:items-start">
                    <div className="flex w-full flex-wrap justify-start">
                      <div className="mx-auto mb-6 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 sm:mx-0 sm:h-10 sm:w-10">
                        <InformationCircleIcon className="h-6 w-6 text-white" aria-hidden="true" />
                      </div>
                      <div className="mt-3 w-full text-center align-middle sm:mt-0 sm:ml-4 sm:text-left md:w-fit">
                        <Dialog.Title as="h3" className="mt-2 mb-8 text-lg font-medium leading-6 text-gray-900 dark:text-gray-300">
                          Information about the form
                        </Dialog.Title>
                      </div>
                      <div></div>
                    </div>
                  </div>
                  <div className="mt-8 sm:mt-4">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-200">Basic information</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400"> - Event name: Minimum 5 characters and is required</p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400"> - Location: Minimum 3 characters and is required</p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400"> - Country: Required one of the list</p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400"> - Allowed age: Required one of the list</p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400"> - Category: Required one of the list</p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {" "}
                      - Max tickets per person: It's optional, leave it blank if it's to ignore. Otherwise it's necessary a integer higher than 0
                    </p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400"> - Description: Minimum 30 characters and is required</p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {" "}
                      - Dates: You can choose between "One Day" event and you need to choose a start time and a end time that is valid, in other others, the end time must be after start time. Exists
                      also the options of a "Multiple days" event where is necessary to choose two dates different and the time.{" "}
                    </p>

                    <h3 className="pt-4 text-lg font-medium leading-6 text-gray-900 dark:text-gray-200">Image</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400"> - Banner: Width [1000px - 1200px] Height [600px - 700px] and is required</p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400"> - Floor plan: Width [400px - 600px] Height [400px - 600px] and is required</p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400"> - Event NFT: Width [400px - 600px] Height [400px - 600px] and is required</p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400"> - Image choice: It's possible to chose between a image representing all event or for each section</p>

                    <h3 className="pt-4 text-lg font-medium leading-6 text-gray-900 dark:text-gray-200">Additional information</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400"> - Website: It's required</p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400"> - Contact: It's required at least one. Format: +XXXYYYYYYYYY</p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400"> - Email: It's required at least one</p>

                    <h3 className="pt-4 text-lg font-medium leading-6 text-gray-900 dark:text-gray-200">Validators</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {" "}
                      - Option: You can choose if in the event only registered validators group can validate the tickets, if the only way to validate if generating a link where everyone with that link
                      can validate or both together
                    </p>

                    <h3 className="pt-4 text-lg font-medium leading-6 text-gray-900 dark:text-gray-200">Structures</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400"> - Structure: Associate one structure and set the number of tickets and the price</p>

                    <div className="mt-8 flex justify-end">
                      <button
                        className="inline-flex justify-center rounded-md border border-transparent 
                                                        bg-red-600 py-2 px-6 text-sm font-medium text-white shadow-sm 
                                                        focus:outline-none hover:bg-red-700"
                        onClick={toggleInfoModal}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>
      )}

      {/* ############################ CHOOSE MODAL  ############################*/}

      {isModalOpen && (
        <Transition.Root show={true} as={Fragment}>
          <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={toggleModal}>
            <div className="flex items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
              </Transition.Child>

              {/* This element is to trick the browser into centering the modal contents. */}
              <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">
                &#8203;
              </span>
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <div
                  className="inline-block w-full max-w-lg transform overflow-hidden 
                                         rounded-lg bg-white bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl 
                                         transition-all dark:bg-gray-700 sm:my-8 sm:p-6 sm:align-middle"
                >
                  <div className="absolute top-0 right-0 hidden pt-4 pr-4 sm:block ">
                    <button type="button" className="rounded-md text-gray-400 hover:text-gray-500" onClick={() => toggleModal()}>
                      <span className="sr-only">Close</span>
                      <XIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="sm:flex sm:items-start">
                    <div className="flex w-full flex-wrap justify-start">
                      <div className="mx-auto mb-6 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-600 sm:mx-0 sm:h-10 sm:w-10">
                        <PlusIcon className="h-6 w-6 text-white" aria-hidden="true" />
                      </div>
                      <div className="mt-3 w-full text-center align-middle sm:mt-0 sm:ml-4 sm:text-left md:w-fit">
                        <Dialog.Title as="h3" className="mt-2 mb-8 text-lg font-medium leading-6 text-gray-900 dark:text-gray-300">
                          Choose one
                        </Dialog.Title>
                      </div>

                      <div></div>
                    </div>
                  </div>
                  <div className="mt-8 sm:mt-4">
                    {/* ########## GROUPS ########## */}
                    {originModal === "groups" && (
                      <div
                        className={`grid gap-6 overflow-y-auto  scrollbar-thin scrollbar-track-gray-200 
                                            scrollbar-thumb-gray-400 scrollbar-track-rounded-full 
                                            scrollbar-thumb-rounded-full md:grid-cols-2 ${totalGroups.length > 6 ? "h-[32rem] md:h-[38rem]" : "h-96"}`}
                      >
                        {totalGroups.length > 0 &&
                          totalGroups.map((group, index) => (
                            <div key={index} className="col-span-1 flex h-fit flex-wrap justify-center rounded-lg bg-gray-200 py-4 dark:bg-gray-900">
                              <div className="mb-6 flex w-full justify-center">
                                <p className="text-md dark:text-white ">{group.validatorsGroupName}</p>
                              </div>
                              <button
                                className="inline-flex justify-center rounded-md border border-transparent 
                                                                         bg-green-600 py-2 px-6 text-sm font-medium text-white shadow-sm 
                                                                         focus:outline-none hover:bg-green-700"
                                onClick={() => {
                                  addGroup(group);
                                }}
                              >
                                Add
                              </button>
                            </div>
                          ))}

                        {totalGroups.length === 0 && <h1 className="text-lg font-medium dark:text-white">No groups associated</h1>}
                      </div>
                    )}

                    {/* ########## STRUCTURES ########## */}
                    {originModal === "struct" && (
                      <div
                        className={`grid gap-6 overflow-y-auto  scrollbar-thin scrollbar-track-gray-200 
                                                        scrollbar-thumb-gray-400 scrollbar-track-rounded-full 
                                                        scrollbar-thumb-rounded-full md:grid-cols-2 ${structuresOfOrganizer.length > 6 ? "h-[32rem] md:h-[38rem]" : "h-96"}`}
                      >
                        {isLoadingStructures && (
                          <div className="col-span-2 flex flex-wrap items-center justify-center ">
                            <ReactLoading type={"bubbles"} height={100} width={120} color={"#5b2bab"} />
                            <span className="mb-4 w-full self-start text-center text-2xl text-lg font-extrabold tracking-tight dark:text-white xl:text-2xl">Loading structures</span>
                          </div>
                        )}
                        {!isLoadingStructures &&
                          structuresOfOrganizer.length > 0 &&
                          structuresOfOrganizer.map((struct, index) => (
                            <div key={index} className="col-span-1 flex h-fit flex-wrap justify-center rounded-lg bg-gray-200 py-4 dark:bg-gray-900">
                              <div className="mb-6 flex w-full justify-center">
                                <p className="text-md dark:text-white ">{struct.name}</p>
                              </div>
                              <button
                                className="inline-flex justify-center rounded-md border border-transparent 
                                                                    bg-green-600 py-2 px-6 text-sm font-medium text-white shadow-sm 
                                                                    focus:outline-none hover:bg-green-700"
                                onClick={() => {
                                  associateStruct(struct);
                                }}
                              >
                                Add
                              </button>
                            </div>
                          ))}

                        {structuresOfOrganizer.length === 0 && <h1 className="text-lg font-medium dark:text-white">No structures associated</h1>}
                      </div>
                    )}

                    <div className="mt-8 flex justify-end">
                      <button
                        className="inline-flex justify-center rounded-md border border-transparent 
                                                        bg-red-600 py-2 px-6 text-sm font-medium text-white shadow-sm 
                                                        focus:outline-none hover:bg-red-700"
                        onClick={toggleModal}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>
      )}
    </div>
  );
};
export default CreateEvent;