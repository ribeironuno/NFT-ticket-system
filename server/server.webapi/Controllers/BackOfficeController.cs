using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using server.Models;
using server.Services.Interfaces;
using server.Models.BackOffice;
using server.Models.Event;
using System.Collections;
using server.Models.Organizer;
using System.Globalization;
using MongoDB.Bson;
using MongoDB.Driver;
using server.Enumerations;
using Constants = server.Utils.Constants;
using System.Diagnostics;
using Microsoft.IdentityModel.Tokens;

namespace server.Controllers
{
    [ApiController]
    [Route("/api/Back-Office/[action]")]
    public class BackOfficeController : ControllerBase
    {
        private readonly IBackOfficeServices _backOfficeService;
        private readonly IEventServices _eventServices;
        private readonly IPurchaseServices _purchaseServices;
        private readonly IOrganizerServices _organizerServices;

        const int KeySize = 64;
        const int Iterations = 350000;
        readonly HashAlgorithmName _hashAlgorithm = HashAlgorithmName.SHA512;

        public BackOfficeController(IBackOfficeServices backOfficeServices, IEventServices eventServices,
            IPurchaseServices purchaseServices, IOrganizerServices organizerServices)
        {
            _backOfficeService = backOfficeServices;
            _eventServices = eventServices;
            _purchaseServices = purchaseServices;
            _organizerServices = organizerServices;
        }

        [HttpGet]
        [ActionName("users"), Authorize(Roles = "Admin")]
        public async Task GetBackOfficeUsers()
        {
            //Get email from the jwt token 
            var userEmail = User.Claims.FirstOrDefault(x => x.Type == ClaimTypes.Email)?.Value;

            if (userEmail == null)
            {
                HttpContext.Response.StatusCode = 400;
                var errorStatus = new ErrorStatus("Error occurred trying to validate your data", 400, null);
                await HttpContext.Response.WriteAsJsonAsync(errorStatus);
            }

            await HttpContext.Response.WriteAsJsonAsync(
                _backOfficeService.GetBackOfficeUsers().Result);
        }

        [HttpPost]
        [ActionName("create-user"), Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateUser([FromBody] InsertBackOfficeUser backOfficeUser)
        {
            //Get email from the jwt token 
            var userEmail = User.Claims.FirstOrDefault(x => x.Type == ClaimTypes.Email)?.Value;

            if (userEmail == null)
            {
                return BadRequest(new
                { status = 409, message = "Error occurred trying to validate your data" });
            }

            var hash = HashPassword(backOfficeUser.Password, out var salt);
            backOfficeUser.Password = hash + ":" + Convert.ToHexString(salt);

            //submits and check for write exception
            try
            {
                var user = new BackOfficeUser(backOfficeUser);
                await _backOfficeService.CreateUser(user);
                return Ok(new { status = 200, message = "Created account" });
            }
            catch (MongoWriteException exception)
            {
                var code = exception.WriteError.Code;

                if (code == Constants.DuplicateKeyCode)
                {
                    return BadRequest(new
                    { status = 409, message = "Already exist a account with that email" });
                }

                return BadRequest(new { status = 400, message = exception.Message.ToJson() });
            }
        }

        [HttpPut]
        [ActionName("update-user"), Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateUser([FromBody] UpdateBackOfficeUser updateUser)
        {
            //Get email from the jwt token 
            var userEmail = User.Claims.FirstOrDefault(x => x.Type == ClaimTypes.Email)?.Value;
            var userToBeUpdated = _backOfficeService.GetBackOfficeUserInformationById(updateUser.UserId);
            var update = true;

            if (userEmail == null || userToBeUpdated.Result == null)
            {
                return BadRequest(new
                { status = 400, message = "Error occurred trying to validate data" });
            }

            //if the role of account changed from admin to moderator, verify if there won't be the last user admin
            if (userToBeUpdated.Result.TypeAccount == BackOfficeUserType.Admin.ToString() &&
                updateUser.TypeAccount == BackOfficeUserType.Moderator.ToString())
            {
                //get all admins to check if there is only one admin left. if true, doesn't delete user
                var admins = _backOfficeService.GetAdmins();
                if (admins.Result.Count == 1)
                {
                    update = false;
                }
            }

            //it means, password changed
            if (updateUser.Password != null)
            {
                var hash = HashPassword(updateUser.Password, out var salt);
                updateUser.Password = hash + ":" + Convert.ToHexString(salt);
            }
            else
            {
                updateUser.Password = userToBeUpdated.Result.Password;
            }

            if (update)
            {
                try
                {
                    var userUpdateBd = new BackOfficeUser(updateUser, userToBeUpdated.Result.Id!);
                    await _backOfficeService.UpdateUser(userUpdateBd);
                    return Ok(new { status = 200, message = "User update successfully" });
                }
                catch (MongoCommandException exception)
                {
                    var code = exception.Code;

                    if (code == Constants.DuplicateKeyCode)
                    {
                        return BadRequest(new
                        { status = 409, message = "Already exist a user with that email" });
                    }

                    return BadRequest(new { status = 400, message = "Error trying to update" });
                }
            }
            else
            {
                return BadRequest(new
                { status = 409, message = "The user type cannot be updated because its the last admin!" });
            }
        }

        [HttpDelete]
        [ActionName("delete-user"), Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteUser([FromBody] int id)
        {
            //Get email from the jwt token 
            var userEmail = User.Claims.FirstOrDefault(x => x.Type == ClaimTypes.Email)?.Value;
            var userToBeRemoved = _backOfficeService.GetBackOfficeUserInformationById(id);
            var delete = true;

            if (userEmail == null || userToBeRemoved.Result == null)
            {
                return BadRequest(new
                { status = 400, message = "Error occurred trying to validate data" });
            }

            if (userToBeRemoved.Result.TypeAccount == BackOfficeUserType.Admin.ToString())
            {
                //get all admins to check if there is only one admin left. if true, doesn't delete user
                var admins = _backOfficeService.GetAdmins();
                if (admins.Result.Count == 1)
                {
                    delete = false;
                }
            }

            if (delete)
            {
                try
                {
                    await _backOfficeService.DeleteUser(id);
                    return Ok(new { status = 200, message = "User deleted successfully" });
                }
                catch (Exception e)
                {
                    return BadRequest(new { status = 400, message = "Error trying to delete" });
                }
            }
            else
            {
                return BadRequest(new
                { status = 409, message = "The user cannot be deleted because its the last admin!" });
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
        [ActionName("getAdminStatistics")]
        public async Task<ActionResult<Dictionary<string, object>>> GetAdminStatistics()
        {
            List<EventDB> eventsList = await _eventServices.GetAllEvents();
            List<Purchase> purchasesList = await _purchaseServices.GetAllPurchases();
            List<OrganizerBD> organizersList = await _organizerServices.GetAllOrganizers();

            Dictionary<string, object> result = new Dictionary<string, object>()
            {
                { "month_profit", getMontProfit(purchasesList) },
                { "profit", getProfit(purchasesList) },
                { "organizers", getOrganizers(organizersList) },
                { "events_category", getEventsCategories(eventsList) },
                { "top_events", getTopEvents(eventsList) },
            };

            return result;
        }

        private static Dictionary<string, object>[] getMontProfit(List<Purchase> purchasesList)
        {
            Dictionary<string, object>[] toSend = new Dictionary<string, object>[2];
            var acumulativeDictionary = new Dictionary<string, object>();
            var nonAcumulativedictionary = new Dictionary<string, object>();
            decimal[] acumulative = { 0M, 0M, 0M, 0M, 0M, 0M };
            decimal[] non_acumulative = { 0M, 0M, 0M, 0M, 0M, 0M };

            for (int i = 0; i < purchasesList.Count; i++)
            {
                var monthOfCreation = purchasesList[i].DateOfPurchase.Split("-")[1];
                var yearOfCreation = purchasesList[i].DateOfPurchase.Split("-")[2];

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

            acumulative[0] = non_acumulative[0];
            acumulative[1] = non_acumulative[0] + non_acumulative[1];
            acumulative[2] = non_acumulative[0] + non_acumulative[1] + non_acumulative[2];
            acumulative[3] = non_acumulative[0] + non_acumulative[1] + non_acumulative[2] + non_acumulative[3];
            acumulative[4] = non_acumulative[0] + non_acumulative[1] + non_acumulative[2] + non_acumulative[3] +
                             non_acumulative[4];
            acumulative[5] = non_acumulative[0] + non_acumulative[1] + non_acumulative[2] + non_acumulative[3] +
                             non_acumulative[4] + non_acumulative[5];

            acumulativeDictionary.Add("label", "Acumulative");
            acumulativeDictionary.Add("values", acumulative);
            nonAcumulativedictionary.Add("label", "Non acumulative");
            nonAcumulativedictionary.Add("values", non_acumulative);

            toSend[0] = acumulativeDictionary;
            toSend[1] = nonAcumulativedictionary;

            return toSend;
        }

        private static Dictionary<string, string> getProfit(List<Purchase> purchasesList)
        {
            Dictionary<string, string> toSend = new Dictionary<string, string>();
            var sumYear = 0M;
            var sumAll = 0M;

            for (int i = 0; i < purchasesList.Count; i++)
            {
                sumAll += purchasesList[i].TotalPrice;
                if (purchasesList[i].DateOfPurchase.Split("-")[2] == DateTime.Now.ToString("yyyy"))
                {
                    sumYear += purchasesList[i].TotalPrice;
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

        private static Dictionary<string, int> getOrganizers(List<OrganizerBD> organizersList)
        {
            Dictionary<string, int> toSend = new Dictionary<string, int>();
            var sumMonth = 0;
            var sumYear = 0;
            var sumAll = 0;

            for (int i = 0; i < organizersList.Count; i++)
            {
                if (organizersList[i].ActivationDate != "")
                {
                    sumAll += 1;
                    if (organizersList[i].ActivationDate.Split("-")[2] == DateTime.Now.ToString("yyyy"))
                    {
                        sumYear += 1;
                        if (organizersList[i].ActivationDate.Split("-")[1] == DateTime.Now.ToString("MM"))
                        {
                            sumMonth += 1;
                        }
                    }
                }
            }

            toSend.Add("month", sumMonth);
            toSend.Add("year", sumYear);
            toSend.Add("all", sumAll);

            return toSend;
        }

        private static int[] getEventsCategories(List<EventDB> eventsList)
        {
            int[] toSend = { 0, 0, 0, 0, 0, 0 };

            for (int i = 0; i < eventsList.Count; i++)
            {
                if (eventsList[i].Category == "Music")
                {
                    toSend[0] += 1;
                }
                else if (eventsList[i].Category == "Sports")
                {
                    toSend[1] += 1;
                }
                else if (eventsList[i].Category == "Comedy")
                {
                    toSend[2] += 1;
                }
                else if (eventsList[i].Category == "Theatre")
                {
                    toSend[3] += 1;
                }
                else if (eventsList[i].Category == "Cinema")
                {
                    toSend[4] += 1;
                }
                else if (eventsList[i].Category == "Others")
                {
                    toSend[5] += 1;
                }
            }

            return toSend;
        }

        private static Dictionary<string, object>[] getTopEvents(List<EventDB> eventsList)
        {
            var tempDict = new Dictionary<string, int>();
            Dictionary<string, object>[] toSend = new Dictionary<string, object>[5];

            for (int i = 0; i < eventsList.Count; i++)
            {
                tempDict.Add(eventsList[i].EventName + " " + i, eventsList[i].TotalNumTickets - eventsList[i].TotalAvailableTickets);
            }


            var sortedDict = from entry in tempDict orderby entry.Value descending select entry;

            var top1 = new Dictionary<string, object>();
            var top2 = new Dictionary<string, object>();
            var top3 = new Dictionary<string, object>();
            var top4 = new Dictionary<string, object>();
            var top5 = new Dictionary<string, object>();

            if (sortedDict.ToArray().Length > 0)
            {
                top1.Add("event_name", sortedDict.ToArray()[0].Key);
                top1.Add("number_tickets", sortedDict.ToArray()[0].Value);
            }

            if (sortedDict.ToArray().Length > 1)
            {
                top2.Add("event_name", sortedDict.ToArray()[1].Key);
                top2.Add("number_tickets", sortedDict.ToArray()[1].Value);

            }

            if (sortedDict.ToArray().Length > 2)
            {
                top3.Add("event_name", sortedDict.ToArray()[2].Key);
                top3.Add("number_tickets", sortedDict.ToArray()[2].Value);
            }

            if (sortedDict.ToArray().Length > 3)
            {
                top4.Add("event_name", sortedDict.ToArray()[3].Key);
                top4.Add("number_tickets", sortedDict.ToArray()[3].Value);
            }

            if (sortedDict.ToArray().Length > 4)
            {

                top5.Add("event_name", sortedDict.ToArray()[4].Key);
                top5.Add("number_tickets", sortedDict.ToArray()[4].Value);
            }

            toSend[0] = top1;
            toSend[1] = top2;
            toSend[2] = top3;
            toSend[3] = top4;
            toSend[4] = top5;

            return toSend;
        }
    }
}