using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Diagnostics;
using MongoDB.Driver;
using Pinata.Client.Models;
using server.Enumerations;
using server.Models.BackOffice;
using server.Models.Event;
using server.Services.Interfaces;
using SharpCompress.Common;
using System.Net;

namespace server.Controllers
{
    [ApiController]
    [Route("/api/[controller]/[action]")]
    public class RefundController : ControllerBase
    {
        private readonly IEventServices _eventServices;
        private readonly IRefundServices _refundServices;
        private readonly IPurchaseServices _purchaseServices;

        public RefundController(IEventServices eventServices, IRefundServices refundServices,
            IPurchaseServices purchaseServices)
        {
            _eventServices = eventServices;
            _refundServices = refundServices;
            _purchaseServices = purchaseServices;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Moderator,Organizer")]
        [ActionName("getEventRefunds")]
        public async Task<List<RefundDB>> GetEventRefunds(string eventId)
        {
            return await _refundServices.GetEventRefunds(eventId);
        }


        [HttpGet]
        [ActionName("getRefundByWallet")]
        public async Task<ActionResult<List<RefundDB>>> GetByWallet(string wallet)
        {
            return await _refundServices.GetByWallet(wallet);
        }


        [HttpGet]
        [Authorize(Roles = "Admin,Moderator")]
        [ActionName("downloadProofFiles")]
        public ActionResult DownloadProofFiles(string path)
        {
            string filePath = Path.Combine(Directory.GetCurrentDirectory(), path.Replace("/", @"\"));
            string message;

            if (System.IO.File.Exists(filePath))
            {
                var stream = new FileStream(filePath, FileMode.Open);
                return File(stream, "application/zip");
            }
            else
            {
                message = "The given path does not match any file";
                return BadRequest(new { status = 400, message = message });
            }
        }

        [HttpPost]
        [ActionName("create")]
        public async Task<IActionResult> CreateRefund([FromForm] RefundBodyReq refundBodyReq)
        {
            string message;
            string eventId = refundBodyReq.EventId;
            string walletAddress = refundBodyReq.WalletAddress;
            string description = refundBodyReq.Description;
            string type = refundBodyReq.Type;
            string title = refundBodyReq.Title;
            string eventName = refundBodyReq.EventName;
            EventDB matchingEventDB;
            string proofFilesPath;

            // CHECK API KEY

            // CHECK IF EVENT EXISTS
            try
            {
                matchingEventDB = await _eventServices.GetEvent(refundBodyReq.EventId);

                if (matchingEventDB == null)
                {
                    message = "Event id does not match any event";
                    return BadRequest(new { status = 400, message = message });
                }
            }
            catch (Exception e)
            {
                return BadRequest(new { status = 400, message = e.Message });
            }

            // CHECK IF EVENT IS REFUNDABLE
            if (matchingEventDB.Status.Equals(EventStatus.NotMinted.ToString()) ||
                matchingEventDB.Status.Equals(EventStatus.HalfMinted.ToString()))
            {
                message = "Event is not refundable";
                return BadRequest(new { status = 400, message = message });
            }

            // CHECK REFUND TIMING
            if ((matchingEventDB.DatesInfo.Duration.Equals(Duration.one_day.ToString()) &&
                 RefundTimingIsInvalid(matchingEventDB.DatesInfo.StartDate.DayMonthYear)) ||
                (matchingEventDB.DatesInfo.Duration.Equals(Duration.multiple_days.ToString()) &&
                 RefundTimingIsInvalid(matchingEventDB.DatesInfo.EndDate.DayMonthYear)))
            {
                message = "Refund window for this event has closed";
                return BadRequest(new { status = 400, message = message });
            }

            // CHECK IF WALLET ALREADY HAS A REFUND REQUEST
            try
            {
                List<RefundDB> eventRefunds = await _refundServices.GetEventRefunds(eventId);
                for (var i = 0; i < eventRefunds.Count; i++)
                {
                    if (eventRefunds[i].WalletAddress.Equals(walletAddress))
                    {
                        message = "This wallet already submited a refund request for this event";
                        return BadRequest(new { status = 400, message = message });
                    }
                }
            }
            catch (Exception e)
            {
                return BadRequest(new { status = 400, message = e.Message });
            }


            if (refundBodyReq.ProofFiles != null)
            {
                // STORE PROOF FILES AND INSERT INTO DB
                try
                {
                    proofFilesPath = await StoreProofFiles(eventId, walletAddress, refundBodyReq.ProofFiles);
                    await _refundServices.CreateRefund(
                        new RefundDB(eventId, walletAddress, eventName, type, title, description, proofFilesPath));
                    return Ok(new { status = 200, message = "Refund request created" });
                }
                catch (Exception e)
                {
                    await DeleteRefundDir(eventId);
                    return BadRequest(new { status = 400, message = e.Message });
                }
            }
            else
            {
                //INSERT INTO DB
                try
                {
                    List<RefundDB> eventRefunds = await _refundServices.GetEventRefunds(eventId);

                    if (eventRefunds.Count + 1 > 1 &&
                        !matchingEventDB.Status.Equals(EventStatus.Critical.ToString()))
                    {
                        _eventServices.setEventAsCritical(eventId);
                    }

                    await _refundServices.CreateRefund(new RefundDB(eventId, walletAddress, description));
                    return Ok(new { status = 200, message = "Refund request created" });
                }
                catch (Exception e)
                {
                    return BadRequest(new { status = 400, message = e.Message });
                }
            }
        }

        [HttpPost]
        [ActionName("closeRefunds")]
        [Authorize(Roles = "Organizer")]
        public async Task<ActionResult> CloseRefunds([FromForm] int[] refundIds, [FromForm] string txHash)
        {
            try
            {
                _refundServices.CloseRefunds(refundIds, txHash);

                return Ok(new
                {
                    status = 200,
                    message =
                        "Refunds closed!"
                });
            }
            catch (Exception e)
            {
                return BadRequest(new { status = 400, message = "Error trying to close refunds" });
            }
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Moderator")]
        [ActionName("getCriticalEventStats")]
        public async Task<ActionResult<Dictionary<string, object>>> GetCriticalEventStats(string eventId)
        {
            List<RefundDB> refundRequests = await _refundServices.GetEventRefunds(eventId);
            List<Purchase> purchases = await _purchaseServices.GetEventPurchases(eventId);
            int fraudComplaints = 0;
            int openRefunds = 0;
            int validatedTickets = 0;

            for (var i = 0; i < refundRequests.Count; i++)
            {
                if (refundRequests[i].IsRefunded == false)
                {
                    openRefunds++;
                }

                if (refundRequests[i].Type.Equals(RefundEnum.Fraud.ToString()))
                {
                    fraudComplaints++;
                }
            }

            for (var i = 0; i < purchases.Count; i++)
            {
                for (var j = 0; j < purchases[i].Tickets.Length; j++)
                {
                    if (!purchases[i].Tickets[j].IsActive)
                    {
                        validatedTickets++;
                    }
                }
            }

            return new Dictionary<string, object>()
            {
                { "totalRefundRequest", refundRequests.Count },
                { "fraudComplaints", fraudComplaints },
                { "openRefunds", openRefunds },
                { "validatedTickets", 0 }
            };
        }

        private static bool RefundTimingIsInvalid(string dateString)
        {
            DateTime inputDate = DateTime.ParseExact(dateString, "dd-MM-yyyy", null);
            DateTime currentDate = DateTime.Now;
            TimeSpan difference = currentDate - inputDate;
            return difference.TotalDays > 7;
        }

        private static async Task<string> StoreProofFiles(string eventId, string walletAddress, IFormFile proofFiles)
        {
            string path = Path.Combine("Files", "Refunds", eventId,
                walletAddress + Path.GetExtension(proofFiles.FileName)).Replace('\\', '/');

            await Task.Run(() => Directory.CreateDirectory(Path.Combine("Files", "Refunds",
                eventId).Replace('\\', '/')));

            await using (var fileStream = new FileStream(Path.Combine(
                             Directory.GetCurrentDirectory(), path), FileMode.Create))
            {
                await proofFiles.CopyToAsync(fileStream);
                fileStream.Close();
            }

            return path;
        }

        private static async Task DeleteRefundDir(string eventId)
        {
            string eventPath = Path.Combine(
                Directory.GetCurrentDirectory(), "Files", "Refunds", eventId);

            await Task.Factory.StartNew(path => Directory.Delete((string)path, true), eventPath);
        }
    }
}