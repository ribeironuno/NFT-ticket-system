using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;
using server.Enumerations;
using server.Models.Organizer;
using server.Services.Interfaces;
using Newtonsoft.Json;
using Constants = server.Utils.Constants;
using server.Services.Implementation;
using server.Models.BackOffice;
using server.Models.Event;
using System.ComponentModel.DataAnnotations;
using System.Globalization;
using System.Diagnostics;
using System.Collections;
using server.Models.Auth;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Http;

namespace server.Controllers
{
    [ApiController]
    [Route("/api/[controller]/[action]")]
    public class OrganizersController : ControllerBase
    {
        private readonly IOrganizerServices _organizerService;
        private readonly IEventServices _eventServices;
        private readonly IPurchaseServices _purchaseServices;

        const int KeySize = 64;
        const int Iterations = 350000;
        readonly HashAlgorithmName _hashAlgorithm = HashAlgorithmName.SHA512;

        public OrganizersController(IOrganizerServices organizerServices, IEventServices eventServices, IPurchaseServices purchaseServices)
        {
            _organizerService = organizerServices;
            _eventServices = eventServices;
            _purchaseServices = purchaseServices;
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        [ActionName("getAll")]
        public async Task<ActionResult<List<OrganizerBD>>> getAllOrganizers()
        {
            return await _organizerService.GetAllOrganizers();
        }

        [HttpGet]
        [ActionName("information-account"), Authorize(Roles = "Organizer")]
        public async Task<ActionResult<OrganizerBD>> GetOrganizers()
        {
            //Get email from the jwt token 
            var organizerId = User.Claims.FirstOrDefault(x => x.Type == ClaimTypes.UserData)?.Value;


            if (organizerId == null)
            {
                return BadRequest(new { status = 400, message = "Error trying to validate your data" });
            }

            return await _organizerService.GetOrganizerInformationById(
                organizerId
            );
            ;
        }

        [HttpGet]
        [ActionName("organizers-waiting-validation"), Authorize(Roles = "Admin, Moderator")]
        public async Task<ActionResult<List<OrganizerBD>>> OrganizersWaitingReview()
        {
            return await _organizerService.GetOrganizersWaitingValidation();
        }

        [HttpPost]
        [ActionName("create-account")]
        public async Task<IActionResult> CreateOrganizer([FromForm] Organizer organizer)
        {
            if (organizer.Type == OrganizerType.Company.ToString())
            {
                organizer.Gender = null;
                organizer.DOB = null;
            }

            //Check if the gender and dob was passed by if the organizer is particular
            if (organizer.Type == OrganizerType.Personal.ToString() &&
                (organizer.Gender == null || organizer.DOB == null))
            {
                return BadRequest(new
                {
                    status = 400,
                    message = "There is necessary a gender and date of birth if your account is Personal"
                });
            }

            //Create paths
            string pathAddressProof = Path.Combine(Directory.GetCurrentDirectory(), "Files", "Organizer", "Proofs",
                "address" + organizer.NIF + Path.GetExtension(organizer.AddressProof.FileName));

            string pathNifProof = Path.Combine(Directory.GetCurrentDirectory(), "Files", "Organizer", "Proofs",
                "nif" + organizer.NIF + Path.GetExtension(organizer.NIFProof.FileName));

            // Saving Images
            await using (var fileStream = new FileStream(pathAddressProof, FileMode.Create))
            {
                await organizer.AddressProof.CopyToAsync(fileStream);
            }

            await using (var fileStream = new FileStream(pathNifProof, FileMode.Create))
            {
                await organizer.NIFProof.CopyToAsync(fileStream);
            }

            //save relative paths on db
            pathAddressProof = Path.Combine("Files", "Organizer", "Proofs",
                "address" + organizer.NIF + Path.GetExtension(organizer.AddressProof.FileName));

            pathNifProof = Path.Combine("Files", "Organizer", "Proofs",
                "nif" + organizer.NIF + Path.GetExtension(organizer.NIFProof.FileName));

            var hash = HashPassword(organizer.Password, out var salt);

            var organizerBd = new OrganizerBD(organizer, hash + ":" + Convert.ToHexString(salt), pathAddressProof,
                pathNifProof, StatusAccount.WaitingValidation.ToString(), "");

            //submits and check for write exception
            try
            {
                await _organizerService.CreateOrganizer(organizerBd);
                return Ok(new { status = 200, message = "Created account" });
            }
            catch (MongoWriteException exception)
            {
                var code = exception.WriteError.Code;

                if (code == Constants.DuplicateKeyCode)
                {
                    return BadRequest(new
                    { status = 409, message = "Duplicated data" });
                }

                return BadRequest(new { status = 400, message = exception.Message.ToJson() });
            }
        }

        [HttpPut]
        [ActionName("update-account"), Authorize(Roles = "Organizer")]
        public async Task<IActionResult> EditOrganizer([FromForm] OrganizerUpdate organizer)
        {
            //Get id from the jwt token 
            var userId = User.Claims.FirstOrDefault(x => x.Type == ClaimTypes.UserData)?.Value;

            if (userId == null)
            {
                return BadRequest(new { status = 400, message = "Error trying to validate your data" });
            }

            //Get previous data of organizer
            var organizerPrevious = await _organizerService.GetOrganizerInformationById(
                userId);

            //If the organizer was banned then the information cannot be updated
            if (organizerPrevious.StatusAccount == StatusAccount.Banned.ToString())
            {
                return BadRequest(new
                {
                    status = 400,
                    message = "Your account is banned, so your information cannot be updated"
                });
            }

            if (organizerPrevious.Type == OrganizerType.Company.ToString())
            {
                organizer.Gender = null;
                organizer.DOB = null;
            }

            //Check if the gender and dob was passed by if the organizer is particular
            if (organizerPrevious.Type == OrganizerType.Personal.ToString() &&
                (organizer.Gender == null || organizer.DOB == null))
            {
                return BadRequest(new
                {
                    status = 400,
                    message = "There is necessary a gender and date of birth if your account is Personal"
                });
            }

            //If the organizer sent the password then the new password should be hashed
            if (organizer.Password != null)
            {
                var hash = HashPassword(organizer.Password, out var salt);

                organizerPrevious.HashedPassword = hash + ":" + Convert.ToHexString(salt);
            }

            //Check if only one document was sent, then the update cannot be occur.
            if ((organizer.AddressProof == null && organizer.NIFProof != null) ||
                (organizer.AddressProof != null && organizer.NIFProof == null))
            {
                return BadRequest(new
                {
                    status = 400,
                    message = "If you wanna a review of your status account, send the two files proofs"
                });
            }

            //If the two files was sent, then save the files and insert the new url proofs files
            if (organizer.AddressProof != null && organizer.NIFProof != null)
            {
                //Create paths
                string pathAddressProof = Path.Combine(Directory.GetCurrentDirectory(), "Files", "Organizer", "Proofs",
                    "address" + organizerPrevious.NIF + Path.GetExtension(organizer.AddressProof.FileName));

                string pathNifProof = Path.Combine(Directory.GetCurrentDirectory(), "Files", "Organizer", "Proofs",
                    "nif" + organizerPrevious.NIF + Path.GetExtension(organizer.NIFProof.FileName));

                // Saving Images
                await using (var fileStream = new FileStream(pathAddressProof, FileMode.Create))
                {
                    await organizer.AddressProof.CopyToAsync(fileStream);
                }

                await using (var fileStream = new FileStream(pathNifProof, FileMode.Create))
                {
                    await organizer.NIFProof.CopyToAsync(fileStream);
                }

                //save relative paths on db
                organizerPrevious.AddressProofUrl = Path.Combine("Files", "Organizer", "Proofs",
                    "address" + organizerPrevious.NIF + Path.GetExtension(organizer.AddressProof.FileName));

                organizerPrevious.NIFProofUrl = Path.Combine("Files", "Organizer", "Proofs",
                    "nif" + organizerPrevious.NIF + Path.GetExtension(organizer.NIFProof.FileName));

                organizerPrevious.StatusAccount = StatusAccount.WaitingValidation.ToString();
            }

            string[] wallets = JsonConvert.DeserializeObject<string[]>(organizer.WalletAddress[0]);

            organizerPrevious.WalletAddress = wallets;
            organizerPrevious.Name = organizer.Name;
            organizerPrevious.Email = organizer.Email;
            organizerPrevious.DOB = organizer.DOB;
            organizerPrevious.Gender = organizer.Gender;
            organizerPrevious.PhoneNumber = organizer.PhoneNumber;
            organizerPrevious.Address = organizer.Address;
            organizerPrevious.Country = organizer.Country;

            //submits and check for write exception
            try
            {
                await _organizerService.UpdateOrganizerInfoAccount(organizerPrevious, userId);
                return Ok(new { status = 200, message = "Updated account" });
            }
            catch (MongoWriteException exception)
            {
                var code = exception.WriteError.Code;

                if (code == Constants.DuplicateKeyCode)
                {
                    return BadRequest(new
                    { status = 409, message = "Duplicated data" });
                }

                return BadRequest(new { status = 400, message = exception.Message.ToJson() });
            }
        }

        [HttpPut]
        [ActionName("change-status-account"), Authorize(Roles = "Admin, Moderator")]
        public async Task<ActionResult> ChangeStatusAccount(OrganizerStatusUpdate organizerStatusUpdate)
        {
            try
            {
                _organizerService.ChangeStatusAccount(organizerStatusUpdate);
                return Ok(new { status = 200, message = "Changed status account" });
            }
            catch (MongoWriteException exception)
            {
                return BadRequest(new { status = 400, message = exception.Message.ToJson() });
            }
        }

        string HashPassword(string password, out byte[] salt)
        {
            salt = RandomNumberGenerator.GetBytes(KeySize);
            var hash = Rfc2898DeriveBytes.Pbkdf2(
                Encoding.UTF8.GetBytes(password),
                salt,
                Iterations,
                _hashAlgorithm,
                KeySize);
            return Convert.ToHexString(hash);
        }


        [HttpGet]
        [ActionName("getOrganizerStatistics"), Authorize(Roles = "Organizer")]
        public async Task<ActionResult<Dictionary<string, object>>> getOrganizerStatistics()
        {
            int organizerId;
            // CHECK IF USER IS AUTHORED
            try
            {
                organizerId = int.Parse(GetOrganizerId());
            }
            catch (Exception e)
            {
                return BadRequest(new { status = 400, message = e.Message });
            }

            List<EventDB> organizerEventsList = await _eventServices.GetOrganizerEvents(organizerId);
            List<EventDB> eventsList = await _eventServices.GetAllEvents();
            List<Purchase> purchasesList = await _purchaseServices.GetAllPurchases();

            Dictionary<string, object> result = new Dictionary<string, object>()
            {
                { "month_profit", getMontProfit(purchasesList, organizerEventsList) },
                { "profit", getProfit(purchasesList, organizerEventsList) },
                { "total_tickets", getTotalTicketsSold(organizerEventsList) }, //TODO
                { "events_status", getEventsStatus(organizerEventsList) },
                { "best_event_position", GetBestEvent(eventsList, organizerId) },
                { "number_events_all", organizerEventsList.Count },
            };

            return result;
        }

        private static int getTotalTicketsSold(List<EventDB> events)
        {
            int ticketsSold = 0;

            for (var i = 0; i < events.Count; i++)
            {
                ticketsSold += events[i].TotalNumTickets - events[i].TotalAvailableTickets;
            }
            return ticketsSold;
        }

        private static Dictionary<string, object>[] getMontProfit(List<Purchase> purchasesList, List<EventDB> eventsList)
        {
            Dictionary<string, object>[] toSend = new Dictionary<string, object>[2];
            var monthOfCreation = "";
            var yearOfCreation = "";
            var acumulativeDictionary = new Dictionary<string, object>();
            var nonAcumulativedictionary = new Dictionary<string, object>();
            decimal[] acumulative = { 0M, 0M, 0M, 0M, 0M, 0M };
            decimal[] non_acumulative = { 0M, 0M, 0M, 0M, 0M, 0M };

            for (int i = 0; i < purchasesList.Count; i++)
            {
                monthOfCreation = purchasesList[i].DateOfPurchase.Split("-")[1];
                yearOfCreation = purchasesList[i].DateOfPurchase.Split("-")[2];

                for (int j = 0; j < eventsList.Count; j++)
                {
                    if (purchasesList[i].EventId == eventsList[j].EventId)
                    {
                        if (monthOfCreation == DateTime.Now.ToString("MM") && yearOfCreation == DateTime.Now.ToString("yyyy"))
                        {
                            var purchaseMonth = int.Parse(purchasesList[i].DateOfPurchase.Split("-")[0]);

                            if (purchaseMonth > 0 && purchaseMonth <= 5)
                            {
                                non_acumulative[0] += purchasesList[i].TotalPrice;
                            }
                            else if (purchaseMonth > 5 && purchaseMonth <= 10)
                            {
                                non_acumulative[1] += purchasesList[i].TotalPrice;
                            }
                            else if (purchaseMonth > 10 && purchaseMonth <= 15)
                            {
                                non_acumulative[2] += purchasesList[i].TotalPrice;
                            }
                            else if (purchaseMonth > 15 && purchaseMonth <= 20)
                            {
                                non_acumulative[3] += purchasesList[i].TotalPrice;
                            }
                            else if (purchaseMonth > 20 && purchaseMonth <= 25)
                            {
                                non_acumulative[4] += purchasesList[i].TotalPrice;
                            }
                            else if (purchaseMonth > 25 && purchaseMonth <= 31)
                            {
                                non_acumulative[5] += purchasesList[i].TotalPrice;
                            }
                        }
                    }
                }
            }

            acumulative[0] = non_acumulative[0];
            acumulative[1] = non_acumulative[0] + non_acumulative[1];
            acumulative[2] = non_acumulative[0] + non_acumulative[1] + non_acumulative[2];
            acumulative[3] = non_acumulative[0] + non_acumulative[1] + non_acumulative[2] + non_acumulative[3];
            acumulative[4] = non_acumulative[0] + non_acumulative[1] + non_acumulative[2] + non_acumulative[3] + non_acumulative[4];
            acumulative[5] = non_acumulative[0] + non_acumulative[1] + non_acumulative[2] + non_acumulative[3] + non_acumulative[4] + non_acumulative[5];

            acumulativeDictionary.Add("label", "Acumulative");
            acumulativeDictionary.Add("values", acumulative);
            nonAcumulativedictionary.Add("label", "Non acumulative");
            nonAcumulativedictionary.Add("values", non_acumulative);

            toSend[0] = acumulativeDictionary;
            toSend[1] = nonAcumulativedictionary;

            return toSend;
        }

        private static Dictionary<string, string> getProfit(List<Purchase> purchasesList, List<EventDB> eventsList)
        {
            Dictionary<string, string> toSend = new Dictionary<string, string>();
            var sumYear = 0M;
            var sumAll = 0M;

            for (int i = 0; i < purchasesList.Count; i++)
            {
                for (int j = 0; j < eventsList.Count; j++)
                {
                    if (purchasesList[i].EventId == eventsList[j].EventId)
                    {
                        sumAll += purchasesList[i].TotalPrice;

                        if (purchasesList[i].DateOfPurchase.Split("-")[2] == DateTime.Now.ToString("yyyy"))
                        {
                            sumYear += purchasesList[i].TotalPrice;
                        }
                    }
                }
            }

            // Gets a NumberFormatInfo associated with the en-US culture.
            NumberFormatInfo nfi = new CultureInfo("pt-PT", false).NumberFormat;

            nfi.CurrencyDecimalSeparator = ",";
            nfi.CurrencyGroupSeparator = ".";
            nfi.CurrencySymbol = "";

            toSend.Add("year", Convert.ToDecimal(sumYear).ToString("C2", nfi));
            toSend.Add("all", Convert.ToDecimal(sumAll).ToString("C2", nfi));

            return toSend;
        }

        private static int[] getEventsStatus(List<EventDB> eventsList)
        {
            int[] toSend = { 0, 0, 0, 0, 0 };

            for (int i = 0; i < eventsList.Count; i++)
            {
                if (eventsList[i].Status == "NotMinted")
                {
                    toSend[0] += 1;
                }
                else if (eventsList[i].Status == "Minted")
                {
                    toSend[1] += 1;
                }
                else if (eventsList[i].Status == "HalfMinted")
                {
                    toSend[2] += 1;
                }
                else if (eventsList[i].Status == "Canceled")
                {
                    toSend[3] += 1;
                }
                else if (eventsList[i].Status == "Critical")
                {
                    toSend[4] += 1;
                }
            }

            return toSend;
        }

        private Dictionary<string, object> GetBestEvent(List<EventDB> eventsList, int organizerId)
        {
            var tempDict = new Dictionary<string, object>();
            Dictionary<string, object> toSend = new Dictionary<string, object>();

            for (int i = 0; i < eventsList.Count; i++)
            {
                tempDict.Add(eventsList[i].EventId, eventsList[i].TotalNumTickets - eventsList[i].TotalAvailableTickets);
            }

            var sortedDict = from entry in tempDict orderby entry.Value descending select entry;

            bool exit = false;
            for (int i = 0; i < sortedDict.ToArray().Length; i++)
            {
                EventDB eventHelper = _eventServices.GetEventSync(sortedDict.ToArray()[i].Key);
                if (eventHelper.OrganizerId == organizerId)
                {
                    toSend.Add("event_name", eventHelper.EventName);
                    toSend.Add("sold_tickets", sortedDict.ToArray()[i].Value);
                    toSend.Add("position", i + 1);
                    exit = true;
                    break;
                }
                if (exit) break;
            }

            return toSend;
        }

        /**
         * Given a email checks if that id is equal to the id that is registered in token.
         * Returns the HttpResponse in case of error or null if it's valid
         */
        private ObjectResult? CheckIfIdReceivedIsAuthenticated(int idReceived)
        {

            //gets the id from the jwt token
            var organizerId = User.Claims.FirstOrDefault(x => x.Type == ClaimTypes.UserData)?.Value;


            Debug.WriteLine(organizerId + "   " + idReceived);


            if (organizerId == null)
            {
                return BadRequest(new { status = 500, message = "Error getting id" });
            }

            try
            {
                var organizerIdInt = int.Parse(organizerId);
                //checks if the email received is the same that is authenticated
                if (idReceived != organizerIdInt)
                {
                    return Unauthorized(new
                    { status = 401, message = "The id request is not the same id authenticated!" });
                }
            }
            catch (Exception e)
            {
                return BadRequest(new { status = 500, message = "Error getting id" });
            }

            return null;
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
    }
}