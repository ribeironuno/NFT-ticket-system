using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Crypto.AES;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using server.Models;
using server.Models.Auth;
using server.Models.Event;
using server.Services.Interfaces;

namespace server.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _configuration;

    const int KeySize = 64;
    const int Iterations = 350000;
    readonly HashAlgorithmName _hashAlgorithm = HashAlgorithmName.SHA512;

    private readonly IOrganizerServices _organizerService;
    private readonly IValidatorServices _validatorService;
    private readonly IBackOfficeServices _backOfficeService;
    private readonly IEventServices _eventServices;

    public AuthController(IConfiguration configuration, IOrganizerServices organizerServices,
        IValidatorServices validatorService, IBackOfficeServices backOfficeService, IEventServices eventServices)
    {
        _configuration = configuration;
        _organizerService = organizerServices;
        _validatorService = validatorService;
        _backOfficeService = backOfficeService;
        _eventServices = eventServices;
    }

    [HttpPost("organizer")]
    public async Task OrganizerLogin([Required, FromBody] UserInformation user)
    {
        try
        {
            var organizer = await _organizerService.GetOrganizerInformationByLogin(user);

            if (!VerifyPassword(user.Password, organizer.HashedPassword.Split(':')[0],
                    Convert.FromHexString(organizer.HashedPassword.Split(':')[1])))
            {
                HttpContext.Response.StatusCode = 400;
                string[] listErrors = { "Wrong password" };
                var errorStatus = new ErrorStatus("Error trying to login", 400, listErrors);
                await HttpContext.Response.WriteAsJsonAsync(errorStatus);
            }
            else
            {
                List<Claim> claims = new List<Claim>
                {
                    new(ClaimTypes.Role, "Organizer"),
                    new(ClaimTypes.Email, user.Email),
                    new(ClaimTypes.UserData, organizer.OrganizerId!.ToString()!),
                    new(ClaimTypes.System, organizer.StatusAccount)
                };
                var token = CreateToken(claims);

                await HttpContext.Response.WriteAsJsonAsync(token);
            }
        }
        catch
        {
            HttpContext.Response.StatusCode = 400;
            string[] listErrors = { "There is no records associated with that email!" };
            var errorStatus = new ErrorStatus("Error trying to login", 400, listErrors);
            await HttpContext.Response.WriteAsJsonAsync(errorStatus);
        }
    }

    [HttpPost("validator")]
    public async Task ValidatorLogin([Required, FromBody] UserInformation user)
    {
        try
        {
            var validator = await _validatorService.GetValidatorInformationByLogin(user);

            if (!VerifyPassword(user.Password, validator.HashedPassword.Split(':')[0],
                    Convert.FromHexString(validator.HashedPassword.Split(':')[1])))
            {
                HttpContext.Response.StatusCode = 400;
                string[] listErrors = { "Wrong password" };
                var errorStatus = new ErrorStatus("Error trying to login", 400, listErrors);
                await HttpContext.Response.WriteAsJsonAsync(errorStatus);
            }
            else
            {
                List<Claim> claims = new List<Claim>
                {
                    new(ClaimTypes.Role, "Validator"),
                    new(ClaimTypes.Email, user.Email)
                };
                var token = CreateToken(claims);

                await HttpContext.Response.WriteAsJsonAsync(token);
            }
        }
        catch
        {
            HttpContext.Response.StatusCode = 400;
            string[] listErrors = { "There is no records associated with that email!" };
            var errorStatus = new ErrorStatus("Error trying to login", 400, listErrors);
            await HttpContext.Response.WriteAsJsonAsync(errorStatus);
        }
    }

    [HttpPost("validator-hash")]
    public async Task<ActionResult> ValidatorHashLogin([Required, FromBody] string hash)
    {
        try
        {
            string eventId = AES.DecryptString("AppSettings:ShortKey", hash).Split("?")[0];
            EventDB eventDb = await _eventServices.GetEvent(eventId);

            if (eventDb != null)
            {
                //Pass event id to make possible frontend control permissions
                List<Claim> claims = new List<Claim>
                {
                    new(ClaimTypes.Role, "HashValidator"),
                    new(ClaimTypes.UserData, eventDb.EventId!)
                };
                var token = CreateToken(claims);
                var completeToken = new TokenHash(token, eventId);
                return Ok(new { status = 200, message = completeToken });
            }

            return BadRequest(new { status = 400, message = "There is no event associated with that key!" });
        }
        catch (Exception e)
        {
            return BadRequest(new { status = 400, message = "Error trying to get the event!" });
        }
    }

    [HttpPost("back-office")]
    public async Task BackOfficeLogin([Required, FromBody] UserInformation user)
    {
        try
        {
            var backOfficeUser = await _backOfficeService.GetBackOfficeUserInformationByLogin(user);

            if (!VerifyPassword(user.Password, backOfficeUser.Password.Split(':')[0],
                    Convert.FromHexString(backOfficeUser.Password.Split(':')[1])))
            {
                HttpContext.Response.StatusCode = 400;
                string[] listErrors = { "Wrong password" };
                var errorStatus = new ErrorStatus("Error trying to login", 400, listErrors);
                await HttpContext.Response.WriteAsJsonAsync(errorStatus);
            }
            else
            {
                List<Claim> claims = new List<Claim>
                {
                    new(ClaimTypes.Email, user.Email),
                    new(ClaimTypes.Role, backOfficeUser.TypeAccount),
                    new(ClaimTypes.UserData, backOfficeUser.UserId!.ToString()!)
                };

                var token = CreateToken(claims);
                var tokenInfo = new TokenBackOffice(token.Token, backOfficeUser.TypeAccount, backOfficeUser.UserId);

                await HttpContext.Response.WriteAsJsonAsync(tokenInfo);
            }
        }
        catch
        {
            HttpContext.Response.StatusCode = 400;
            string[] listErrors = { "There is no records associated with that email!" };
            var errorStatus = new ErrorStatus("Error trying to login", 400, listErrors);
            await HttpContext.Response.WriteAsJsonAsync(errorStatus);
        }
    }

    private TokenJwt CreateToken(List<Claim> claims)
    {
        var key = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(
            _configuration.GetSection("AppSettings:Token").Value));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.Now.AddDays(1),
            signingCredentials: credentials);

        var jwt = new TokenJwt(new JwtSecurityTokenHandler().WriteToken(token));

        return jwt;
    }

    bool VerifyPassword(string password, string hash, byte[] salt)
    {
        var hashToCompare = Rfc2898DeriveBytes.Pbkdf2(password, salt, Iterations, _hashAlgorithm, KeySize);
        return hashToCompare.SequenceEqual(Convert.FromHexString(hash));
    }
}