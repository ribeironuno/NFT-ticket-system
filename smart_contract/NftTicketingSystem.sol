// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

/*****************************************************************************************************************
d8b   db d88888b d888888b              d888888b d888888b  .o88b. db   dD d88888b d888888b d888888b d8b   db  d888b 
888o  88 88'     `~~88~~'              `~~88~~'   `88'   d8P  Y8 88 ,8P' 88'     `~~88~~'   `88'   888o  88 88' Y8b
88V8o 88 88ooo      88                    88       88    8P      88,8P   88ooooo    88       88    88V8o 88 88     
88 V8o88 88~~~      88                    88       88    8b      88`8b   88~~~~~    88       88    88 V8o88 88  ooo!
88  V888 88         88                    88      .88.   Y8b  d8 88 `88. 88.        88      .88.   88  V888 88. ~8~
VP   V8P YP         YP                    YP    Y888888P  `Y88P' YP   YD Y88888P    YP    Y888888P VP   V8P  Y888P 

                    @@                                                                                        
               @@/      @@@.                                                                   ,,@@@,,        
             #@             @@                                                          @@@@@           @@@   
             @@               @/                                                   %@@@                    @@ 
             @@                @(                                               @@/                         @ 
             %@                @@                                            @@@                            @ 
              (@%               @    @@@@@@@@@@@@@@@@@@@@@#                /@@                             @@ 
                @@*            @@@@                         @@@@@         @@                             @@&  
                  (@@@@     &@@.                                  @@@@    @                            @@@    
                         @@@/                                         #@@@@                         @@@       
                         @@                                               @@                    @@@/          
                        @@                                                  @@@@         @@@@@@               
                        @@                                                    @@  %%%%%                       
                        @@                         %@*                         @@                             
                         @@                       (@@@@)                        @@                            
                          @@                       %@*                           @@                            
                            @@                                                  @@                            
                              @@.         @@@*               (@@               @@                             
                                .@@@         @@@@@@@@@@@@@@@@@                @@%                              
                                    @@@@                                  @@@.                                
                                         @@@@@                        @@@@                                    
                                               @@@@@@@@@@@@@@@@@@@@@@                                          
                                                                                                                          

                            .d8888. db    db .d8888. d888888b d88888b .88b  d88.                                          
                            88'  YP `8b  d8' 88'  YP `~~88~~' 88'     88'YbdP`88                                          
                            `8bo.    `8bd8'  `8bo.      88    88ooooo 88  88  88                                          
                              `Y8b.    88      `Y8b.    88    88~~~~~ 88  88  88                                          
                            db   8D    88    db   8D    88    88.     88  88  88                                          
                            `8888Y'    YP    `8888Y'    YP    Y88888P YP  YP  YP                                          
********************************************************************************************************************/

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract NftTicketingSystem is ERC721URIStorage, IERC721Receiver {
    //responsible to count the number of tokens
    uint16 public tokenCount;
    //number of events
    uint256 public eventCount;
    //the owner of the NIF ticketing system
    address payable owner;
    //wallet to burn tickets
    address private burnWallet = 0x000000000000000000000000000000000000dEaD;
    //the listing price
    uint256 listingEventFee = 6000000000000000; //0.006 MATIC
    //the transfering fee percentage
    uint256 transferEventPercentage = 10;

    //structure that defines the information about an event
    struct Event {
        //unique hash of event
        string eventId;
        //number of tickets
        uint16 quantity;
        //unix timestamp of event's init
        uint256 initDate;
        //flag to track if event exists
        bool valid;
        //flag to verify if a event was canceled
        bool canceled;
        //defines the max number of tickets per client
        uint8 maxTicketsPerClient;
        //keeps track of token ids purchased to in future check how much the client purchased
        TicketsPurchased[] ticketsPurchased;
        //wallet of organizer
        address payable organizerWallet;
        //map between the ticket hash and the Ticket object
        mapping(string => Ticket) tickets;
        //map between nonSeated section hash and the NonSeated object
        mapping(string => NonSeatedSection) nonSeatedSections;
        string[] nonSeatedSectionsString;
    }

    //structure that defines the information about an ticket
    struct Ticket {
        //token id (incremental and unique in all contract)
        uint256 tokenId;
        //unique ticket hash in the event (uniqueness in only guarantee inside a event)
        string stringId;
        //price of ticket
        uint256 price;
        //wallet of organizer
        bool valid;
        //tracks if was refunded
        bool refunded;
        //defines the ticket type
        StructureType ticketType;
    }

    //keeps the information about the tickets purchased
    struct TicketsPurchased {
        uint256 tokenId;
        string tokenHash;
    }

    //structure that defines the information about a non seated section
    struct NonSeatedSection {
        //the max number of tickets
        uint16 totalTickets;
        //the next index that is avaiable to buy
        uint16 nextIndexValid;
        //flag to track if section exists
        bool valid;
    }

    //structure types
    enum StructureType {
        NON_SEATED, //0
        SEATED //1
    }

    //semaphore to control just one call in creation of an event
    bool semEventIsAcquire = false;

    //semaphore to control just one call in the process of buying the ticket
    bool semBuyTicketIsAcquire = false;

    //mapping hash to the specific event
    mapping(string => Event) public events;

    //create the contract
    constructor() ERC721("NFT Ticketing System", "NTS") {
        owner = payable(msg.sender);
        tokenCount = 0;
    }

    /*  ********************* Organizer scoope functions ********************* */

    //structure that defines the rules to receive, in create event, the ticekts input
    struct CreateEventTicketInputs {
        //url of structure metadata
        string ipfsUrl;
        //section or row hash
        string sectionOrRowHash;
        //variable that define a structure seated or non seated
        StructureType structureType;
        //number of tickets
        uint16 quantity;
        //price of tickets in this section
        uint256 price;
    }

    //create a event
    function createEvent(
        string memory _eventHash,
        uint8 _maxTicketsPerClient,
        uint32 _initDateTimestamp,
        CreateEventTicketInputs[] memory _tickets
    ) external payable {
        require(!semEventIsAcquire, "Creating event is busy!");
        require(msg.value >= listingEventFee, "You should pay the listing fee");

        //verifies the date
        require(
            diffInHours(block.timestamp, _initDateTimestamp) > 4,
            "Start event must be, at least, 4h after now"
        );

        require(!events[_eventHash].valid, "The event hash already exists");
        require(_tickets.length != 0, "No tickets received!");
        //acquires the semaphore
        semEventIsAcquire = true;

        //create the new Event obj with the event hash
        Event storage _newEvent = events[_eventHash];
        eventCount++;
        _newEvent.initDate = _initDateTimestamp;
        _newEvent.organizerWallet = payable(msg.sender);
        _newEvent.quantity = 0;
        _newEvent.valid = true;
        //define the max numbet of tickets per client. If it's less than 1 sets the max
        if (_maxTicketsPerClient < 1) {
            _newEvent.maxTicketsPerClient = 255;
        } else {
            _newEvent.maxTicketsPerClient = _maxTicketsPerClient;
        }

        //process to mint all tickets to the contract address
        mintTickets(_newEvent, _tickets);

        //now receives the payment, the fee stays in the contract, the exceeded needs to turn back to the organizer
        uint256 exceeded = msg.value - listingEventFee;
        payable(msg.sender).transfer(exceeded);

        //release the semaphore
        semEventIsAcquire = false;
    }

    //create the tokens, associate the uri, mints them to the owner of contract and associate them to the organizer
    function mintTickets(Event storage _event, CreateEventTicketInputs[] memory _tickets)
        internal
    {
        _event.quantity = 0;
        //for each section or row (for each folder in IPFS CID)
        for (uint8 i = 0; i < _tickets.length; i++) {
            //for each ticket in section or row
            require(_tickets[i].quantity > 0, "All quantity must be higher than 0");
            for (uint8 j = 0; j < _tickets[i].quantity; j++) {
                //gets the index (number of file in folder)
                string memory metadataIndex = Strings.toString(j + 1);
                //prepare the token uri (IPFS URL section or row received + / + index + .json) -> ex: ipfs://metadata_cid/hash/1.json
                string memory tokenURI = string.concat(
                    _tickets[i].ipfsUrl,
                    "/",
                    metadataIndex,
                    ".json"
                );

                //mint to the ticket system address
                _safeMint(address(this), tokenCount);
                //sets the token uri
                _setTokenURI(tokenCount, tokenURI);

                //hash that uniquely identifies a ticket inside a event -> (section or row hash)_(index of ticket) ex: 4fcf12_1
                string memory ticketHash = string.concat(
                    _tickets[i].sectionOrRowHash,
                    "_",
                    metadataIndex
                );

                require(_tickets[i].price > 0, "Price must > 0");

                //create the ticket obj and associate with the event
                _event.tickets[ticketHash] = Ticket(
                    tokenCount, //real id token in contract
                    ticketHash, //uniquiness hash in the event that identifies only one ticket
                    _tickets[i].price, //price
                    true,
                    false,
                    _tickets[i].structureType
                );
                tokenCount++;
                _event.quantity++;
            }

            //check if the last section inserted is seated, because it's important to track the nonSeated section
            //will set the max tickets capacity in order to controll and get a easy way to check the last index purchased
            if (_tickets[i].structureType == StructureType.NON_SEATED) {
                _event.nonSeatedSectionsString.push(_tickets[i].sectionOrRowHash);
                _event.nonSeatedSections[_tickets[i].sectionOrRowHash] = NonSeatedSection(
                    _tickets[i].quantity,
                    1,
                    true
                );
            }
        }
    }

    //cancel a event
    function cancelEvent(string memory _eventHash) public modEventExists(_eventHash) {
        require(
            msg.sender == events[_eventHash].organizerWallet,
            "Events organizer wallet does not match the sender"
        );
        require(!events[_eventHash].canceled, "Event it's already canceled");
        events[_eventHash].canceled = true;
    }

    //operate refunds in an event. Returns the tokens ids refunded
    function refundByTicket(string memory _eventHash, string[] memory _ticketsHash)
        public
        payable
        modEventExists(_eventHash)
        returns (bool)
    {
        require(
            msg.sender == events[_eventHash].organizerWallet,
            "Events organizer wallet does not match the sender"
        );
        require(_ticketsHash.length > 0, "Empty tickets array");

        uint256 msgValueActualBalance = msg.value;

        //for each ticket check the price and adds
        for (uint256 i; i < _ticketsHash.length; i++) {
            if (!events[_eventHash].tickets[_ticketsHash[i]].valid) {
                revert(string.concat(_ticketsHash[i], " : Not exists"));
            }
            if (events[_eventHash].tickets[_ticketsHash[i]].refunded == true) {
                revert(string.concat(_ticketsHash[i], " : Was already refunded"));
            }
            if (ownerOf(events[_eventHash].tickets[_ticketsHash[i]].tokenId) == burnWallet) {
                revert(string.concat(_ticketsHash[i], " : Was burned"));
            }
            if (
                ownerOf(events[_eventHash].tickets[_ticketsHash[i]].tokenId) == address(this)
            ) {
                revert(string.concat(_ticketsHash[i], " : Was not sold out yet"));
            }

            //gets the client address
            address payable _client = payable(
                ownerOf(events[_eventHash].tickets[_ticketsHash[i]].tokenId)
            );

            //check if there is sufficiente value to transfer
            if (msgValueActualBalance < events[_eventHash].tickets[_ticketsHash[i]].price) {
                revert("Insuficient funds");
            }

            //sends to the client the amount
            _client.transfer(events[_eventHash].tickets[_ticketsHash[i]].price);
            //register the total to tranfer back the exceeded
            msgValueActualBalance -= events[_eventHash].tickets[_ticketsHash[i]].price;
            //sets has refunded
            events[_eventHash].tickets[_ticketsHash[i]].refunded = true;
        }
        //pays the exceeded
        payable(msg.sender).transfer(msgValueActualBalance);
        return true;
    }

    /*  ********************* Client scoope functions ********************* */

    //struture that defines the input of buyTicket function
    struct NonSeatedTicketsInput {
        string nonSeatedSectiontHash;
        uint16 quantity;
    }

    //buy one or multiple tickets
    function buyTickets(
        string memory _eventHash,
        NonSeatedTicketsInput[] memory _nonSeatedSections,
        string[] memory _seatedTicketsHash
    ) public payable modEventExists(_eventHash) {
        require(!semEventIsAcquire, "Buy ticket is busy!");
        require(!events[_eventHash].canceled, "Event was canceled!");
        require(
            _nonSeatedSections.length > 0 || _seatedTicketsHash.length > 0,
            "Empty request, it's necessary at least one ticket"
        );

        //acquire the semaphore
        semBuyTicketIsAcquire = true;

        //list responsible to be registration all token id to transfer, and only after passing all requirements the
        //function executes the transfer operation because call revert() is too expensive
        //list exclusive used to support buy tickets operation
        TicketsPurchased[] memory _ticketsPurchased = new TicketsPurchased[](
            events[_eventHash].quantity
        );

        //count of tokens if to buy
        uint8 _tokensIdsToBuyCounter = 0;
        uint256 _totalToPay = 0;

        //seated logic
        /*
            For each ticket hash will check if the ticket is free to buy, and transfers it to the user client
        */
        for (uint8 i = 0; i < _seatedTicketsHash.length; i++) {
            //check if seated ticket exists
            require(
                events[_eventHash].tickets[_seatedTicketsHash[i]].valid,
                string.concat("Seated ticket not exists ", _seatedTicketsHash[i])
            );
            //check if seated ticket is free
            require(
                !isTicketSold(_eventHash, _seatedTicketsHash[i]),
                string.concat("Seated ticket sold out ", _seatedTicketsHash[i])
            );

            //adds a new the ticket to the buying list
            _ticketsPurchased[_tokensIdsToBuyCounter].tokenId = events[_eventHash]
                .tickets[_seatedTicketsHash[i]]
                .tokenId;
            _ticketsPurchased[_tokensIdsToBuyCounter].tokenHash = _seatedTicketsHash[i];
            _tokensIdsToBuyCounter++;

            //adds the price to pay
            _totalToPay += events[_eventHash].tickets[_seatedTicketsHash[i]].price;

            //check if not reaches the max ticket per client
            require(
                events[_eventHash].maxTicketsPerClient >= _tokensIdsToBuyCounter,
                string.concat("The max number of ticket was reached! Operation cancelled!")
            );
        }

        //non seated logic
        /*
            For each non seated section, we will start tranfering the tickets to the client from the minimum 
            index of free ticket. Because all non seated section have the same value, so it's no necessary to
            track by ticket id
        */
        for (uint8 i = 0; i < _nonSeatedSections.length; i++) {
            //check if section exists
            require(
                events[_eventHash]
                    .nonSeatedSections[_nonSeatedSections[i].nonSeatedSectiontHash]
                    .valid,
                string.concat(
                    "Non seated section not exists ",
                    _nonSeatedSections[i].nonSeatedSectiontHash
                )
            );
            //gets the section for comparations
            NonSeatedSection memory _tmpNonSeatedSection = events[_eventHash]
                .nonSeatedSections[_nonSeatedSections[i].nonSeatedSectiontHash];

            //check if there is enough tickets left in section
            require(
                ((_tmpNonSeatedSection.totalTickets - _tmpNonSeatedSection.nextIndexValid) >=
                    _nonSeatedSections[i].quantity) ||
                    _tmpNonSeatedSection.nextIndexValid == 1,
                string.concat(
                    "There isn't enough tickets in section to realize the request ",
                    _nonSeatedSections[i].nonSeatedSectiontHash
                )
            );
            //saves the section hash for the next loop
            string memory _nonSeatedSectionHash = _nonSeatedSections[i].nonSeatedSectiontHash;

            //will tranfer the number of all tickets requested starting in last ticket purchased
            for (
                uint16 j = _tmpNonSeatedSection.nextIndexValid;
                j < _tmpNonSeatedSection.nextIndexValid + _nonSeatedSections[i].quantity;
                j++
            ) {
                //gets the ticket hash that is being manipulated
                string memory _ticketHashToBuy = string.concat(
                    _nonSeatedSectionHash,
                    "_",
                    Strings.toString(j)
                );

                //check if non seated ticket is free
                require(
                    !isTicketSold(_eventHash, _ticketHashToBuy),
                    string.concat("Seated ticket sold out ", _ticketHashToBuy)
                );

                //adds a new the ticket to the buying list
                _ticketsPurchased[_tokensIdsToBuyCounter].tokenId = events[_eventHash]
                    .tickets[_ticketHashToBuy]
                    .tokenId;
                _ticketsPurchased[_tokensIdsToBuyCounter].tokenHash = _ticketHashToBuy;
                _tokensIdsToBuyCounter++;

                //adds the price to pay
                _totalToPay += events[_eventHash].tickets[_ticketHashToBuy].price;

                //check if not reaches the max ticket per client
                require(
                    events[_eventHash].maxTicketsPerClient >= _tokensIdsToBuyCounter,
                    string.concat("The max number of ticket was reached! Operation cancelled!")
                );
            }
        }

        //check if there is founds to tranfer
        require(msg.value >= _totalToPay, "The client must pay for the sum of all tickets");

        //tranfers to the client all tickets
        for (uint8 i = 0; i < _tokensIdsToBuyCounter; i++) {
            _transfer(address(this), msg.sender, _ticketsPurchased[i].tokenId);
            events[_eventHash].ticketsPurchased.push(_ticketsPurchased[i]);
        }

        //PAYMENT
        //gets the excedded in all msg.value and manage the diff
        uint256 excedded = msg.value - _totalToPay;
        //sends the amount to organizer
        payable(events[_eventHash].organizerWallet).transfer(_totalToPay);
        //send the excedded back to client
        payable(msg.sender).transfer(excedded);

        //now it's secure to update all next valid ticket in non seated sections
        for (uint8 i = 0; i < _nonSeatedSections.length; i++) {
            events[_eventHash]
                .nonSeatedSections[_nonSeatedSections[i].nonSeatedSectiontHash]
                .nextIndexValid += _nonSeatedSections[i].quantity;
        }

        //realese the semaphore
        semBuyTicketIsAcquire = true;
    }

    //responsible to tranfer a nft to another client
    function transferCientTicket(
        string memory _eventHash,
        string memory _ticketHash,
        address _recipient
    ) public payable modEventAndTicketExists(_eventHash, _ticketHash) {
        require(msg.sender != _recipient, "Sender and recipient cannot be the same");
        require(isTicketSold(_eventHash, _ticketHash), "The ticket was not sold yet");
        //gets the token id
        uint256 _tokenId = getTicketTokenId(_eventHash, _ticketHash);
        require(
            msg.sender == ownerOf(_tokenId),
            "This operation can only be done by the owner of NFT"
        );

        //gets the fee
        uint256 fee = (events[_eventHash].tickets[_ticketHash].price *
            transferEventPercentage) / 100;

        require(msg.value >= fee, "Client must pay the transfer fee");

        //complete operation
        _transfer(msg.sender, _recipient, _tokenId);
        payable(events[_eventHash].organizerWallet).transfer(fee);
        payable(msg.sender).transfer(msg.value - fee);
    }

    //burns the nft from the client's wallet
    function burnTicket(string memory _eventHash, string memory _ticketHash)
        public
        modEventAndTicketExists(_eventHash, _ticketHash)
    {
        require(isTicketSold(_eventHash, _ticketHash), "The ticket was not sold yet");
        //gets the token id
        uint256 _tokenId = getTicketTokenId(_eventHash, _ticketHash);
        require(
            msg.sender == ownerOf(_tokenId),
            "This operation can only be done by the owner of NFT"
        );
        //complete operation
        _transfer(msg.sender, burnWallet, _tokenId);
    }

    /*  ********************* Support scoope functions ********************* */

    //returns the token id of a ticket
    function getTicketTokenId(string memory _eventHash, string memory _ticketHash)
        public
        view
        modEventAndTicketExists(_eventHash, _ticketHash)
        returns (uint256)
    {
        return events[_eventHash].tickets[_ticketHash].tokenId;
    }

    //given a event hash + ticket hash returns the owner
    function ownerOfByHash(string memory _eventHash, string memory _ticketHash)
        public
        view
        modEventAndTicketExists(_eventHash, _ticketHash)
        returns (address)
    {
        return ownerOf(events[_eventHash].tickets[_ticketHash].tokenId);
    }

    //returns the token uri given a pair of hashes
    function getTokenUriByHash(string memory _eventHash, string memory _ticketHash)
        public
        view
        returns (string memory)
    {
        uint256 tokenId = getTicketTokenId(_eventHash, _ticketHash);
        return tokenURI(tokenId);
    }

    //get non seated section in one event
    function getNonSeated(string memory hash) public view returns (string[] memory) {
        return events[hash].nonSeatedSectionsString;
    }

    //given a event hash + ticket hash check if the ticket was sold out
    function isTicketSold(string memory _eventHash, string memory _ticketHash)
        public
        view
        modEventAndTicketExists(_eventHash, _ticketHash)
        returns (bool)
    {
        return ownerOf(events[_eventHash].tickets[_ticketHash].tokenId) != address(this);
    }

    /*  ********************* Management functions ********************* */

    //sets rule to only onwer operations
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner operation");
        _;
    }

    //sets rule to guarantee that the even hash received corresponds to a existent event
    modifier modEventExists(string memory _eventHash) {
        require(events[_eventHash].valid, "Event not exists");
        _;
    }

    //sets rule to guarantee that the event + ticket hash exists
    modifier modEventAndTicketExists(string memory _eventHash, string memory _ticketHash) {
        require(events[_eventHash].valid, "Event not exists");
        require(events[_eventHash].tickets[_ticketHash].valid, "Ticket not exists");
        _;
    }

    //function to update listing fee
    function updateListingFee(uint256 fee) public onlyOwner {
        require(fee > 0, "Bad input");
        listingEventFee = fee;
    }

    //updates the transerfer fee
    function updateTransferEventPercentage(uint256 percentage) public onlyOwner {
        require(percentage >= 0 && percentage <= 100, "Invalid input");
        transferEventPercentage = percentage;
    }

    //withdraws all founds to the owner account
    function withdraw() public onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }

    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

    /*  ********************* Util functions ********************* */

    //gets tge difference between two dates
    function diffInHours(uint256 timestamp1, uint256 timestamp2)
        public
        pure
        returns (uint256)
    {
        return (timestamp2 - timestamp1) / 1 hours;
    }

    //given two dates in unix timestamp returns the diff in days. Fist -> date1, Last -> date2
    function getDaysDiffBetweenTwoDates(uint256 _date1, uint256 _date2)
        internal
        pure
        returns (uint256)
    {
        //checks if the event date is after today, at least, by one day
        return (_date1 - _date2) / 86400;
    }

    //given a date returns the number of days from the input date until now. Negative number if today is before
    function getDaysDiffFromDateUntilNow(uint256 _date) public view returns (uint256) {
        uint256 _now = block.timestamp;
        return getDaysDiffBetweenTwoDates(_date, _now);
    }

    //given a number in string returns the respective uint value
    function strToInt(string memory numString) internal pure returns (uint256) {
        uint256 val = 0;
        bytes memory stringBytes = bytes(numString);
        for (uint256 i = 0; i < stringBytes.length; i++) {
            uint256 exp = stringBytes.length - i;
            bytes1 ival = stringBytes[i];
            uint8 uval = uint8(ival);
            uint256 jval = uval - uint256(0x30);

            val += (uint256(jval) * (10**(exp - 1)));
        }
        return val;
    }
}
