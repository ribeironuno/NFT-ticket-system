using MongoDB.Bson;
using MongoDB.Driver;
using server.Models.Auth;
using server.Models.Organizer;
using server.Models.Validator;
using server.MongoDB;
using server.Services.Interfaces;

namespace server.Services.Implementation;

public class ValidatorServices : IValidatorServices
{
    private readonly IMongoCollection<ValidatorDB> _validatorCollection;

    public ValidatorServices(IDbClient dbClient)
    {
        _validatorCollection = dbClient.GetValidatorCollection();
    }

    public async Task<List<ValidatorDB>> GetAllValidators() =>
        await _validatorCollection.Find(result => true).ToListAsync();

    public async Task CreateValidator(ValidatorDB validator) =>
        await _validatorCollection.InsertOneAsync(validator);

    public async Task<ValidatorDB> GetValidatorInformationByLogin(UserInformation user) =>
        await _validatorCollection.Find(_ => _.Email == user.Email).SingleAsync();

    public async Task<ValidatorDB> GetValidatorInformationByEmail(string email) =>
        await _validatorCollection.Find(_ => _.Email == email).SingleAsync();

    public UpdateResult AddEventId(string email, string eventId)
    {
        var update = Builders<ValidatorDB>.Update.Push("events",
            new BsonDocument("$each", new BsonArray(new[] { eventId })).Add("$position", 0));
        
        return _validatorCollection.UpdateOne(result => result.Email == email,
            update);
    }
}