using System.ComponentModel.DataAnnotations;
using System.Data.SqlTypes;
using System.Globalization;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Crypto.AES;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Driver;
using Newtonsoft.Json;
using Pinata.Client.Models;
using server.Enumerations;
using server.Models.Event;
using server.Models.Organizer;
using server.Services.Interfaces;
using SixLabors.ImageSharp;

namespace server.Controllers
{
    [ApiController]
    [Route("/api/[controller]/[action]")]
    public class EventController : ControllerBase
    {
        private readonly IEventServices _eventServices;
        private readonly IStructureServices _structureServices;
        private readonly IValidatorsGroupServices _validatorsGroupServices;
        private readonly IValidatorServices _validatorServices;
        private static int NumTotalTickets;

        public EventController(IEventServices eventServices, IStructureServices structureServices,
            IValidatorsGroupServices validatorsGroupServices, IValidatorServices validatorServices)
        {
            _eventServices = eventServices;
            _structureServices = structureServices;
            _validatorsGroupServices = validatorsGroupServices;
            _validatorServices = validatorServices;
        }

        [HttpGet]
        [ActionName("getAll")]
        public async Task<ActionResult<List<Dictionary<string, object>>>> GetAllEvents()
        {
            List<EventDB> events = await _eventServices.GetAllEvents();
            List<Dictionary<string, object>> result = new List<Dictionary<string, object>>();

            for (var i = 0; i < events.Count; i++)
            {
                result.Add(new Dictionary<string, object>()
                {
                    { "eventName", events[i].EventName },
                    { "eventId", events[i].EventId },
                    { "category", events[i].Category },
                    { "maxTicketsPerPerson", events[i].MaxTicketsPerPerson },
                    { "banner", events[i].Banner },
                    { "floorPlan", events[i].FloorPlan },
                    { "eventNFT", events[i].EventNFT },
                    { "validation", events[i].Validation },
                    { "totalAvailableTickets", events[i].TotalAvailableTickets },
                    { "totalNumTickets", events[i].TotalNumTickets },
                    { "datesInfo", events[i].DatesInfo },
                    { "structure", events[i].Structure },
                    { "status", events[i].Status }
                });
            }

            return Ok(new { status = 200, message = result });
        }

        [HttpGet]
        [ActionName("getAllMinted")]
        public async Task<ActionResult<List<Dictionary<string, object>>>> GetAllMintedEvents()
        {
            List<EventDB> events = await _eventServices.GetAllMintedEvents();
            List<Dictionary<string, object>> result = new List<Dictionary<string, object>>();

            for (var i = 0; i < events.Count; i++)
            {
                result.Add(new Dictionary<string, object>()
                {
                    { "eventName", events[i].EventName },
                    { "eventId", events[i].EventId },
                    { "category", events[i].Category },
                    { "banner", events[i].Banner },
                    { "floorPlan", events[i].FloorPlan },
                    { "eventNFT", events[i].EventNFT },
                    { "validation", events[i].Validation },
                    { "totalAvailableTickets", events[i].TotalAvailableTickets },
                    { "totalNumTickets", events[i].TotalNumTickets },
                    { "datesInfo", events[i].DatesInfo },
                    { "structure", events[i].Structure },
                    { "status", events[i].Status }
                });
            }

            return Ok(new { status = 200, message = result });
        }

        [HttpGet]
        [ActionName("getEvent")]
        public async Task<ActionResult<Dictionary<string, object>>> GetEvent(
            [FromQuery(Name = "eventId")] string eventId)
        {
            EventDB eventDB = await _eventServices.GetEvent(eventId);

            Dictionary<string, object> result = new Dictionary<string, object>()
            {
                { "name", eventDB.EventName },
                { "datesInfo", eventDB.DatesInfo },
                { "location", eventDB.Location }, 
                { "country", eventDB.Country },
                { "eventId", eventDB.EventId },
                { "organizerId", eventDB.OrganizerId },
                { "maxTicketsPerPerson", eventDB.MaxTicketsPerPerson },
                { "category", eventDB.Category },
                { "banner", eventDB.Banner },
                { "imageType", eventDB.NftDistribution },
                { "floorPlan", eventDB.FloorPlan },
                { "eventNFT", eventDB.EventNFT },
                { "validation", eventDB.Validation },
                { "totalAvailableTickets", eventDB.TotalAvailableTickets },
                { "totalNumTickets", eventDB.TotalNumTickets },
                { "structure", eventDB.Structure },
                { "status", eventDB.Status }
            };
            return Ok(new { status = 200, message = result });
        }


        [HttpGet]
        [Authorize(Roles = "Organizer")]
        [ActionName("getOrganizerEvents")]
        public async Task<ActionResult<List<EventDB>>> GetOrganizerEvents()
        {
            return await _eventServices.GetOrganizerEvents(int.Parse(GetOrganizerId()));
        }

        [HttpGet]
        [Authorize(Roles = "Organizer")]
        [ActionName("getOrganizerEvent")]
        public async Task<EventDB> GetOrganizerEvent(string eventId)
        {
            return await _eventServices.GetOrganizerEvent(int.Parse(GetOrganizerId()), eventId);
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        [ActionName("getOrganizerCriticalEvents")]
        public async Task<List<EventDB>> GetCriticalEvents()
        {
            return await _eventServices.GetCriticalEvents();
        }

        [HttpGet]
        [Authorize(Roles = "Organizer")]
        [ActionName("generate-validators-key")]
        public async Task<ActionResult<String>> Encrypt(String eventId)
        {
            int organizerId;
            EventDB tmpEvent;

            var currentDateTime = DateTime.Now.ToString("dd/MM/yyyy HH:mm:ss", CultureInfo.InvariantCulture);

            // CHECK IF USER IS AUTHORED
            try
            {
                organizerId = int.Parse(GetOrganizerId());
            }
            catch (Exception e)
            {
                return BadRequest(new { status = 400, message = "Error trying to authenticate you" });
            }

            try
            {
                tmpEvent = _eventServices.GetEvent(eventId).Result;
            }
            catch (Exception e)
            {
                return BadRequest(new { status = 400, message = "Error trying to get the event" });
            }

            if (tmpEvent.Validation!.ValidationType == ValidationType.validators.ToString())
            {
                return BadRequest(new
                {
                    status = 400,
                    message = "You are trying to generate a hash on a event that the validation is validators only!"
                });
            }

            var key = AES.EncryptString("AppSettings:ShortKey", eventId + "?" + currentDateTime);

            try
            {
                _eventServices.UpdateValidatorsKey(organizerId, eventId, key);
            }
            catch (Exception e)
            {
                return BadRequest(new { status = 400, message = "Error trying to associate validators key" });
            }

            return key;
        }

        [HttpPost]
        [ActionName("create")]
        [Authorize(Roles = "Organizer")]
        public async Task<IActionResult> CreateEvent([FromForm] EventBodyReq eventBodyReq)
        {
            int organizerId;
            string errorMsg;
            string eventId;
            string[] infoImagesPaths;
            EventStructureDB eventStructureDB;
            ValidationBodyBD validationBodyBd;
            string eventNFT;
            NumTotalTickets = 0;

            // CHECK IF USER IS AUTHORED
            try
            {
                organizerId = int.Parse(GetOrganizerId());
                GetOrganizerEmail();
            }
            catch (Exception e)
            {
                return BadRequest(new { status = 400, message = e.Message });
            }

            // VALIDATE DATES INFO
            if (eventBodyReq.DatesInfo.Duration.Equals(Duration.one_day.ToString()))
            {
                //check structure
                if (!DatesInfoOneDayStructureIsValid(eventBodyReq.DatesInfo))
                {
                    errorMsg =
                        "Field 'datesInfo' has a non valid structure";
                    return BadRequest(new { status = 400, message = errorMsg });
                }

                //check if end time is after start time 
                if (!EndTimeIsAfterStartTime(eventBodyReq.DatesInfo.StartDate.StartTime,
                        eventBodyReq.DatesInfo.StartDate.EndTime))
                {
                    errorMsg =
                        "Field 'startTime' has to be after 'endTime'";
                    return BadRequest(new { status = 400, message = errorMsg });
                }
            }
            else
            {
                //check structure
                if (!DatesInfoMultipleDaysStructureIsValid(eventBodyReq.DatesInfo))
                {
                    errorMsg =
                        "Field 'datesInfo' has a non valid structure";
                    return BadRequest(new { status = 400, message = errorMsg });
                }

                //check if dates are equal
                if (eventBodyReq.DatesInfo.StartDate.DayMonthYear.Equals(eventBodyReq.DatesInfo.EndDate.DayMonthYear))
                {
                    errorMsg =
                        "Field 'startDate' cannot be equal to 'endDate'";
                    return BadRequest(new { status = 400, message = errorMsg });
                }
            }

            //PARSE VALIDATION
            try
            {
                validationBodyBd = ParseValidation(eventBodyReq.Validation);
            }
            catch (Exception e)
            {
                return BadRequest(new { status = 400, message = e.Message });
            }

            // VALIDATE VALIDATION STRUCTURE
            if (!ValidationStructureIsValid(validationBodyBd))
            {
                errorMsg =
                    "Field 'validation' has a non valid structure";
                return BadRequest(new { status = 400, message = errorMsg });
            }


            //PARSE EVENT STRUCTURE
            try
            {
                eventStructureDB = ParseEventStructure(eventBodyReq.Structure, organizerId, eventBodyReq.EventName);
            }
            catch (Exception e)
            {
                return BadRequest(new { status = 400, message = e.Message });
            }

            // VALIDATE EVENT STRUCTURE
            if (!EventStructureIsValid(eventStructureDB))
            {
                errorMsg =
                    "Field 'structure' cannot have 2 empty lists";
                return BadRequest(new { status = 400, message = errorMsg });
            }

            // VALIDATE NFT DISTRIBUTION
            if (!NftDistributionIsValid(eventBodyReq.NftDistribution, eventBodyReq.EventNFT, eventStructureDB))
            {
                errorMsg =
                    "Body is invalid according to the 'nftDistribution'";
                return BadRequest(new { status = 400, message = errorMsg });
            }

            // CHECK IF STRUCTURE EXISTS
            try
            {
                if (!await StructureExists(eventStructureDB, organizerId))
                {
                    errorMsg =
                        "Field 'structure' does not correspond to any structure";
                    return BadRequest(new { status = 400, message = errorMsg });
                }
            }
            catch (Exception e)
            {
                return BadRequest(new { status = 400, message = e.Message });
            }

            string dateTimenow = String.Concat(DateTime.Now.ToString().Where(c => !Char.IsWhiteSpace(c)));
            // GENERATE EVENT ID
            eventId = GenerateHashByMD5(eventBodyReq.EventName + organizerId + dateTimenow);

            //CREATE EVENT DIR
            await CreateEventDirAsync(eventId);

            // STORE INFO IMAGES (FloorPlan, Banner)
            infoImagesPaths = await StoreInfoImages(eventId, eventBodyReq.Banner, eventBodyReq.FloorPlan);

            // STORE NFT IMAGES
            try
            {
                eventNFT = await StoreNftImages(eventId, eventBodyReq.NftDistribution, eventBodyReq.EventNFT,
                    eventStructureDB);
            }
            catch (Exception e)
            {
                await DeleteEventDir(eventId);
                return BadRequest(new { status = 400, message = e.Message });
            }

            // INSERT INTO DB
            try
            {
                EventDB eventDB = new EventDB(eventBodyReq, eventId, organizerId, infoImagesPaths[0],
                    infoImagesPaths[1],
                    eventNFT, NumTotalTickets, eventStructureDB, validationBodyBd);
                await _eventServices.CreateEvent(eventDB: eventDB);
                //UPDATE VALIDATORS INFORMATION WITH THE EVENT ID
                if (validationBodyBd.ValidationType != "hash")
                {
                    UpdateValidatorsInformation(validationBodyBd, organizerId, eventId);
                }

                return Ok(new { status = 200, message = "Event created" });
            }
            catch (Exception e)
            {
                await DeleteEventDir(eventId);
                return BadRequest(new { status = 400, message = e.Message.ToJson() });
            }
        }

        /*
         * FOR EACH VALIDATOR ON THE VALIDATORS GROUPS SELECTED UPDATE THE ACCOUNT INFORMATION OF VALIDATOR
         */
        private void UpdateValidatorsInformation(ValidationBodyBD validationBodyBd, int organizerId, string eventId)
        {
            for (var i = 0; i < validationBodyBd.Validators!.Length; i++)
            {
                try
                {
                    var validatorGroup =
                        _validatorsGroupServices.GetValidatorsGroup(organizerId,
                            validationBodyBd.Validators[i].GroupId);

                    for (var j = 0; j < validatorGroup.Result!.validators.Length; j++)
                    {
                        _validatorServices.AddEventId(validatorGroup.Result.validators[j].Email, eventId);
                    }
                }
                catch (Exception e)
                {
                }
            }
        }

        [HttpPut]
        [Authorize(Roles = "Organizer")]
        [ActionName("cancel")]
        public async Task<IActionResult> CancelEvent([FromQuery(Name = "eventId")] string eventId)
        {
            string error;
            int organizerId;
            EventDB matchingEvent;

            // CHECK IF USER IS AUTHORED
            try
            {
                organizerId = int.Parse(GetOrganizerId());
                GetOrganizerEmail();
            }
            catch (Exception e)
            {
                return BadRequest(new { status = 400, message = e.Message });
            }

            // CHECK IF EVENT EXISTS
            try
            {
                matchingEvent = await _eventServices.GetOrganizerEvent(organizerId, eventId);

                if (matchingEvent == null)
                {
                    error = "Event does not exist";
                    return BadRequest(new { status = 400, message = error });
                }
            }
            catch (Exception e)
            {
                return BadRequest(new { status = 400, message = e.Message });
            }

            // CHECK IF EVENT CAN BE CANCELED
            if (matchingEvent.Status.Equals(EventStatus.Canceled.ToString()) ||
                matchingEvent.Status.Equals(EventStatus.Critical.ToString()) ||
                !IsWithinTheTimeFrameToCancel(matchingEvent.DatesInfo))
            {
                error = "Event cannot be canceled";
                return BadRequest(new { status = 400, message = error });
            }

            if (matchingEvent.Status.Equals(EventStatus.Minted.ToString()))
            {
                // CANCEL EVENT
                try
                {
                    DateTime today = DateTime.Now;
                    matchingEvent.Status = EventStatus.Canceled.ToString();
                    matchingEvent.StatusDates.Canceled =
                        today.Day.ToString("00") + "-" + today.Month.ToString("00") + "-" + today.Year;
                    await _eventServices.UpdateEvent(matchingEvent);
                    return Ok(new { status = 200, message = "Event " + eventId + " canceled" });
                }
                catch (Exception e)
                {
                    return BadRequest(new { status = 400, message = e.Message });
                }
            }
            else if (matchingEvent.Status.Equals(EventStatus.NotMinted.ToString()))
            {
                // DELETE EVENT
                try
                {
                    await _eventServices.DeleteEvent(eventId);
                    await DeleteEventDir(eventId);
                    return Ok(new { status = 200, message = "Event " + eventId + " deleted" });
                }
                catch (DirectoryNotFoundException e)
                {
                    return Ok(new
                    {
                        status = 200,
                        message = "Event " + eventId + " deleted but could not delete content directory"
                    });
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    return BadRequest(new { status = 400, message = e.Message });
                }
            }
            else
            {   // DELETE EVENT AND UNPIN FILES
                try
                {
                    var pinata = new IpfsPinataService("71a0d2c533653fd0df20",
                "b85631a9d79ca827ff17f69bffd10e9bcb8ca0e7689643522ebe195355196354 ");

                    var eventFiles = new List<string>();
                    for (int i = 0; i < matchingEvent.ResponseMetadata.Count; i++)
                    {
                        string substring = "ipfs://";
                        int index = matchingEvent.ResponseMetadata[i].Ipfs.IndexOf("ipfs://");

                        eventFiles.Add(matchingEvent.ResponseMetadata[i].Ipfs.Substring(index + substring.Length));
                    }
                    await pinata.UnpinEventFiles(eventFiles.ToArray());
                    await _eventServices.DeleteEvent(eventId);
                    await DeleteEventDir(eventId);

                    return Ok(new
                    {
                        status = 200,
                        message = "Event " + eventId + " deleted"
                    });
                }
                catch (DirectoryNotFoundException e)
                {
                    return Ok(new
                    {
                        status = 200,
                        message = "Event " + eventId + " deleted but could not delete content directory"
                    });
                }
                catch (Exception e)
                {
                    return BadRequest(new { status = 400, message = e.Message });
                }
            }
        }

        [HttpPost]
        [ActionName("initMint")]
        [Authorize(Roles = "Organizer")]
        public async Task<ActionResult> MintEvent(string eventId)
        {
            EventDB eventDb = await _eventServices.GetOrganizerEvent(int.Parse(GetOrganizerId()), eventId);

            //guarantee that the event is in the correct status
            if (eventDb.Status != EventStatus.NotMinted.ToString())
            {
                return BadRequest(new { status = 500, message = "Status event different of non minted" });
            }

            // CHECK IF USER IS AUTHORED
            try
            {
                int idAuth = int.Parse(GetOrganizerId());
                if (idAuth != eventDb.OrganizerId)
                {
                    return BadRequest(new
                    {
                        status = 500,
                        message =
                            "Operation not authorized! Organizer authenticated different from event's organizer"
                    });
                }
            }
            catch (Exception e)
            {
                return BadRequest(new { status = 500, message = e.Message });
            }

            List<ResponseMetadataInfo> responseMetadataInfos = new List<ResponseMetadataInfo>();

            //connect to pinata with API credentials
            var pinata = new IpfsPinataService("71a0d2c533653fd0df20",
                "b85631a9d79ca827ff17f69bffd10e9bcb8ca0e7689643522ebe195355196354 ");

            //upload the NFT images folder and get CID from pinata upload
            var ipfsHashNft = await pinata.UploadDirectory("./Files/Events/" + eventDb.EventId + "/" +
                                                           eventDb.EventId);

            if (!ipfsHashNft.IsSuccess)
            {
                return BadRequest(new { status = 400, message = "Error trying to NFT images!" });
            }

            //create main directory of metadata -> Files/Events/event_hash/metadata/
            Directory.CreateDirectory("./Files/Events/" +
                                      eventDb.EventId + "/" + "metadata");

            //if event only have one NFT for the all tickets of event
            if (eventDb.EventNFT != null)
            {
                var nftImageLink = "ipfs://" + ipfsHashNft.IpfsHash + "/" +
                                   eventDb.EventNFT.Split("/")[4];
                PinFileToIpfsResponse ipfsHashSection;

                for (var nonSeatedIndex = 0;
                     nonSeatedIndex < eventDb.Structure!.NonSeatedSections!.Length;
                     nonSeatedIndex++)
                {
                    //folder for metadata of non seated sections -> Files/Events/eventId/metadata/sectionId
                    var nonSeatedSectionDirectory = Path.Combine(Directory.GetCurrentDirectory(), "Files", "Events",
                        eventDb.EventId!, "metadata",
                        eventDb.Structure.NonSeatedSections[nonSeatedIndex].SectionId);

                    WriteMetadataInformationNonSeated(eventDb, nonSeatedIndex, nftImageLink,
                        nonSeatedSectionDirectory);

                    ipfsHashSection = await pinata.UploadDirectory(nonSeatedSectionDirectory + "/");

                    if (!ipfsHashSection.IsSuccess)
                    {
                        return BadRequest(
                            new { status = 400, message = "Error trying to upload metadata information!" });
                    }

                    responseMetadataInfos.Add(new ResponseMetadataInfo(ipfsHashSection.IpfsHash,
                        eventDb.Structure.NonSeatedSections[nonSeatedIndex].NumTickets,
                        eventDb.Structure.NonSeatedSections[nonSeatedIndex].SectionId,
                        "NonSeated",
                        eventDb.Structure.NonSeatedSections[nonSeatedIndex].Price));
                }

                for (var seatedSectionIndex = 0;
                     seatedSectionIndex < eventDb.Structure.SeatedSections!.Length;
                     seatedSectionIndex++)
                {
                    for (var subSectionIndex = 0;
                         subSectionIndex < eventDb.Structure.SeatedSections[seatedSectionIndex].SubSections!.Length;
                         subSectionIndex++)
                    {
                        //folder for metadata of seated sections -> Files/Events/eventId/metadata/rowId
                        var seatedSectionDirectory = Path.Combine(Directory.GetCurrentDirectory(), "Files",
                            "Events",
                            eventId, "metadata",
                            eventDb.Structure.SeatedSections[seatedSectionIndex].SubSections![subSectionIndex]
                                .RowId);

                        WriteMetadataInformationSubSection(eventDb, seatedSectionIndex, subSectionIndex,
                            nftImageLink, seatedSectionDirectory);

                        ipfsHashSection = await pinata.UploadDirectory(seatedSectionDirectory + "/");

                        if (!ipfsHashSection.IsSuccess)
                        {
                            return BadRequest(new
                            { status = 400, message = "Error trying to upload metadata information!" });
                        }

                        responseMetadataInfos.Add(new ResponseMetadataInfo(ipfsHashSection.IpfsHash,
                            eventDb.Structure.SeatedSections[seatedSectionIndex].SubSections![subSectionIndex]
                                .NumTickets,
                            eventDb.Structure.SeatedSections[seatedSectionIndex].SubSections![subSectionIndex]
                                .RowId,
                            "Seated",
                            eventDb.Structure.SeatedSections[seatedSectionIndex].SubSections![subSectionIndex]
                                .Price));
                    }
                }
            }
            else
            {
                PinFileToIpfsResponse ipfsHashSection;

                for (var nonSeatedIndex = 0;
                     nonSeatedIndex < eventDb.Structure!.NonSeatedSections!.Length;
                     nonSeatedIndex++)
                {
                    //NFT image of the section
                    var nftImageLink = "ipfs://" + ipfsHashNft.IpfsHash + "/" +
                                       eventDb.Structure!.NonSeatedSections[nonSeatedIndex].SectionNFT!.Split("/")[
                                           4];

                    //create folder for metadata of non seated sections -> Files/Events/eventId/metadata/sectionId
                    var nonSeatedSectionDirectory = Path.Combine(Directory.GetCurrentDirectory(), "Files", "Events",
                        eventDb.EventId!, "metadata",
                        eventDb.Structure.NonSeatedSections[nonSeatedIndex].SectionId);

                    WriteMetadataInformationNonSeated(eventDb, nonSeatedIndex, nftImageLink,
                        nonSeatedSectionDirectory);

                    ipfsHashSection = await pinata.UploadDirectory(nonSeatedSectionDirectory + "/");

                    if (!ipfsHashSection.IsSuccess)
                    {
                        return BadRequest(
                            new { status = 400, message = "Error trying to upload metadata information!" });
                    }

                    responseMetadataInfos.Add(new ResponseMetadataInfo(ipfsHashSection.IpfsHash,
                        eventDb.Structure.NonSeatedSections[nonSeatedIndex].NumTickets,
                        eventDb.Structure.NonSeatedSections[nonSeatedIndex].SectionId,
                        "NonSeated",
                        eventDb.Structure.NonSeatedSections[nonSeatedIndex].Price));
                }

                for (var seatedSectionIndex = 0;
                     seatedSectionIndex < eventDb.Structure.SeatedSections!.Length;
                     seatedSectionIndex++)
                {
                    for (var subSectionIndex = 0;
                         subSectionIndex < eventDb.Structure.SeatedSections[seatedSectionIndex].SubSections!.Length;
                         subSectionIndex++)
                    {
                        //NFT image of the section
                        var nftImageLink = "ipfs://" + ipfsHashNft.IpfsHash + "/" +
                                           eventDb.Structure.SeatedSections[seatedSectionIndex].SectionNFT!.Split(
                                               "/")[
                                               4];

                        //folder for metadata of seated sections -> Files/Events/eventId/metadata/rowId
                        var seatedSectionDirectory = Path.Combine(Directory.GetCurrentDirectory(), "Files",
                            "Events",
                            eventId, "metadata",
                            eventDb.Structure.SeatedSections[seatedSectionIndex].SubSections![subSectionIndex]
                                .RowId);

                        WriteMetadataInformationSubSection(eventDb, seatedSectionIndex, subSectionIndex,
                            nftImageLink, seatedSectionDirectory);

                        ipfsHashSection = await pinata.UploadDirectory(seatedSectionDirectory + "/");

                        if (!ipfsHashSection.IsSuccess)
                        {
                            return BadRequest(new
                            { status = 400, message = "Error trying to upload metadata information!" });
                        }

                        responseMetadataInfos.Add(new ResponseMetadataInfo(ipfsHashSection.IpfsHash,
                            eventDb.Structure.SeatedSections[seatedSectionIndex].SubSections![subSectionIndex]
                                .NumTickets,
                            eventDb.Structure.SeatedSections[seatedSectionIndex].SubSections![subSectionIndex]
                                .RowId,
                            "Seated",
                            eventDb.Structure.SeatedSections[seatedSectionIndex].SubSections![subSectionIndex]
                                .Price));
                    }
                }
            }

            //update BD with the metadata corresponding to each section/subsection
            try
            {
                _eventServices.UpdateWithMetaDataInfo(eventDb.OrganizerId, eventDb.EventId!,
                    responseMetadataInfos);
                return Ok(responseMetadataInfos);
            }
            catch (MongoWriteException exception)
            {
                return BadRequest(new { status = 400, message = exception.Message.ToJson() });
            }
        }

        [HttpGet]
        [ActionName("halfMint")]
        [Authorize(Roles = "Organizer")]
        public async Task<ActionResult> HalfMint([FromQuery(Name = "eventId")] string eventId)
        {
            EventDB eventDB = await _eventServices.GetEvent(eventId);

            //guarantee that the event is in the correct status
            if (eventDB.Status != EventStatus.HalfMinted.ToString())
            {
                return BadRequest(new { status = 500, message = "Status event different of half minted" });
            }

            // CHECK IF USER IS AUTHORED
            try
            {
                int idAuth = int.Parse(GetOrganizerId());
                if (idAuth != eventDB.OrganizerId)
                {
                    return BadRequest(new
                    {
                        status = 500,
                        message =
                            "Operation not authorized! Organizer authenticated different from event's organizer"
                    });
                }
            }
            catch (Exception e)
            {
                return BadRequest(new { status = 500, message = e.Message });
            }


            return Ok(eventDB.ResponseMetadata);
        }

        [HttpPost]
        [ActionName("finalizeMint")]
        [Authorize(Roles = "Organizer")]
        public async Task<ActionResult> FinalizeMint(string eventId, string txHash)
        {
            EventDB eventDB = await _eventServices.GetEvent(eventId);

            if (eventDB.Status != EventStatus.HalfMinted.ToString())
            {
                return BadRequest(new { status = 500, message = "Status event different of half minted" });
            }

            // CHECK IF USER IS AUTHORED
            int idAuth;
            try
            {
                idAuth = int.Parse(GetOrganizerId());
                if (idAuth != eventDB.OrganizerId)
                {
                    return BadRequest(new
                    {
                        status = 500,
                        message =
                            "Operation not authorized! Organizer authenticated different from event's organizer"
                    });
                }
            }
            catch (Exception e)
            {
                return BadRequest(new { status = 500, message = e.Message });
            }

            return Ok(_eventServices.UpdateFinalizeMint(organizerId: idAuth, eventId: eventId, txHash: txHash));
        }

        /**
             *  Write jsons metadata information of non seated tickets
             */
        private void WriteMetadataInformationNonSeated(EventDB eventDb, int nonSeatedIndex,
            string nftImageLink, String nonSeatedSectionDirectory)
        {
            Directory.CreateDirectory(nonSeatedSectionDirectory);

            //write jsons corresponding to the tickets information. since its non seated only the ticket number change
            for (var j = 1; j < eventDb.Structure!.NonSeatedSections![nonSeatedIndex].NumTickets + 1; j++)
            {
                var eventNonSeatedTickets = new EventMetadataNonSeatedTickets(eventDb.EventName!, nftImageLink,
                    eventDb.WebSite!,
                    eventDb.Structure.NonSeatedSections[nonSeatedIndex].Name, j);
                var jsonString = JsonConvert.SerializeObject(eventNonSeatedTickets, Formatting.Indented);
                System.IO.File.WriteAllText(nonSeatedSectionDirectory + "/" + j + ".json", jsonString);
            }
        }

        /**
             *  Write jsons metadata information of seated tickets
             */
        private void WriteMetadataInformationSubSection(EventDB eventDb, int seatedSectionIndex,
            int subSectionIndex,
            string nftImageLink, String seatedSectionDirectory)
        {
            Directory.CreateDirectory(seatedSectionDirectory);

            //create json file for each ticket
            for (var seat = 1;
                 seat <
                 eventDb.Structure!.SeatedSections![seatedSectionIndex].SubSections![subSectionIndex].NumTickets +
                 1;
                 seat++)
            {
                var eventSeatedTickets = new EventMetadataSeatedTickets(eventDb.EventName!, nftImageLink,
                    eventDb.WebSite!,
                    eventDb.Structure.SeatedSections[seatedSectionIndex].Name!,
                    eventDb.Structure.SeatedSections[seatedSectionIndex].SubSections![subSectionIndex].Row!, seat);

                var jsonString = JsonConvert.SerializeObject(eventSeatedTickets, Formatting.Indented);

                System.IO.File.WriteAllText(seatedSectionDirectory + "/" + seat + ".json", jsonString);
            }
        }


        /**
             *  Function to generate an hash for the event id
             */
        private static string GenerateHashByMD5(string stringToBeHashed)
        {
            // Use input string to calculate MD5 hash
            using (MD5 md5 = MD5.Create())
            {
                byte[] inputBytes = Encoding.ASCII.GetBytes(stringToBeHashed);
                byte[] hashBytes = md5.ComputeHash(inputBytes);

                return Convert.ToHexString(hashBytes);
            }
        }

        /**
             *  Function to validate the dates info field
             */
        private static Boolean DatesInfoOneDayStructureIsValid(DatesInfo datesInfo)
        {
            if (datesInfo.StartDate == null ||
                datesInfo.EndDate != null ||
                datesInfo.StartDate.DayMonthYear == null ||
                datesInfo.StartDate.StartTime == null ||
                datesInfo.StartDate.EndTime == null)
            {
                return false;
            }

            return true;
        }

        /**
             *  Function to validate the dates info field
             */
        private static Boolean DatesInfoMultipleDaysStructureIsValid(DatesInfo datesInfo)
        {
            if (datesInfo.StartDate == null ||
                datesInfo.EndDate == null ||
                datesInfo.StartDate.DayMonthYear == null ||
                datesInfo.EndDate.DayMonthYear == null ||
                datesInfo.StartDate.StartTime == null ||
                datesInfo.StartDate.EndTime != null ||
                datesInfo.EndDate.StartTime != null ||
                datesInfo.EndDate.EndTime == null)
            {
                return false;
            }

            return true;
        }

        /**
             *  Function to check if an hour is after another hour
             */
        private static Boolean EndTimeIsAfterStartTime(string startTime, string endTime)
        {
            TimeSpan start = TimeSpan.Parse(startTime.Replace('h', ':'));
            TimeSpan end = TimeSpan.Parse(endTime.Replace('h', ':'));

            if (start.Hours > end.Hours)
            {
                return false;
            }

            if (start.Hours == end.Hours && start.Minutes >= end.Minutes)
            {
                return false;
            }

            return true;
        }

        /**
             *  Function to create the event directory
             */
        private static async Task CreateEventDirAsync(string eventId)
        {
            string eventPath = Path.Combine(Directory.GetCurrentDirectory(), "Files", "Events", eventId);
            string infoImagesPath = Path.Combine(Directory.GetCurrentDirectory(), "Files", "Events",
                eventId, "InfoImages");
            string nftImagesPath = Path.Combine(Directory.GetCurrentDirectory(), "Files", "Events",
                eventId, eventId);
            await Task.Run(() => Directory.CreateDirectory(eventPath));
            await Task.Run(() => Directory.CreateDirectory(infoImagesPath));
            await Task.Run(() => Directory.CreateDirectory(nftImagesPath));
        }

        /**
             *  Function to store the info images (floorplan and banner)
             */
        private static async Task<string[]> StoreInfoImages(string eventId, IFormFile banner,
            IFormFile floorPlan)
        {
            string bannerPath = Path.Combine("Files", "Events", eventId,
                "InfoImages", "banner" + Path.GetExtension(banner.FileName)).Replace('\\', '/');
            ;
            string floorPlanPath = Path.Combine("Files", "Events", eventId,
                "InfoImages", "floorPlan" + Path.GetExtension(banner.FileName)).Replace('\\', '/');

            await using (var fileStream = new FileStream(Path.Combine(
                             Directory.GetCurrentDirectory(), bannerPath), FileMode.Create))
            {
                await banner.CopyToAsync(fileStream);
                fileStream.Close();
            }

            await using (var fileStream = new FileStream(
                             Path.Combine(Directory.GetCurrentDirectory(), floorPlanPath), FileMode.Create))
            {
                await floorPlan.CopyToAsync(fileStream);
                fileStream.Close();
            }

            return new string[] { bannerPath, floorPlanPath };
        }

        /**
             *  Function to parse event structure to event structure DB
             */
        private static ValidationBodyBD ParseValidation(ValidationBodyReq structureBodyReq)
        {
            ValidationBodyBD validationBodyBd = new ValidationBodyBD();
            validationBodyBd.ValidationType = structureBodyReq.ValidationType;
            if (validationBodyBd.ValidationType == "hash")
            {
                validationBodyBd.Validators = null;
            }
            else
            {
                ValidatorsGroupInformation[] validators =
                    JsonConvert.DeserializeObject<ValidatorsGroupInformation[]>(structureBodyReq.Validators);
                validationBodyBd.Validators = validators;
            }

            return validationBodyBd;
        }

        /**
             *  Function to check if the validation field structure is valid
             */
        private static Boolean ValidationStructureIsValid(ValidationBodyBD validation)
        {
            if (((validation.ValidationType.Equals(ValidationType.validators.ToString()) ||
                  validation.ValidationType.Equals(ValidationType.both.ToString())) &&
                 validation.Validators.IsNullOrEmpty()) ||
                validation.ValidationType.Equals(ValidationType.hash.ToString()) &&
                validation.Validators != null)
            {
                return false;
            }

            return true;
        }


        /**
             *  Function to parse event structure to event structure DB
             */
        private static EventStructureDB ParseEventStructure(EventStructureBodyReq structureBodyReq, int organizerId,
            string eventName)
        {
            EventStructureDB structureDB = new EventStructureDB();
            structureDB.Name = structureBodyReq.Name;
            List<EventNonSeatedSections> nonSeatedSections = new();
            List<EventSeatedSections> seatedSections = new();

            if ((structureBodyReq.NonSeatedSections == null &&
                 structureBodyReq.SeatedSections == null) ||
                structureBodyReq.NonSeatedSections.Length == 0 &&
                structureBodyReq.SeatedSections.Length == 0)
            {
                throw new Exception("Field 'structure' cannot have 2 empty lists");
            }

            if (structureBodyReq.NonSeatedSections != null)
            {
                for (var i = 0; i < structureBodyReq.NonSeatedSections.Length; i++)
                {
                    EventNonSeatedSections section =
                        BsonSerializer.Deserialize<EventNonSeatedSections>(structureBodyReq.NonSeatedSections[i]);
                    Validator.ValidateObject(section, new ValidationContext(section), validateAllProperties: true);

                    //inicial the avaialble tickets should be equals to the capacity tickets
                    section.AvailableTickets = section.NumTickets;

                    //add to global count
                    NumTotalTickets += section.NumTickets;

                    //hash with organizerID + event name + section name + atual date
                    section.SectionId = GenerateHashByMD5(organizerId + eventName + section.Name +
                                                          String.Concat(DateTime.Now.ToString()
                                                              .Where(c => !Char.IsWhiteSpace(c))));
                    nonSeatedSections.Add(section);
                }
            }

            if (structureBodyReq.SeatedSections != null)
            {
                int totalCapacityPerSeatedSection;
                for (var i = 0; i < structureBodyReq.SeatedSections.Length; i++)
                {
                    EventSeatedSections section =
                        BsonSerializer.Deserialize<EventSeatedSections>(structureBodyReq.SeatedSections[i]);
                    Validator.ValidateObject(section, new ValidationContext(section), validateAllProperties: true);
                    totalCapacityPerSeatedSection = 0;

                    for (var j = 0; j < section.SubSections.Length; j++)
                    {
                        EventSubSeatedSection current = section.SubSections[j];
                        //since the event is new create a array that represent each seat available recognizable by the sequence number
                        current.AvailableTickets = Enumerable.Range(1, current.NumTickets).ToArray();

                        //hash with organizerId + event name + row name + atual date
                        current.RowId = GenerateHashByMD5(organizerId + eventName + current.Row +
                                                          String.Concat(DateTime.Now.ToString()
                                                              .Where(c => !Char.IsWhiteSpace(c))));
                        totalCapacityPerSeatedSection += current.NumTickets;
                        //add to global count
                        NumTotalTickets += current.NumTickets;
                    }

                    //hash with organizerID + event name + section name + atual date
                    section.SectionId = GenerateHashByMD5(organizerId + eventName + section.Name +
                                                          String.Concat(DateTime.Now.ToString()
                                                              .Where(c => !Char.IsWhiteSpace(c))));

                    section.TotalAvailableTickets = section.TotalNumTickets = totalCapacityPerSeatedSection;
                    seatedSections.Add(section);
                }
            }

            structureDB.NonSeatedSections = nonSeatedSections.ToArray();
            structureDB.SeatedSections = seatedSections.ToArray();
            return structureDB;
        }


        /**
             *  Function to check if the event structure is valid
             */
        private static Boolean EventStructureIsValid(EventStructureDB structure)
        {
            if (structure.SeatedSections.Length == 0 && structure.NonSeatedSections.Length == 0)
            {
                return false;
            }

            return true;
        }

        /**
             *  Function to check if the nfts fields are correctly filled
             */
        private static Boolean NftDistributionIsValid(string nftDistribution, IFormFile eventNFT,
            EventStructureDB structure)
        {
            if (nftDistribution.Equals(NftDistribution.event_level.ToString()))
            {
                if (eventNFT == null)
                {
                    return false;
                }

                for (var i = 0; i < structure.NonSeatedSections.Length; i++)
                {
                    if (structure.NonSeatedSections[i].SectionNFT != null)
                    {
                        return false;
                    }
                }

                for (var i = 0; i < structure.SeatedSections.Length; i++)
                {
                    if (structure.SeatedSections[i].SectionNFT != null)
                    {
                        return false;
                    }
                }
            }
            else
            {
                if (eventNFT != null)
                {
                    return false;
                }

                for (var i = 0; i < structure.NonSeatedSections.Length; i++)
                {
                    if (structure.NonSeatedSections[i].SectionNFT == null)
                    {
                        return false;
                    }
                }

                for (var i = 0; i < structure.SeatedSections.Length; i++)
                {
                    if (structure.SeatedSections[i].SectionNFT == null)
                    {
                        return false;
                    }
                }
            }

            return true;
        }

        /**
             *  Function to store the nfts images on the event folder
             */
        private static async Task<string?> StoreNftImages(string eventId, string? nftDistribution,
            IFormFile eventNFT, EventStructureDB structure)
        {
            string nftImagesPath = Path.Combine("Files", "Events",
                eventId, eventId);

            if (nftDistribution.Equals(NftDistribution.event_level.ToString()))
            {
                string path = Path.Combine(nftImagesPath, eventId + Path.GetExtension(eventNFT.FileName));

                await using (var fileStream = new FileStream(
                                 Path.Combine(Directory.GetCurrentDirectory(), path), FileMode.Create))
                {
                    await eventNFT.CopyToAsync(fileStream);
                    fileStream.Close();
                }

                return path.Replace('\\', '/');
                ;
            }
            else
            {
                for (var i = 0; i < structure.SeatedSections.Length; i++)
                {
                    EventSeatedSections current = structure.SeatedSections[i];
                    //store as Files/Events/eventId/eventId/sectionId
                    current.SectionNFT = await ConvertFromBase64AndStore(nftImagesPath, current.SectionId
                        , current.SectionNFT);
                    current.SectionNFT.Replace('\\', '/');
                }

                for (var i = 0; i < structure.NonSeatedSections.Length; i++)
                {
                    EventNonSeatedSections current = structure.NonSeatedSections[i];
                    //store as Files/Events/eventId/eventId/sectionId
                    current.SectionNFT = await ConvertFromBase64AndStore(nftImagesPath,
                        current.SectionId, current.SectionNFT);
                    current.SectionNFT.Replace('\\', '/');
                }
            }

            return null;
        }

        /**
             *  Function to convert base64 string to image, and store it on the event folder
             */
        private static async Task<string> ConvertFromBase64AndStore(string nftImagesPath,
            string sectionHash, string base64String)
        {
            string fileName = String.Concat(sectionHash.Where(c => !Char.IsWhiteSpace(c)));
            string path = Path.Combine(nftImagesPath, fileName + ".png");
            var bytess = Convert.FromBase64String(base64String);

            if ((bytess.Length / 1024f) / 1024f > 5)
            {
                throw new Exception("Max file size is 5 MB");
            }

            var img = Image.Load(bytess);

            if (img.Height > 600 || img.Height < 400 || img.Width > 600 || img.Width < 400)
            {
                throw new Exception(
                    "File heigth boundaries are 400px-600px and File width boundaries are 400px-600px");
            }

            await using (var imageFile = new FileStream(
                             Path.Combine(Directory.GetCurrentDirectory(), path), FileMode.Create))
            {
                await imageFile.WriteAsync(bytess, 0, bytess.Length);
                await imageFile.FlushAsync();
                imageFile.Close();
            }

            return path.Replace('\\', '/');
        }

        /**
             *  Function to check if the structure exists
             */
        private async Task<Boolean> StructureExists(EventStructureDB eventStructureDB, int organizerId)
        {
            List<EventNonSeatedSections> nonSeatedSections = new();
            List<EventSeatedSections> seatedSections = new();
            string name = eventStructureDB.Name;

            for (var i = 0; i < eventStructureDB.NonSeatedSections.Length; i++)
            {
                var current = eventStructureDB.NonSeatedSections[i];
                nonSeatedSections.Add(new EventNonSeatedSections(current.Name, current.Door, current.NumTickets));
            }

            for (var i = 0; i < eventStructureDB.SeatedSections.Length; i++)
            {
                var current = eventStructureDB.SeatedSections[i];
                List<EventSubSeatedSection> subSeatedSections = new();

                for (var j = 0; j < current.SubSections.Length; j++)
                {
                    var currentSub = current.SubSections[j];
                    subSeatedSections.Add(new EventSubSeatedSection(currentSub.Row, currentSub.Price,
                        currentSub.NumTickets));
                }

                seatedSections.Add(new EventSeatedSections(current.Name, current.Door, subSeatedSections.ToArray(),
                    current.SectionNFT));
            }

            Structure targetStructure = await _structureServices.GetStructure(organizerId, name);
            return StructureExistsHelper(targetStructure, nonSeatedSections, seatedSections);
        }

        /**
             *  Function to compare the event strucutre with the possible matching structure
             */
        private static Boolean StructureExistsHelper(Structure targetStructure,
            List<EventNonSeatedSections> nonSeatedSections, List<EventSeatedSections> seatedSections)
        {
            if (targetStructure == null)
            {
                return false;
            }
            else
            {
                for (var i = 0; i < targetStructure.NonSeatedSections.Length; i++)
                {
                    if (targetStructure.NonSeatedSections[i].Name != nonSeatedSections[i].Name ||
                        targetStructure.NonSeatedSections[i].Door != nonSeatedSections[i].Door ||
                        targetStructure.NonSeatedSections[i].Capacity < nonSeatedSections[i].NumTickets)
                    {
                        return false;
                    }
                }

                for (var i = 0; i < targetStructure.SeatedSections.Length; i++)
                {
                    for (var j = 0; j < targetStructure.SeatedSections[i].SubSections.Length; j++)
                    {
                        if (targetStructure.SeatedSections[i].SubSections[j].Row !=
                            seatedSections[i].SubSections[j].Row ||
                            targetStructure.SeatedSections[i].SubSections[j].Capacity <
                            seatedSections[i].SubSections[j].NumTickets)
                        {
                            return false;
                        }
                    }
                }
            }

            return true;
        }

        /**
             *  Function to delete the event directory if anything goes wrong
             */
        private static async Task DeleteEventDir(string eventId)
        {
            string eventPath = Path.Combine(
                Directory.GetCurrentDirectory(), "Files", "Events", eventId);

            await Task.Factory.StartNew(path => Directory.Delete((string)path, true), eventPath);
        }

        /**
             *  Function to get the organizer Id
             */
        private string GetOrganizerId()
        {
            string? id = User.Claims.FirstOrDefault(x => x.Type == ClaimTypes.UserData)?.Value;

            if (id == null)
            {
                throw new Exception("Authorization error");
            }

            return id;
        }

        /**
             *  Function to get the organizer email
             */
        private string GetOrganizerEmail()
        {
            string? email = User.Claims.FirstOrDefault(x => x.Type == ClaimTypes.Email)?.Value;

            if (email == null)
            {
                throw new Exception("Authorization error");
            }

            return email;
        }

        /**
             *  Checks if event can be canceled according to the current date
             */
        private static bool IsWithinTheTimeFrameToCancel(DatesInfo datesInfo)
        {
            DateTime current = DateTime.Now;
            string startDate = datesInfo.StartDate.DayMonthYear;
            string startHour = datesInfo.StartDate.StartTime;

            DateTime dateToCompare
                = DateTime.ParseExact(startDate, "dd-MM-yyyy", CultureInfo.InvariantCulture);

            if (current < dateToCompare)
            {
                return true;
            }

            if (current.Date == dateToCompare)
            {
                DateTime hourToCompare
                    = DateTime.ParseExact(startHour, "HH'h'mm", CultureInfo.InvariantCulture);

                if (current < hourToCompare)
                {
                    return true;
                }
            }

            return false;
        }
    }
}
