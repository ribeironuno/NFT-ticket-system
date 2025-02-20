using MongoDB.Driver;
using server.Models.Auth;
using server.Models.Organizer;
using server.Models.Validator;

namespace server.Services.Interfaces;

public interface IValidatorServices
{
    public Task<List<ValidatorDB>> GetAllValidators();

    public Task CreateValidator(ValidatorDB validator);
    
    public Task<ValidatorDB> GetValidatorInformationByLogin(UserInformation user);

    public Task<ValidatorDB> GetValidatorInformationByEmail(string email);

    public UpdateResult AddEventId(string email, string eventId);
}