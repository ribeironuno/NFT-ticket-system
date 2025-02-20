using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using server.Enumerations;
using server.Models.BackOffice;
using server.Services.Interfaces;
using server.Models.Event;
using server.Services.Implementation;
using System.Diagnostics;

namespace server.Controllers
{
    [ApiController]
    [Route("/api/[controller]/[action]")]
    public class PurchaseController : ControllerBase
    {
        private readonly IEventServices _eventServices;
        private readonly IPurchaseServices _purchaseServices;

        public PurchaseController(IPurchaseServices purchaseServices, IEventServices eventServices)
        {
            _purchaseServices = purchaseServices;
            _eventServices = eventServices;
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        [ActionName("getAll")]
        public async Task<ActionResult<List<Purchase>>> GetPurchases()
        {
            return await _purchaseServices.GetAllPurchases();
        }

        [HttpGet]
        [ActionName("getByWallet")]
        public async Task<ActionResult<List<Purchase>>> GetPurchases(string wallet)
        {
            return await _purchaseServices.GetByWalletPurchase(wallet);
        }

        [HttpGet]
        [ActionName("getOne")]
        public async Task<ActionResult<Purchase>> GetPurchases(string wallet, string eventId)
        {
            return await _purchaseServices.GetOnePurchase(wallet, eventId);
        }


        [HttpPost]
        [Authorize(Roles = "Organizer")]
        [ActionName("getAllCombining")]
        public async Task<ActionResult<List<Purchase>>> GetAllPurchasesCombining(
            [FromForm] string eventId,
            [FromForm] string[] wallet)
        {
            return await _purchaseServices.GetAllPurchasesCombining(eventId, wallet);
        }
        
        

        [HttpPost]
        [ActionName("register")]
        public async Task<ActionResult> RegisterPurchase([FromBody] Purchase purchase)
        {
            //Check if event exists
            var eventFromDb = _eventServices.GetEvent(purchase.EventId).Result;

            if (eventFromDb is null)
            {
                return BadRequest(new { status = 400, message = "Event not exists" });
            }

            //Check if tickets are valid
            var nonSeatedTickets =
                purchase.Tickets.Where(ticket => ticket.Type == TicketType.NonSeated.ToString()).ToArray();
            var seatedTickets = purchase.Tickets.Where(ticket => ticket.Type == TicketType.Seated.ToString()).ToArray();

            if (nonSeatedTickets.Length > 0 && eventFromDb.Structure.NonSeatedSections.Length == 0)
            {
                return BadRequest(new { status = 400, message = "There isn't non seated section in event" });
            }

            if (seatedTickets.Length > 0 && eventFromDb.Structure.SeatedSections.Length == 0)
            {
                return BadRequest(new { status = 400, message = "There isn't seated section in event" });
            }

            var tmpPurchase = _purchaseServices.GetOnePurchase(purchase.Wallet, purchase.EventId).Result;
            Console.Write(tmpPurchase.ToJson());
            if (tmpPurchase is not null)
                if (tmpPurchase.Tickets.Length > eventFromDb.MaxTicketsPerPerson)
                    return BadRequest(new { status = 400, message = "Max of tickets per client exceeded" });

            //for non seated
            if (nonSeatedTickets.Length != 0)
            {
                //get dict
                IDictionary<string, EventNonSeatedSections> nonSeatedSectionsMap =
                    new Dictionary<string, EventNonSeatedSections>();
                foreach (var nonSeatedSection in eventFromDb.Structure.NonSeatedSections)
                {
                    nonSeatedSectionsMap.Add(nonSeatedSection.Name, nonSeatedSection);
                }

                foreach (var nonSeatedTicket in nonSeatedTickets)
                {
                    if (!nonSeatedSectionsMap.Keys.Contains(nonSeatedTicket.SectionName))
                    {
                        return BadRequest(new
                        {
                            status = 400,
                            message = "Non Seated section not exists: " + nonSeatedTicket.SectionName
                        });
                    }

                    Console.Write(nonSeatedSectionsMap[nonSeatedTicket.SectionName].AvailableTickets);
                    if (nonSeatedSectionsMap[nonSeatedTicket.SectionName].AvailableTickets > 0)
                    {
                        nonSeatedSectionsMap[nonSeatedTicket.SectionName].AvailableTickets--;
                        eventFromDb.TotalAvailableTickets--;
                    }
                    else
                    {
                        return BadRequest(new
                        {
                            status = 400,
                            message = "Non seated section sold out ref:" + nonSeatedTicket.SectionName
                        });
                    }
                }
            }

            if (seatedTickets.Length != 0)
            {
                IDictionary<string, EventSeatedSections> seatedSectionsMap =
                    new Dictionary<string, EventSeatedSections>();
                foreach (var seatedSection in eventFromDb.Structure.SeatedSections)
                {
                    seatedSectionsMap.Add(seatedSection.Name, seatedSection);
                }

                foreach (var seatedTicket in seatedTickets)
                {
                    if (!seatedSectionsMap.Keys.Contains(seatedTicket.SectionName))
                    {
                        return BadRequest(new
                        {
                            status = 400,
                            message = "Seated section not exists: " + seatedTicket.SectionName
                        });
                    }

                    foreach (var subSeated in seatedSectionsMap[seatedTicket.SectionName].SubSections)
                    {
                        if (seatedSectionsMap[seatedTicket.SectionName].TotalAvailableTickets < 0)
                        {
                            return BadRequest(new
                            {
                                status = 400,
                                message = "Seated section sold out ref:" +
                                          seatedSectionsMap[seatedTicket.SectionName].SubSections
                            });
                        }

                        //check the row
                        if (subSeated.Row == seatedTicket.RowName)
                        {
                            List<int> tmpListArr = new();
                            //verifies if the ticket is not sold out
                            foreach (var seat in subSeated.AvailableTickets)
                            {
                                if (seat != seatedTicket.Seat) tmpListArr.Add(seat);
                            }

                            //if no ticket was founded
                            if (tmpListArr.Count == subSeated.AvailableTickets.Length)
                            {
                                return BadRequest(new
                                    { status = 400, message = "Ticket not found ref: " + seatedTicket.Hash });
                            }

                            subSeated.AvailableTickets = tmpListArr.ToArray();
                            seatedSectionsMap[seatedTicket.SectionName].TotalAvailableTickets--;
                            eventFromDb.TotalAvailableTickets--;
                        }
                    }
                }
            }

            var purchaseFromDb = _purchaseServices.GetOnePurchase(purchase.Wallet, purchase.EventId).Result;

            if (purchaseFromDb is null)
            {
                await _purchaseServices.RegisterPurchase(purchase);
            }
            else
            {
                List<Ticket> ticketsList = new List<Ticket>();
                foreach (var ticket in purchaseFromDb.Tickets)
                {
                    ticketsList.Add(ticket);
                }

                foreach (var ticket in purchase.Tickets)
                {
                    ticketsList.Add(ticket);
                }

                purchaseFromDb.Tickets = ticketsList.ToArray();
                //update
                _purchaseServices.UpdatePurchase(purchaseFromDb);
            }

            //Update event and purchase
            await _eventServices.UpdateEvent(eventFromDb);

            return Ok();
        }

        [HttpPost]
        [ActionName("burnTicket")]
        public async Task<ActionResult> burnTicketFromPurchase([FromBody] Purchase purchase, string ticketHash)
        {
            Purchase purchaseFromDb = _purchaseServices.GetOnePurchase(purchase.Wallet, purchase.EventId).Result;

            List<Ticket> ticketsList = new List<Ticket>();
            foreach (var ticket in purchaseFromDb.Tickets)
            {
                if (ticket.Hash != ticketHash)
                {
                    ticketsList.Add(ticket);
                }
            }

            purchaseFromDb.Tickets = ticketsList.ToArray();

            //update
            _purchaseServices.BurnTicket(purchaseFromDb);
           
            return Ok();
        }
    

        [HttpPost]
        [ActionName("use-ticket")]
        [Authorize(Roles = "Validator,HashValidator")]
        public async Task<ActionResult> UseTicket([FromBody] UseTicket ticketInformation)
        {
            try
            {
                _purchaseServices.UseTicket(ticketInformation);

                return Ok(new
                {
                    status = 200,
                    message =
                        "Ticket status updated!"
                });
            }
            catch (Exception e)
            {
                return BadRequest(new { status = 400, message = "Error trying to change ticket status" });
            }
        }

        [HttpGet]
        [ActionName("check-status-ticket")]
        [Authorize(Roles = "Validator,HashValidator")]
        public async Task<ActionResult> CheckStatusTicket([FromQuery] UseTicket ticketInformation)
        {
            try
            {
                Purchase purchase =
                    _purchaseServices.GetOnePurchase(ticketInformation.Wallet, ticketInformation.EventId).Result;

                if (purchase.Tickets[ticketInformation.IndexTicket].IsActive)
                {
                    return Ok(new
                    {
                        status = 200,
                        message =
                            "Active"
                    });
                }
                else
                {
                    return Ok(new
                    {
                        status = 200,
                        message =
                            "Used"
                    });
                }
            }
            catch (Exception e)
            {
                return BadRequest(new { status = 400, message = "Error trying to get purchase data" });
            }
        }
    }
}