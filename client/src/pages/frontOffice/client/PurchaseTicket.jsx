import { useState, useEffect } from "react";
import { DynamicForm } from "../../../components";
import {
  ShoppingCartIcon,
  ShoppingBagIcon,
  TrashIcon,
  XCircleIcon,
} from "@heroicons/react/outline";
import { useParams } from 'react-router-dom';
import { Toaster, toast } from "react-hot-toast";
import constants from "../../../configs/constants";
import { motion, useMotionValue, useTransform } from "framer-motion";
import storageABI from "../../../configs/abi.json";
import ReactLoading from "react-loading";
import { ethers } from "ethers";
import Toast, { ToastType } from "../../../components/generic/Toast";
import { toMonthName } from "../../../helper/functionsGeneral";

const TicketBasket = ({ tickets, removeTicketToBuy }) => {
  const [isHoveringTicket, setIsHoveringTicket] = useState({
    section: "",
    row: "",
    seat: "",
  });

  const handleMouseOverTicket = (ticket) => {
    setIsHoveringTicket({
      section: ticket.section,
      row: ticket.row,
      seat: ticket.seat,
    });
  };

  const handleMouseOutTicket = () => {
    setIsHoveringTicket({ section: "", row: "", seat: "" });
  };

  return (
    <div className="mx-auto grid w-full grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      {tickets.map((ticket) => (
        <div
          className="relative mx-auto h-fit w-full hover:cursor-pointer"
          onMouseOver={() => handleMouseOverTicket(ticket)}
          onMouseOut={handleMouseOutTicket}>
          <div
            className={`flex h-fit w-full flex-col items-center justify-center space-y-3 rounded-lg border shadow-md transition duration-300 dark:border-gray-700 dark:bg-gray-600 dark:shadow-gray-800 ${isHoveringTicket.section === ticket.section &&
              isHoveringTicket.row === ticket.row &&
              isHoveringTicket.seat === ticket.seat
              ? "opacity-30"
              : ""
              }`}>
            <img
              src={constants.SERVER_URL + "/" + ticket.sectionNFT}
              alt=""
              className="w-full rounded-t-lg"
            />
            <div className="flex flex-col space-y-0 py-3">
              {ticket.type === "Seated" ?
                <>
                  <span className="font-bold dark:text-white">Section</span>
                  <span className="dark:text-gray-200">{ticket.section}</span>
                  <span className="font-bold dark:text-white">Row</span>
                  <span className="dark:text-gray-200">{ticket.row}</span>
                  <span className="font-bold dark:text-white">Seat</span>
                  <span className="dark:text-gray-200">{ticket.seat}</span>
                  <span className="font-bold dark:text-white">Price</span>
                  <span className="dark:text-gray-200">{ticket.price}</span>
                </>
                :
                <>
                  <span className="font-bold dark:text-white">Section</span>
                  <span className="dark:text-gray-200">{ticket.section}</span>
                  <span className="font-bold dark:text-white">Door</span>
                  <span className="dark:text-gray-200">{ticket.door}</span>
                  <span className="font-bold dark:text-white">Quantity</span>
                  <span className="dark:text-gray-200">{ticket.quantity}</span>
                  <span className="font-bold dark:text-white">Price</span>
                  <span className="dark:text-gray-200">{ticket.price}</span>
                </>
              }
            </div>
          </div>
          {isHoveringTicket.section === ticket.section &&
            isHoveringTicket.row === ticket.row &&
            isHoveringTicket.seat === ticket.seat && (
              <TrashIcon
                onClick={() => removeTicketToBuy(ticket)}
                className={`absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full border bg-white text-red-700 shadow-lg dark:border-gray-700 dark:bg-gray-900 dark:text-red-600 ${isHoveringTicket ? "w-8" : "w-0"
                  }`}
              />
            )}
        </div>
      ))}
    </div>
  );
};

const PurchaseTicket = () => {
  const [isHoveringImage, setIsHoveringImage] = useState(false);
  const [ticketsToBuy, setTicketsToBuy] = useState([]);
  const [sectionInput, setSectionInput] = useState();
  const [sectionHashInput, setSectionHashInput] = useState();
  const [rowInput, setRowInput] = useState();
  const [quantityInput, setQuantityInput] = useState();
  const [seatInput, setSeatInput] = useState();
  const [submitSeatedStatus, setSubmitSeatedStatus] = useState(false);
  const [submitNonSeatedStatus, setSubmitNonSeatedStatus] = useState(false);
  const [rowOptions, setRowOptions] = useState([]);
  const [seatOptions, setSeatOptions] = useState([]);
  const [data, setData] = useState();
  const serverUrl = constants.SERVER_URL;
  const [maticPrice, setMaticPrice] = useState();
  let progress = useMotionValue(90);


  //http request
  const urlParams = useParams()
  const url = constants.URL_EVENTS
  const urlPurchases = constants.URL_PURCHASES

  //given the raw info prepare the info
  function prepareTheRawInfo(event) {
    let newEvent = {}
    newEvent.name = event.name;
    newEvent.enventId = event.eventId;
    newEvent.banner = event.banner;
    newEvent.floorPlan = event.floorPlan;
    newEvent.maxTicketsPerPerson = event.maxTicketsPerPerson;
    newEvent.category = event.category;
    newEvent.hash = event.eventId;
    newEvent.datesInfo = event.datesInfo;
    newEvent.location = event.location;
    newEvent.structureName = event.structure.name;
    newEvent.imageType = event.imageType;
    //if the event is event type level
    if (newEvent.imageType !== "section_level") {
      newEvent.eventNFT = event.eventNFT;
    }

    let sections = []

    //for each seated
    event.structure.seatedSections.forEach(section => {
      if (section.totalAvailableTickets > 0) {
        let sectionTmp = {}
        sectionTmp.hash = section.sectionId
        sectionTmp.name = section.name
        sectionTmp.door = section.door
        sectionTmp.type = "Seated"
        sectionTmp.totalNumTickets = section.totalNumTickets
        sectionTmp.totalAvailableTickets = section.totalAvailableTickets
        sectionTmp.subSections = []

        if (newEvent.imageType === "section_level") {
          sectionTmp.sectionNFT = section.sectionNFT;
        }

        section.subSections.forEach(subSection => {
          console.log(subSection);
          let subSectionTmp = {}
          subSectionTmp.price = subSection.price
          subSectionTmp.hash = subSection.rowId
          subSectionTmp.row = subSection.row
          subSectionTmp.availableSeats = subSection.availableTickets
          subSectionTmp.numSeats = subSection.numTickets

          sectionTmp.subSections.push(subSectionTmp)
        })
        sections.push(sectionTmp);
      }
    })

    //for each non seated

    event.structure.nonSeatedSections.forEach(section => {
      let sectionTmp = {}
      sectionTmp.hash = section.sectionId
      sectionTmp.name = section.name
      sectionTmp.door = section.door
      sectionTmp.priceEach = section.price
      sectionTmp.type = "NonSeated"
      sectionTmp.totalNumTickets = section.numTickets
      sectionTmp.totalAvailableTickets = section.availableTickets

      if (newEvent.imageType === "section_level") {
        sectionTmp.sectionNFT = section.sectionNFT;
      }

      sections.push(sectionTmp);
    })

    newEvent.sections = sections
    setData(newEvent)
    console.log('final', newEvent);
  }

  console.log(ticketsToBuy)

  const fetchData = () => {
    setIsLoading(true)
    fetch(url + `getEvent?eventId=${urlParams.eventId}`, {
      method: "GET",
    })
      .then((res) => {
        setIsLoading(false);
        if (!res.ok) throw new Error(res.status);
        else return res.json();
      })
      .then((data) => {
        prepareTheRawInfo(data.message)
      })
      .catch((err) => {
        setIsLoading(false);
      });
  };

  const hasMoreTicketsThatMax = async () => {
    const wallet = await provider.send("eth_requestAccounts", []);

    if (!wallet) {
      return false;
    }

    try {
      let res = await fetch(urlPurchases + `getOne?wallet=${wallet}&eventId=${urlParams.eventId}`)
      let resJson = await res.json()

      if (!res.ok) {
        return false;
      }
      console.log(resJson.tickets.length);
      console.log(data.maxTicketsPerPerson);

      if (data.maxTicketsPerPerson == null) {
        return false;
      }

      if (resJson.tickets.length > data.maxTicketsPerPerson) {
        Toast("Error", "You have reached the max tickets per person accumulated with others purchases! The max is " + data.maxTicketsPerPerson, ToastType.DANGER);
        return true;
      }
      return false;

    } catch (error) {
      console.log('err get tickets purchased', error);
      return false
    }
  };

  //sets up ethers
  const updateEthers = async () => {
    let tempProvider = new ethers.providers.Web3Provider(window.ethereum);

    setProvider(tempProvider);

    let tempSigner = tempProvider.getSigner();
    setSigner(tempSigner);

    let tempContract = new ethers.Contract(
      contractAddress,
      storageABI,
      tempSigner
    );

    let tempContractReadOnly = new ethers.Contract(contractAddress, storageABI, provider);
    setContract(tempContract);
    setContractToReadOnly(tempContractReadOnly)
  };

  function updateMaticPrice() {
    fetch("https://min-api.cryptocompare.com/data/price?fsym=MATIC&tsyms=EUR&api_key=75f02885dbeb28e0b3246d853c034710651551458928107c735e28b37afbe814")
      .then((res) => {
        if (!res.ok) throw new Error(res.status);
        else return res.json();
      })
      .then((data) => {
        setMaticPrice(data.EUR)
      })
      .catch((err) => {
        console.log(err.message);
      });
  }

  //when page reload
  useEffect(() => {
    fetchData();
    updateMaticPrice();
    updateEthers()
  }, []);

  function rowInputChange(rowName) {
    const sectionFounded = data.sections.find(
      (section) => section.name === sectionInput
    );

    console.log('sectiinfo', sectionFounded);

    if (rowName && rowName !== "-- select row --") {

      const rowFounded = sectionFounded.subSections.find(
        (row) => row.row === rowName
      );


      console.log('rowindo', rowFounded);

      const options = handleFormOptions(rowFounded.availableSeats);
      setSeatOptions(options);
      if (seatInput) {
        setSeatInput("-- select seat --");
      }
    }
  }

  function sectionInputChange(sectionName) {
    const section = data.sections.find(
      (section) => section.name === sectionName
    );

    if (section) {
      const length = section.subSections.length;
      const rows = Array.from({ length: length }, (_, i) => i + 1);
      const rowsStrings = []
      section.subSections.forEach(sub => {
        rowsStrings.push(sub.row)
      })

      const options = handleFormOptions(rowsStrings);
      setRowOptions(options);
      if (rowInput) {
        setRowInput("-- select row --");
      }
      if (seatInput) {
        setSeatInput("-- select seat --");
      }
    }
  }

  function seatInputChange(seatNumber) {
    setSeatInput(seatNumber);
    if (
      seatNumber === undefined ||
      rowInput === undefined ||
      seatNumber === undefined ||
      rowInput === "-- select row --" ||
      seatNumber === "-- select seat --"
    ) {
      setSubmitSeatedStatus(false);
    } else {
      setSubmitSeatedStatus(true);
    }
  }

  const handleMouseOverImage = () => {
    setIsHoveringImage(true);
  };

  const handleMouseOutImage = () => {
    setIsHoveringImage(false);
  };

  const handleSeatedTicketInput = (event) => {
    const target = event.target;

    if (target.id === "section") {
      setSectionInput(target.value);
      sectionInputChange(target.value)
    } else if (target.id === "row") {
      setRowInput(target.value);
      rowInputChange(target.value)
    } else {
      setSeatInput(target.value);
      seatInputChange(target.value)
    }
  };

  const handleNonSeatedTicketInput = (event) => {
    const target = event.target;

    if (target.id === "quantity") {
      setQuantityInput(target.value);
      setSubmitNonSeatedStatus(true)
    }
  };

  function getSeatedTicketHash(sectionName, row, seat) {
    let hash = "";
    for (let i = 0; i < data.sections.length; i++) {
      if (data.sections[i].name === sectionName) {
        for (let j = 0; j < data.sections[i].subSections.length; j++) {
          if (row === data.sections[i].subSections[j].row) {
            hash = data.sections[i].subSections[j].hash
          }
        }
      }
    }
    return hash + "_" + seat;
  }

  function getNonSeatedInfo(sectionName) {

    for (let i = 0; i < data.sections.length; i++) {
      if (data.sections[i].name === sectionName) {
        return data.sections[i]
      }
    }
  }


  //given a section nft returns the image
  function getSectionNft(sectionName) {
    let img = ""
    for (let i = 0; i < data.sections.length; i++) {
      if (sectionName === data.sections[i].name) {
        img = data.sections[i].sectionNFT;
      }
    }
    return img;
  }

  function getPrice(sectionName) {
    for (let i = 0; i < data.sections.length; i++) {
      if (sectionName === data.sections[i].name) {
        return data.sections[i].priceEach
      }
    }
  }

  function getPriceRow(sectionName, row) {
    for (let i = 0; i < data.sections.length; i++) {
      if (data.sections[i].name === sectionName) {
        for (let j = 0; j < data.sections[i].subSections.length; j++) {
          if (row === data.sections[i].subSections[j].row) {
            console.log('a', data.sections[i].subSections[j]);
            return data.sections[i].subSections[j].price
          }
        }
      }
    }
  }


  function getRowAvaiable(sectionName, row) {
    for (let i = 0; i < data.sections.length; i++) {
      if (data.sections[i].name === sectionName) {
        for (let j = 0; j < data.sections[i].subSections.length; j++) {
          if (row === data.sections[i].subSections[j].row) {
            console.log(data.sections[i].subSections[j].availableTickets);
            return data.sections[i].subSections[j].availableSeats.length
          }
        }
      }
    }
  }

  function getDoor(sectionName) {
    for (let i = 0; i < data.sections.length; i++) {
      if (sectionName === data.sections[i].name) {
        return data.sections[i].door
      }
    }
  }

  function getType(sectionName) {
    for (let i = 0; i < data.sections.length; i++) {
      if (sectionName === data.sections[i].name) {
        return data.sections[i].type
      }
    }
  }

  function getAvaiableTikets(sectionName) {
    for (let i = 0; i < data.sections.length; i++) {
      if (sectionName === data.sections[i].name) {
        return data.sections[i].totalAvailableTickets
      }
    }
  }

  function getQuantity(sectionName) {
    for (let i = 0; i < data.sections.length; i++) {
      if (sectionName === data.sections[i].name) {
        return data.sections[i].quantity
      }
    }
  }

  const addNonSeatedTicketToBuy = (ticket) => {
    if (ticketsToBuy.length === data.maxTicketsPerPerson) {
      Toast("Error!", "The max number of tickets per")
    }

    const result = ticketsToBuy.find(
      (currentTicket) =>
        currentTicket.section === ticket.section
    );

    if (result) {
      Toast("Error!", "Ticket already added to basket", ToastType.DANGER)
      return;
    }

    let nonSeatedInfo = getNonSeatedInfo(ticket.section)

    if (ticket.quantity > nonSeatedInfo.totalAvailableTickets) {
      Toast("Error!", "The quantity exceeds the available tickets", ToastType.DANGER)
      return;
    }


    let tmp = {}
    tmp.section = ticket.section;
    tmp.row = ticket.row;
    tmp.hash = nonSeatedInfo.hash;
    tmp.door = nonSeatedInfo.door;
    tmp.price = nonSeatedInfo.priceEach;
    tmp.quantity = ticket.quantity;
    tmp.type = "NonSeated";
    if (data.imageType === "section_level") {
      tmp.sectionNFT = getSectionNft(ticket.section);
    } else {
      tmp.sectionNFT = data.eventNFT;
    }

    const currentTicketsToBuy = [...ticketsToBuy];
    currentTicketsToBuy.unshift(tmp);
    setTicketsToBuy(currentTicketsToBuy);
  }

  function getQuantityString(sectionName) {
    let str = "Number of tickets"
    for (let i = 0; i < data.sections.length; i++) {
      if (sectionName === data.sections[i].name) {
        return str + "\n (Available: " + data.sections[i].totalAvailableTickets + ")"
      }
    }
  }

  function getSectiontypeString(sectionName) {
    for (let i = 0; i < data.sections.length; i++) {
      if (sectionName === data.sections[i].name) {
        if (data.sections[i].type === "Seated") {
          return "Seated Section"
        } else {
          return "Non seated Section"
        }
      }
    }
    return "Section"
  }

  function maticToWei(value) {
    return value * 1000000000000000000
  }
  const addSeatedTicketToBuy = (ticket) => {
    const result = ticketsToBuy.find(
      (currentTicket) =>
        currentTicket.section === ticket.section &&
        currentTicket.row === ticket.row &&
        currentTicket.seat === ticket.seat
    );

    if (result) {
      Toast("Error!", "Ticket already added to basket", ToastType.DANGER)
      return;
    }

    let ticketHash = getSeatedTicketHash(ticket.section, ticket.row, ticket.seat);
    let price = getPriceRow(ticket.section, ticket.row)
    let door = getDoor(ticket.section)

    //check in smart contract if ticket is sold out
    contract.isTicketSold(data.hash, ticketHash)
      .then((result) => {
        if (result === true) {
          Toast("Error!", "The ticket is sold out! Ref: " + ticketHash, ToastType.DANGER)
          removeTicketToBuy(ticket)
        }
      }).catch((error) => {
        console.log('error is sold out: ', error);
      });

    let tmp = {}
    tmp.section = ticket.section;
    tmp.row = ticket.row;
    tmp.seat = ticket.seat;
    tmp.door = door;
    tmp.type = "Seated";
    tmp.hash = ticketHash;
    tmp.price = price;
    if (data.imageType === "section_level") {
      tmp.sectionNFT = getSectionNft(ticket.section);
    } else {
      tmp.sectionNFT = data.eventNFT;
    }

    const currentTicketsToBuy = [...ticketsToBuy];
    currentTicketsToBuy.unshift(tmp);
    setTicketsToBuy(currentTicketsToBuy);
  };

  const removeTicketToBuy = (ticket) => {
    let newArr = []

    for (let i = 0; i < ticketsToBuy.length; i++) {
      if (ticket.section === ticketsToBuy[i].section &&
        ticket.row === ticketsToBuy[i].row &&
        ticket.seat === ticketsToBuy[i].seat) {
        continue;
      } else {
        newArr.push(ticketsToBuy[i])
      }
    }
    setTicketsToBuy(newArr)
  };

  const handleFormOptions = (array) => {
    var result = [];

    for (let value in array) {
      result.push({ value: array[value], disabled: false });
    }

    return result;
  };

  function getPriceNonSeatedString(sectionName) {
    let price = getPrice(sectionName)
    return price + " MATIC   " + (price * maticPrice).toFixed(7) + " €"
  }

  function getPriceRowString(sectionName, rowName) {
    let price

    for (let i = 0; i < data.sections.length; i++) {
      if (data.sections[i].name === sectionName) {
        for (let j = 0; j < data.sections[i].subSections.length; j++) {
          if (rowName === data.sections[i].subSections[j].row) {
            price = data.sections[i].subSections[j].price
          }
        }
      }
      return price + " MATIC   " + (price * maticPrice).toFixed(7) + " €"
    }
  }

  //fetching
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingBuy, setIsLoadingBuy] = useState(false);
  const [afterBuy, setAfterBuy] = useState(false);

  //smart contract zone
  const contractAddress = constants.CONTRACT_ADDRESS;
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [contractToReadOnly, setContractToReadOnly] = useState(null);
  const [txHash, setTxHash] = useState("");

  const ticketType = {
    SEATED: 1,
    NON_SEATED: 2,
  };

  function totalToPay() {
    let total = 0;
    for (let i = 0; i < ticketsToBuy.length; i++) {
      total += ticketsToBuy[i].price
    }
    return total
  }

  //will send the tickets to the smart contract
  const executePurchase = async () => {

    //TODO : check if it's logged in 
    if (typeof window.ethereum !== 'undefined') {
      if (signer == null) {
        Toast("Error!", "Login in your metamask wallet", ToastType.DANGER)
        setIsLoadingBuy(false);
        return;
      }
    } else {
      Toast("Error!", "Please install metamask wallet", ToastType.DANGER)
      setIsLoadingBuy(false);
      return;
    }

    setIsLoadingBuy(true);

    let hasMore = await hasMoreTicketsThatMax();

    if (hasMore) {
      setIsLoadingBuy(false);
      return
    }

    let nonSeatedArr = []
    let seatedArr = []
    let totalPrice = 0;

    ticketsToBuy.forEach(ticket => {
      totalPrice += ticket.price;
      if (ticket.type === "Seated") {
        seatedArr.push(ticket.hash)
      } else {
        let tmpNonSeated = []
        tmpNonSeated.push(ticket.hash)
        tmpNonSeated.push(ticket.quantity)
        nonSeatedArr.push(tmpNonSeated)
      }
    })


    //calls the smart contract function
    console.log(maticToWei(totalToPay()).toString().replace("\.", "0"));
    console.log('total', totalToPay().toString().replace("\.", "0"));
    contract.buyTickets(data.hash, nonSeatedArr, seatedArr, {
      value: maticToWei(totalToPay()).toString().replace("\.", "0")
    }).then(async (result) => {
      setIsLoadingBuy(false);

      if (result.hash) {
        setAfterBuy(true);
        afterPurchaseComplete()
        setTxHash(result.hash)

      } else {
        Toast("Error", "Something happened! The transaction failed", ToastType.DANGER);
      }
    }).catch((error) => {
      setIsLoadingBuy(false);
      console.error('error', error);
      Toast("Error", "Something happened! We could not execute the purchase", ToastType.DANGER);
    });
  };

  async function afterPurchaseComplete() {
    const wallet = await provider.send("eth_requestAccounts", []);

    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1; // Months start at 0!
    let dd = today.getDate();
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    const formattedToday = dd + '-' + mm + '-' + yyyy;

    let obj = {}
    obj.wallet = wallet[0];
    obj.eventId = data.hash;
    obj.banner = data.banner;
    obj.tickets = []
    obj.category = data.category;
    obj.datesInfo = data.datesInfo;
    obj.eventName = data.name;
    obj.totalPrice = totalToPay();
    obj.location = data.location;
    obj.dateOfPurchase = formattedToday;
    obj.datesInfo = data.datesInfo;

    //section name -> total available
    let sectionCounterHash = {}

    for (let i = 0; i < data.sections.length; i++) {
      if (data.sections[i].type !== "Seated") {
        sectionCounterHash[data.sections[i].name] =
          (Number(data.sections[i].totalAvailableTickets) - Number(data.sections[i].totalNumTickets) + 1)
      }
    }

    console.log('hash', sectionCounterHash);

    ticketsToBuy.forEach(ticket => {
      let tmp = {}
      if (ticket.type === "Seated") {
        tmp.hash = ticket.hash
        tmp.type = "Seated"
        tmp.sectionName = ticket.section
        tmp.dateOfPurchase = formattedToday;
        tmp.rowName = ticket.row
        tmp.seat = ticket.seat
        tmp.price = ticket.price
        tmp.ticketNFT = ticket.sectionNFT
        tmp.door = ticket.door
        obj.tickets.push(tmp)
      } else {
        for (let i = 0; i < ticket.quantity; i++) {
          tmp = {}
          tmp.type = "NonSeated"
          tmp.hash = ticket.hash + "_" + Number(Number(sectionCounterHash[ticket.section]) + Number(i))
          tmp.door = ticket.door
          tmp.price = ticket.price
          tmp.sectionName = ticket.section
          tmp.dateOfPurchase = formattedToday;
          tmp.ticketNFT = ticket.sectionNFT
          obj.tickets.push(tmp)
        }
      }
    });

    //register in DB
    fetch(urlPurchases + `register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(obj),
    })
      .then((res) => {
        setIsLoading(false);
        if (res.status === 400) {
          Toast("Error!", "Some error occurred. Please refresh the page, some ticket could be purchased by other client.", ToastType.DANGER)
        }
        if (!res.ok) throw new Error(res.status);
        else return res.json();
      })
      .then((data) => {
        prepareTheRawInfo(data.message)
      })
      .catch((err) => {
        setIsLoading(false);
      });

    console.log('ticket', obj);
  }

  //after minted 
  function Confirmed({ progress }) {
    const circleLength = useTransform(progress, [0, 100], [0, 1]);
    const checkmarkPathLength = useTransform(progress, [0, 95, 100], [0, 0, 1]);
    const circleColor = useTransform(progress, [0, 95, 100], ["#FFCC66", "#FFCC66", "#66BB66"]);

    return (
      <motion.svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 258 258">
        {/* Check mark  */}
        <motion.path transform="translate(60 85)" d="M3 50L45 92L134 3" fill="transparent" stroke="#7BB86F" strokeWidth={8} style={{ pathLength: checkmarkPathLength }} />
        {/* Circle */}
        <motion.path
          d="M 130 6 C 198.483 6 254 61.517 254 130 C 254 198.483 198.483 254 130 254 C 61.517 254 6 198.483 6 130 C 6 61.517 61.517 6 130 6 Z"
          fill="transparent"
          strokeWidth="8"
          stroke={circleColor}
          style={{
            pathLength: circleLength,
          }}
        />
      </motion.svg>
    );
  }

  return (
    <>
      <Toaster
        reverseOrder={false}
        position="top-center"
        toastOptions={{
          style: {
            borderRadius: "8px",
            background: "#4b5563",
            color: "#fff",
          },
        }}
      />

      {isLoading &&
        <div className="flex flex-wrap justify-center items-center pt-24 ">
          <ReactLoading type={"bubbles"} height={100} width={120} color={"#5b2bab"} />
          <span className="mb-4 w-full text-center self-start text-2xl font-extrabold tracking-tight dark:text-white text-lg xl:text-2xl">
            Getting the event. Please wait
          </span>
        </div>
      }

      {/* event not found */}
      {urlParams.name && !isLoading && !data &&
        <div className="px-4 py-16 sm:px-6 sm:py-24 md:grid md:place-items-center lg:px-8">
          <div className="max-w-max mx-auto">
            <main className="sm:flex">
              <div className="sm:ml-6">
                <div className="sm:pl-6">
                  <h1 className="text-4xl font-extrabold text-center text-gray-900 tracking-tight dark:text-gray-400 sm:text-5xl">Event not found</h1>
                  <p className="mt-1 text-base text-center text-gray-400">We could not find any event with that name.</p>
                </div>
                <div className="mt-10 flex space-x-3 justify-center sm:border-l sm:border-transparent sm:pl-6">
                  <a
                    href="/app/client"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Go to Events
                  </a>
                </div>
              </div>
            </main>
          </div>
        </div>
      }


      {!isLoading && data &&
        <div className="flex h-fit w-full flex-col space-y-10 bg-gray-50 dark:bg-gray-900">

          <div className="flex flex-col space-y-4">
            <div
              id="ticketBanner"
              className={`flex h-24 md:h-72 w-full animate-fade-in-down flex-col 
                                rounded-md bg-cover bg-center p-0 text-left text-white duration-300 ease-in-out hover:scale-[1.01] sm:p-2 lg:flex-row lg:p-5`}
              style={{
                backgroundImage: `url(${constants.SERVER_URL + "/" + data.banner.replace(/\\/g, "/")})`,
              }}
            >
            </div>


            {/* dates */}
            {!afterBuy &&
              <>
                <span className="font-extrabold tracking-tight dark:text-white text-center md:text-start text-2xl lg:text-3xl xl:text-4xl">
                  {data.name}
                </span>
                <div className="flex flex-col space-y-1 mt-2">
                  <span className="font-medium tracking-tight text-gray-700 dark:text-gray-200 text-center md:text-start text-xl lg:text-2xl xl:text-3xl mb-6">
                    {data.location}
                  </span>
                </div>

                <div className="flex flex-col space-y-1">
                  <span className="font-medium tracking-tight text-gray-700 dark:text-gray-200 text-center md:text-start text-xl lg:text-xl xl:text-1xl">
                    Date: {data.datesInfo.startDate.dayMonthYear}
                  </span>
                </div>

                <div className="flex flex-col space-y-1">
                  <span className="font-medium tracking-tight text-gray-700 dark:text-gray-200 text-center md:text-start text-xl lg:text-xl xl:text-1xl mb-6">
                    Hours: {data.datesInfo.startDate.startTime} - {data.datesInfo.startDate.endTime}
                  </span>
                </div>
              </>
            }
          </div>

          {/* param structure not found */}
          {afterBuy &&
            <div className="px-4 md:grid md:place-items-center lg:px-8">
              <div className="max-w-max mx-auto">
                <main className="sm:flex">
                  <div className="sm:ml-6">
                    <div className="flex flex-wrap items-center justify-center w-full mt-8">
                      <motion.div initial={{ x: 0 }} animate={{ x: 100 }} style={{ x: progress }} transition={{ duration: 1 }} />
                      <Confirmed progress={progress} />
                    </div>
                    <div className="sm:pl-6 mt-6">
                      <h1 className="text-4xl font-extrabold text-center text-gray-900 tracking-tight dark:text-gray-400 sm:text-5xl">Purchase complete!</h1>
                      <p className="mt-1 text-base text-center text-gray-400">The purchase occurred with success! Now you can check the NFTs in your wallet</p>
                    </div>
                    <div className="mt-10 flex flex-wrap space-y-6 md:space-y-0 space-x-3 justify-center sm:border-l sm:border-transparent sm:pl-6">
                      <a
                        href="/app/client/purchased-tickets"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Go to my tickets
                      </a>
                      <a
                        href={"/app/client/purchase-ticket" + "/" + data.hash}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Buy more tickets of this event
                      </a>
                      <a
                        //href={"https://testnet.bscscan.com/tx/" + txHash}
                        href={"https://mumbai.polygonscan.com/tx/" + txHash}
                        target="_blank"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Open transaction
                      </a>
                    </div>
                  </div>
                </main>
              </div>
            </div>
          }

          {!afterBuy &&
            <>
              <div className="pt-7 md:mx-10 text-center">
                <div className="flex flex-col items-center justify-center space-y-5 align-middle lg:flex-row md:space-x-20">
                  {/* FLOOR PLAN */}
                  <div id="ticketBanner"
                    className={`flex w-[200px] h-[400px]  md:w-[400px] md:h-[600px] flex-col rounded-md bg-cover 
                bg-center`}
                    style={{
                      backgroundImage: `url(${constants.SERVER_URL + "/" + data.floorPlan.replace(/\\/g, "/")})`,
                    }}>
                  </div>
                  {/* FORM */}
                  {!sectionInput &&
                    <DynamicForm
                      width={"xl:w-1/5 md:w-2/5 w-3/5"}
                      submitText="Add ticket"
                      inputs={[
                        {
                          label: getSectiontypeString(sectionInput),
                          type: "select",
                          id: "section",
                          onChange: handleSeatedTicketInput,
                          value: sectionInput,
                          options: handleFormOptions(
                            data.sections.map((section) => section.name)
                          ),
                          optionText: "-- select section --",
                        },
                      ]}
                      submitStatus={{ status: false }}
                      onSubmit={(event) => {
                        event.preventDefault();
                        addSeatedTicketToBuy({
                          section: sectionInput,
                          row: rowInput,
                          seat: seatInput,
                          hash: sectionInput + "_" + seatInput,
                        });
                      }}
                    />
                  }


                  {sectionInput && getType(sectionInput) === "Seated" &&

                    <div className="xl:w-1/5 md:w-3/5 w-3/5">
                      {getAvaiableTikets(sectionInput) === 0 &&
                        <div className="bg-red-800 rounded-lg p-4 text-white text-lg font-medium w-full mb-8">
                          Section sold out
                        </div>
                      }

                      {rowInput && getRowAvaiable(sectionInput, rowInput) === 0 &&
                        <div className="bg-red-800 rounded-lg p-4 text-white text-lg font-medium w-full mb-8">
                          Row sold out
                        </div>
                      }

                      {rowInput &&
                        <div className="bg-indigo-800 rounded-lg p-4 text-white text-lg font-medium w-full mb-8">
                          Ticket price {getPriceRow(sectionInput, rowInput)}   MATIC  - ({(getPriceRow(sectionInput, rowInput) * maticPrice).toFixed(7)} €)
                        </div>
                      }


                      <DynamicForm
                        width={"w-full"}
                        submitText="Add ticket"
                        inputs={[
                          {
                            label: getSectiontypeString(sectionInput),
                            type: "select",
                            id: "section",
                            onChange: handleSeatedTicketInput,
                            value: sectionInput,
                            options: handleFormOptions(
                              data.sections.map((section) => section.name)
                            ),
                            optionText: "-- select section --",
                          },
                          {
                            label: "Row",
                            type: "select",
                            id: "row",
                            onChange: handleSeatedTicketInput,
                            value: rowInput,
                            options: rowOptions,
                            optionText: "-- select row --",
                          },
                          {
                            label: "Seat",
                            type: "select",
                            id: "seat",
                            onChange: handleSeatedTicketInput,
                            value: seatInput,
                            options: seatOptions,
                            optionText: "-- select seat --",
                          },
                        ]}
                        submitStatus={{ status: submitSeatedStatus }}
                        onSubmit={(event) => {
                          event.preventDefault();
                          addSeatedTicketToBuy({
                            section: sectionInput,
                            row: rowInput,
                            seat: seatInput,
                            hash: sectionInput + "_" + seatInput,
                          });
                        }}
                      />

                    </div>

                  }

                  {sectionInput && getType(sectionInput) !== "Seated" &&
                    <div className="xl:w-1/5 md:w-3/5 w-3/5">

                      {sectionInput && getType(sectionInput) !== "Seated" && getAvaiableTikets(sectionInput) == 0 &&
                        <div className="bg-red-800 rounded-lg p-4 text-white text-lg font-medium w-full mb-8">
                          Section sold out
                        </div>
                      }

                      {sectionInput && getType(sectionInput) !== "Seated" &&
                        <div className="bg-indigo-800 rounded-lg p-4 text-white text-lg font-medium w-full mb-8">
                          Ticket price {getPrice(sectionInput)}   MATIC  - ({(getPrice(sectionInput) * maticPrice).toFixed(7)} €)
                        </div>
                      }

                      <DynamicForm
                        width={"w-full"}
                        submitText="Add ticket"
                        inputs={[
                          {
                            label: getSectiontypeString(sectionInput),
                            type: "select",
                            id: "section",
                            onChange: handleSeatedTicketInput,
                            value: sectionInput,
                            options: handleFormOptions(
                              data.sections.map((section) => section.name)
                            ),
                            optionText: "-- select section --",
                          },
                          {
                            label: getQuantityString(sectionInput),
                            type: "number",
                            min: "1",
                            id: "quantity",
                            onChange: handleNonSeatedTicketInput,
                            value: quantityInput,
                          },
                        ]}
                        submitStatus={{ status: submitNonSeatedStatus }}
                        onSubmit={(event) => {
                          event.preventDefault();
                          addNonSeatedTicketToBuy({
                            section: sectionInput,
                            type: "NonSeated",
                            quantity: quantityInput,
                          });
                        }}
                      />
                    </div>
                  }
                </div>
              </div>
              {/* TICKETS BASKET */}
              <div className="mx-auto flex h-fit w-full flex-col space-y-5 md:w-2/3">
                <div>
                  <div className="flex justify-between">
                    <div className="flex flex-row justify-between space-x-2">
                      <span className="font-medium tracking-tight text-gray-700 dark:text-gray-200 xxs:text-sm lg:text-lg xl:text-xl">
                        Tickets Basket
                      </span>
                      <ShoppingBagIcon className="w-5 dark:text-white" />
                    </div>

                    <div className="flex flex-row justify-between space-x-2">
                      <span className="font-medium tracking-tight text-gray-700 dark:text-gray-200 xxs:text-sm lg:text-lg xl:text-xl">
                        Total: {totalToPay()} MATIC ({(totalToPay() * maticPrice).toFixed(7)}€)
                      </span>
                      <ShoppingCartIcon className="w-5 dark:text-white" />
                    </div>
                  </div>

                </div>
                <div className="flex w-full justify-center rounded-lg border p-7 text-center shadow-sm dark:border-gray-700">
                  {ticketsToBuy.length === 0 ? (
                    <span className="dark:text-white">
                      Your basket is empty. Start adding tickets!
                    </span>
                  ) : (
                    <TicketBasket
                      tickets={ticketsToBuy}
                      removeTicketToBuy={removeTicketToBuy}
                    />
                  )}
                </div>
              </div>
            </>
          }

          {(isLoading) &&
            <div className="flex flex-wrap items-center justify-center">
              <ReactLoading type={"bubbles"} height={100} width={120} color={"#5b2bab"} />
              <span className="mb-4 w-full self-start text-center text-2xl text-lg font-extrabold tracking-tight dark:text-white xl:text-2xl">
                Loading
              </span>
            </div>
          }

          {
            (isLoadingBuy) &&
            <div className="flex flex-wrap items-center justify-center">
              <ReactLoading type={"bubbles"} height={100} width={120} color={"#5b2bab"} />
              <span className="mb-4 w-full self-start text-center text-2xl text-lg font-extrabold tracking-tight dark:text-white xl:text-2xl">
                Processing the request.
              </span>
            </div>
          }

          {(!isLoadingBuy) && (!isLoading) && !afterBuy &&
            <button
              disabled={ticketsToBuy.length === 0 ? true : false}
              onClick={() => { executePurchase() }}
              //onClick={() => { afterPurchaseComplete() }}
              className="w-fit self-center rounded-md border border-transparent bg-indigo-600 py-2 px-6 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:text-indigo-400 hover:bg-indigo-700 disabled:hover:bg-indigo-600">
              Buy
            </button>
          }
        </div >
      }
    </>
  );
}

export default PurchaseTicket;