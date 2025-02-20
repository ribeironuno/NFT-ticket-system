using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;
using server.Models.Organizer;
using server.Services.Interfaces;
using server.Utils;
using System.Diagnostics;
using System.Xml;
using server.Models.Validator;
using server.Models.Event;
using ValidationType = server.Enumerations.ValidationType;

namespace server.Controllers
{
    [ApiController]
    [Route("/api/[controller]/[action]")]
    public class ValidatorsGroupController : ControllerBase
    {
        private readonly IValidatorsGroupServices _validatorsGroupsServices;
        private readonly IValidatorServices _validatorServices;
        private readonly IEventServices _eventServices;

        public ValidatorsGroupController(IValidatorsGroupServices validatorsGroupsServices,
            IValidatorServices validatorServices, IEventServices eventServices)
        {
            _validatorsGroupsServices = validatorsGroupsServices;
            _validatorServices = validatorServices;
            _eventServices = eventServices;
        }

        [HttpGet]
        [Authorize(Roles = "Organizer")]
        [ActionName("getAll")]
        public async Task<ActionResult<List<ValidatorsGroup>>> GetValidatorsGroups(int organizerId)
        {
            //gets the id in order to check if the id token is the id that requested
            var idResult = CheckIfIdReceivedIsAuthenticated(organizerId);
            if (idResult != null)
            {
                return idResult;
            }

            return await _validatorsGroupsServices.GetValidatorsGroups(organizerId);
        }


        [HttpGet]
        [Authorize(Roles = "Organizer")]
        [ActionName("getOne")]
        public async Task<ActionResult<ValidatorsGroup>> GetValidatorsGroup([Required] int organizerId,
            [Required] int validatorGroupId)
        {
            //gets the id in order to check if the id token is the id that requested
            var idResult = CheckIfIdReceivedIsAuthenticated(organizerId);
            if (idResult != null)
            {
                return idResult;
            }

            var result = await _validatorsGroupsServices.GetValidatorsGroup(
                organizerId: organizerId,
                validatorGroupId: validatorGroupId
            );

            if (result == null)
            {
                return NotFound(new { status = 404, message = "Validators Group not found" });
            }

            return result;
        }


        [HttpPost]
        [Authorize(Roles = "Organizer")]
        [ActionName("create")]
        public async Task<IActionResult> CreateValidatorsGroup([FromBody] ValidatorsGroup validatorsGroup)
        {
            string errorMsg;

            //guarantee that organizer id is empty
            if (validatorsGroup.OrganizerId != null)
            {
                errorMsg =
                    "Organizer id is automatically associated to the authenticated organizer, this field must be empty!";
                return BadRequest(new { status = 400, message = errorMsg });
            }

            //gets the id decoding the jwt token
            var tokenId = User.Claims.FirstOrDefault(x => x.Type == ClaimTypes.UserData)?.Value;

            if (tokenId == null)
            {
                return BadRequest(new { status = 401, message = "Error trying getting authenticated id" });
            }

            validatorsGroup.OrganizerId = int.Parse(tokenId);

            //submits and check for write exception
            try
            {
                await _validatorsGroupsServices.CreateValidatorsGroup(validatorsGroup: validatorsGroup);
                return Ok(new { status = 200, message = "Validators Group created" });
            }
            catch (MongoWriteException exception)
            {
                var code = exception.WriteError.Code;

                if (code == Constants.DuplicateKeyCode)
                {
                    errorMsg = "Already exists a validators group associated with the organizer with that name";
                    return BadRequest(new { status = 400, message = errorMsg });
                }

                return BadRequest(new { status = 400, message = exception.Message.ToJson() });
            }
        }


        [HttpPut]
        [Authorize(Roles = "Organizer")]
        [ActionName("update")]
        public async Task<IActionResult> UpdateValidatorsGroup([FromBody] UpdateValidatorsGroupBodyRequest bodyRequest)
        {
            string errorMsg;

            //helper to check if there are duplicated emails
            int duplicatedEmailsHelper = 0;

            //helper to check if the validators emails exists
            int validatorsExistsHelper = 0;

            //get validators
            List<ValidatorDB> validatorsList = await _validatorServices.GetAllValidators();

            //Get id from the jwt token 
            var organizerId = int.Parse(User.Claims.FirstOrDefault(x => x.Type == ClaimTypes.UserData)?.Value);

            if (organizerId == null)
            {
                return BadRequest(new { status = 400, message = "Error trying to validate your data" });
            }

            //gets the old validators group
            var oldValidatorsGroup =
                await _validatorsGroupsServices.GetValidatorsGroup(organizerId, bodyRequest.groupId);

            if (oldValidatorsGroup is null)
            {
                return NotFound(new { status = 404, message = "Validators Group not found" });
            }

            //gets the old id to prevent conflits
            bodyRequest.NewValidatorsGroup.Id = oldValidatorsGroup.Id;

            //check if the new validators array has duplicated emails
            for (int i = 0; i < bodyRequest.NewValidatorsGroup.validators.Length; i++)
            {
                for (int j = 0; j < bodyRequest.NewValidatorsGroup.validators.Length; j++)
                {
                    if (bodyRequest.NewValidatorsGroup.validators[i].Email ==
                        bodyRequest.NewValidatorsGroup.validators[j].Email)
                    {
                        duplicatedEmailsHelper++;
                    }
                }
            }

            if (duplicatedEmailsHelper > bodyRequest.NewValidatorsGroup.validators.Length)
            {
                errorMsg =
                    "There are duplicated emails in the validators array.";
                return BadRequest(new { status = 400, message = errorMsg });
            }

            //check if the validators email exists
            for (int i = 0; i < bodyRequest.NewValidatorsGroup.validators.Length; i++)
            {
                for (int j = 0; j < validatorsList.Count; j++)
                {
                    if (bodyRequest.NewValidatorsGroup.validators[i].Email == validatorsList[j].Email)
                    {
                        validatorsExistsHelper++;

                        //check if name matches
                        if (bodyRequest.NewValidatorsGroup.validators[i].Name != validatorsList[j].Name)
                        {
                            errorMsg =
                                "Some name/s doesn't match the email/s.";
                            return BadRequest(new { status = 400, message = errorMsg });
                        }
                    }
                }
            }

            if (validatorsExistsHelper != bodyRequest.NewValidatorsGroup.validators.Length)
            {
                errorMsg =
                    "Some email/s doesn't match with a valid validator.";
                return BadRequest(new { status = 400, message = errorMsg });
            }

            try
            {
                _validatorsGroupsServices.UpdateValidatorsGroup(
                    newValidatorsGroup: bodyRequest.NewValidatorsGroup,
                    organizerId: organizerId,
                    groupId: bodyRequest.groupId
                );
                return Ok(new { status = 200, message = "Validators Group updated" });
            }
            catch (Exception e)
            {
                return BadRequest(new { status = 400, message = e.Message });
            }
        }


        [HttpDelete]
        [Authorize(Roles = "Organizer")]
        [ActionName("delete")]
        public async Task<IActionResult> DeleteValidatorsGroup([Required] int groupId)
        {
            string errorMsg;

            //Get id from the jwt token 
            var organizerId = User.Claims.FirstOrDefault(x => x.Type == ClaimTypes.UserData)?.Value;

            if (organizerId == null)
            {
                return BadRequest(new { status = 400, message = "Error trying to validate your data" });
            }

            //get events
            List<EventDB> eventsList = await _eventServices.GetAllEvents();

            var varValidatorsGroup =
                await _validatorsGroupsServices.GetValidatorsGroup(int.Parse(organizerId), groupId);

            if (varValidatorsGroup is null)
            {
                return NotFound(new { status = 404, message = "Validators Group not found" });
            }

            for (int i = 0; i < eventsList.Count; i++)
            {
                if (eventsList[i].Validation.ValidationType != ValidationType.hash.ToString())
                {
                    for (int j = 0; j < eventsList[i].Validation.Validators.Length; j++)
                    {
                        if (eventsList[i].Validation.Validators[j].GroupId == varValidatorsGroup.groupId)
                        {
                            errorMsg =
                                "This Validators Group is associated with an event.";
                            return BadRequest(new { status = 400, message = errorMsg });
                        }
                    }
                }
            }

            try
            {
                await _validatorsGroupsServices.DeleteValidatorsGroup(int.Parse(organizerId), groupId);
                return Ok(new { status = 200, message = "Validators Group deleted successfully" });
            }
            catch (Exception e)
            {
                return BadRequest(new { status = 500, message = "Error trying to delete" });
            }
        }


        /**
        * Given an id checks if that id is equal to the id that is registered in token.
        * Returns the HttpResponse in case of error or null if it's valid
        */
        private ObjectResult? CheckIfIdReceivedIsAuthenticated(int? idReceived)
        {
            //gets the id from the jwt token
            var tokenId = User.Claims.FirstOrDefault(x => x.Type == ClaimTypes.UserData)?.Value;
            if (tokenId == null)
            {
                return BadRequest(new { status = 500, message = "Error getting id" });
            }

            //checks if the id received is the same that is authenticated
            if (idReceived != int.Parse(tokenId))
            {
                return Unauthorized(new
                    { status = 401, message = "The id request is not the same id authenticated!" });
            }

            return null;
        }
    }
}