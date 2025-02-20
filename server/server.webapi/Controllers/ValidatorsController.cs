using System.Globalization;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;
using server.Enumerations;
using server.Models.Event;
using server.Models.Validator;
using server.Services.Interfaces;
using server.Utils;

namespace server.Controllers
{
    [ApiController]
    [Route("/api/[controller]/[action]")]
    public class ValidatorsController : ControllerBase
    {
        private readonly IValidatorServices _validatorService;
        private readonly IEventServices _eventServices;

        const int KeySize = 64;
        const int Iterations = 350000;
        readonly HashAlgorithmName _hashAlgorithm = HashAlgorithmName.SHA512;

        public ValidatorsController(IValidatorServices validatorServices, IEventServices eventServices)
        {
            _validatorService = validatorServices;
            _eventServices = eventServices;
        }

        [HttpGet]
        [Authorize(Roles = "Organizer")]
        [ActionName("getAll")]
        public async Task<ActionResult<List<ValidatorDB>>> GetAllValidators()
        {
            return await _validatorService.GetAllValidators();
        }


        [HttpPost]
        [ActionName("create-account")]
        public async Task<IActionResult> CreateValidator(Validator validator)
        {
            var hash = HashPassword(validator.Password, out var salt);

            var validatorDb = new ValidatorDB(validator.Name, validator.Email, hash + ":" + Convert.ToHexString(salt));

            try
            {
                await _validatorService.CreateValidator(validatorDb);
                return Ok(new { status = 200, message = "Created account" });
            }
            catch (MongoWriteException exception)
            {
                var code = exception.WriteError.Code;

                if (code == Constants.DuplicateKeyCode)
                {
                    return BadRequest(new
                        { status = 409, message = "Duplicated email" });
                }

                return BadRequest(new { status = 400, message = exception.Message.ToJson() });
            }
        }

        [HttpGet]
        [Authorize(Roles = "Validator")]
        [ActionName("events-to-validate")]
        public List<EventDB> EventsToValidate()
        {
            var userEmail = User.Claims.FirstOrDefault(x => x.Type == ClaimTypes.Email)?.Value;
            List<EventDB> eventsToValidate = new List<EventDB>();

            if (userEmail == null)
            {
                return null;
            }

            var validator = _validatorService.GetValidatorInformationByEmail(userEmail).Result;

            DateTime current = DateTime.Now.Date;

            for (var i = 0; i < validator.EventsAssociated.Length; i++)
            {
                //TODO: APENAS OBTER SE O ESTADO DO EVENTO FOR ATIVE
                var eventDb = _eventServices.GetEvent(validator.EventsAssociated[i]).Result;
                DateTime startDate = DateTime.ParseExact(eventDb.DatesInfo.StartDate.DayMonthYear, "dd-MM-yyyy",
                    CultureInfo.InvariantCulture);

                //startDate is equal or superior than the current
                if (eventDb.DatesInfo!.Duration == Duration.one_day.ToString() &&
                    current <= startDate)
                {
                    eventsToValidate.Add(eventDb);
                }
                else if (eventDb.DatesInfo!.Duration == Duration.multiple_days.ToString())
                {
                    //check if the atual date is between the startdate and end date
                    DateTime endDate = DateTime.ParseExact(eventDb.DatesInfo.EndDate.DayMonthYear, "dd-MM-yyyy",
                        CultureInfo.InvariantCulture);
                    if ((current >= startDate && current <= endDate) || current <= startDate)
                    {
                        eventsToValidate.Add(eventDb);
                    } 
                }
            }

            return eventsToValidate;
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
    }
}