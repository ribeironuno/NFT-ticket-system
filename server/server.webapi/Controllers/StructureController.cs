using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;
using Nethereum.ABI.Util;
using server.Models;
using server.Models.Organizer;
using server.Services.Interfaces;
using server.Utils;

namespace server.Controllers
{
    [ApiController]
    [Route("/api/[controller]/[action]")]
    public class StructuresController : ControllerBase
    {
        private readonly IStructureServices _structuresService;

        public StructuresController(IStructureServices structuresServices) =>
            _structuresService = structuresServices;

        [HttpGet]
        [Authorize(Roles = "Organizer")]
        [ActionName("getAll")]
        public async Task<ActionResult<List<Structure>>> GetStructures([Required] int organizerId)
        {
            //gets the email in order to check if the email token is the email that requested
            var idResult = CheckIfIdReceivedIsAuthenticated(organizerId);
            if (idResult != null)
            {
                return idResult;
            }

            return await _structuresService.GetStructures(organizerId);
        }

        [HttpGet]
        [Authorize(Roles = "Organizer")]
        [ActionName("getOne")]
        public async Task<ActionResult<Structure>> GetStructure([Required] int organizerId,
            [Required] string structureName)
        {
            //gets the email in order to check if the email token is the email that requested
            var emailResult = CheckIfIdReceivedIsAuthenticated(organizerId);
            if (emailResult != null)
            {
                return emailResult;
            }

            var result = await _structuresService.GetStructure(
                structureName: structureName,
                organizerId: organizerId
            );

            if (result == null)
            {
                return NotFound(new { status = 404, message = "Structure not found" });
            }

            return result;
        }

        [HttpPost]
        [Authorize(Roles = "Organizer")]
        [ActionName("create")]
        public async Task<IActionResult> CreateStructure([FromBody] Structure structure)
        {
            string errorMsg;

            //guarantee that organizer id is empty
            if (structure.OrganizerId != null)
            {
                errorMsg =
                    "Organizer id is automatically associated to the authenticated organizer, this field must be empty!";
                return BadRequest(new { status = 400, message = errorMsg });
            }

            //adds the new stats object
            var stats = new StructureStats();
            stats.CreationDate = Helper.GetTodaysDate();
            stats.TotalEvents = 0;
            stats.TotalSeats = CountSeatsInSeated(structure.SeatedSections, structure.NonSeatedSections);
            stats.TotalSections = structure.SeatedSections.Length + structure.NonSeatedSections.Length;
            structure.Stats = stats;

            //check if both sections are empty, in case of true cancel
            if (structure.SeatedSections.Length == 0 && structure.NonSeatedSections.Length == 0)
            {
                errorMsg =
                    "It's mandatory to at least one type of section (seated or non seated) to have content inside. Both are empty!";
                return BadRequest(new { status = 400, message = errorMsg });
            }

            //gets the id decoding the jwt token
            var organizerId = User.Claims.FirstOrDefault(x => x.Type == ClaimTypes.UserData)?.Value;
            if (organizerId == null)
            {
                return BadRequest(new { status = 401, message = "Error trying getting id token" });
            }

            try
            {
                var organizerIdInt = int.Parse(organizerId);
                structure.OrganizerId = organizerIdInt;
            }
            catch (Exception e)
            {
                return BadRequest(new { status = 400, message = "Error trying getting id token. Parsing Error" });
            }


            //submits and check for write exception
            try
            {
                await _structuresService.CreateStructure(structure: structure);
                return Ok(new { status = 200, message = "Structure created" });
            }
            catch (MongoWriteException exception)
            {
                var code = exception.WriteError.Code;

                if (code == Constants.DuplicateKeyCode)
                {
                    errorMsg = "Already exists a structure associated with the organizer with that name";
                    return BadRequest(new { status = 400, message = errorMsg });
                }

                return BadRequest(new { status = 400, message = exception.Message.ToJson() });
            }
        }

        [HttpPut]
        [Authorize(Roles = "Organizer")]
        [ActionName("update")]
        public async Task<IActionResult> UpdateStructure([FromBody] UpdateStructureBodyRequest bodyRequest)
        {
            string errorMsg;
            //gets the id in order to check if the id token is the id that requested
            var idResult = CheckIfIdReceivedIsAuthenticated(bodyRequest.OrganizerId);
            if (idResult != null)
            {
                return idResult;
            }

            bodyRequest.NewStructure.OrganizerId = bodyRequest.OrganizerId;

            //gets the old structure
            var oldStructure = await _structuresService.GetStructure(
                organizerId: bodyRequest.OrganizerId,
                structureName: bodyRequest.OldStructureName
            );

            if (oldStructure is null)
            {
                return NotFound(new { status = 404, message = "Structure not found" });
            }

            //gets the old id to prevent conflicts
            bodyRequest.NewStructure.Id = oldStructure.Id;

            var stats = new StructureStats();
            stats.CreationDate = oldStructure.Stats!.CreationDate;
            stats.TotalEvents = oldStructure.Stats.TotalEvents;
            stats.TotalSeats = CountSeatsInSeated(
                totalSeated: bodyRequest.NewStructure.SeatedSections,
                totalNonSeated: bodyRequest.NewStructure.NonSeatedSections
            );
            stats.TotalSections = bodyRequest.NewStructure.SeatedSections.Length +
                                  bodyRequest.NewStructure.NonSeatedSections.Length;

            bodyRequest.NewStructure.Stats = stats;

            //check if both sections are empty, in case of true cancel
            if (bodyRequest.NewStructure.SeatedSections.Length == 0 &&
                bodyRequest.NewStructure.NonSeatedSections.Length == 0)
            {
                errorMsg =
                    "It's mandatory to at least one type of section (seated or non seated) to have content inside.Both are empty!";
                return BadRequest(new { status = 400, message = errorMsg });
            }

            try
            {
                await _structuresService.UpdateStructure(
                    organizerId: bodyRequest.OrganizerId,
                    structureName: bodyRequest.OldStructureName,
                    structure: bodyRequest.NewStructure
                );
                return Ok(new { status = 200, message = "Structure updated" });
            }
            catch (Exception e)
            {
                return BadRequest(new { status = 400, message = e.Message });
            }
        }

        [HttpDelete]
        [Authorize(Roles = "Organizer")]
        [ActionName("delete")]
        public async Task<IActionResult> DeleteStructure([Required, FromBody] EmailStructureBodyRequest bodyRequest)
        {
            //gets the id in order to check if the id token is the organizer that requested
            var emailResult = CheckIfIdReceivedIsAuthenticated(bodyRequest.OrganizerId);
            if (emailResult != null)
            {
                return emailResult;
            }

            var structure =
                await _structuresService.GetStructure(
                    organizerId: bodyRequest.OrganizerId,
                    structureName: bodyRequest.StructureName
                );

            if (structure is null)
            {
                return NotFound(new { status = 404, message = "Structure not found" });
            }

            try
            {
                await _structuresService.DeleteStructure(
                    structureName: bodyRequest.StructureName,
                    organizerId: bodyRequest.OrganizerId
                );
                return Ok(new { status = 200, message = "Structure deleted successfully" });
            }
            catch (Exception e)
            {
                return BadRequest(new { status = 500, message = "Error trying to delete" });
            }
        }

        /**
         * Sum all seats in the sections
         */
        private static int CountSeatsInSeated(SeatedSections[] totalSeated, NonSeatedSections[] totalNonSeated)
        {
            var count = 0;

            foreach (var section in totalSeated)
            {
                foreach (var subSection in section.SubSections)
                {
                    count += subSection.Capacity;
                }
            }

            foreach (var section in totalNonSeated)
            {
                count += section.Capacity;
            }

            return count;
        }

        /**
         * Given a email checks if that email is equal to the email that is registered in token.
         * Returns the HttpResponse in case of error or null if it's valid
         */
        private ObjectResult? CheckIfIdReceivedIsAuthenticated(int idReceived)
        {
            //gets the id from the jwt token
            var organizerId = User.Claims.FirstOrDefault(x => x.Type == ClaimTypes.UserData)?.Value;
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
    }
}