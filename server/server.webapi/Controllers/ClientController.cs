using Microsoft.AspNetCore.Mvc;
using server.Models.Event;
using server.Services.Interfaces;

namespace server.Controllers
{
    [ApiController]
    [Route("/api/Client/[action]")]
    public class ClientController
    {
        private readonly IEventServices _eventServices;

        public ClientController(IEventServices eventServices)
        {
            _eventServices = eventServices;
        }

        [HttpGet]
        [ActionName("event")]
        public async Task<EventDB> GetEvent(String eventId)
        {
            return await _eventServices.GetEvent(eventId);
        }
    }
}