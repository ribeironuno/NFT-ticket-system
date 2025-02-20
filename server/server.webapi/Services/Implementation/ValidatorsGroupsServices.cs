using MongoDB.Driver;
using server.Models.Organizer;
using server.MongoDB;
using server.Services.Interfaces;

namespace server.Services.Implementation;

public class ValidatorsGroupsServices : IValidatorsGroupServices
{
    private readonly IMongoCollection<ValidatorsGroup> _validatorsGroupsCollection;

    public ValidatorsGroupsServices(IDbClient dbClient)
    {
        _validatorsGroupsCollection = dbClient.GetValidatorsGroupCollection();
    }

    public async Task CreateValidatorsGroup(ValidatorsGroup validatorsGroup) =>
        await _validatorsGroupsCollection.InsertOneAsync(validatorsGroup);

    public async Task DeleteValidatorsGroup(int? organizerId, int validatorGroupId) =>
        await _validatorsGroupsCollection.DeleteOneAsync(result =>
            result.OrganizerId == organizerId && result.groupId == validatorGroupId);

    public async Task<ValidatorsGroup?> GetValidatorsGroup(int? organizerId, int validatorGroupId) =>
        await _validatorsGroupsCollection
            .Find(result => result.OrganizerId == organizerId && result.groupId == validatorGroupId)
            .SingleOrDefaultAsync();

    public async Task<List<ValidatorsGroup>> GetValidatorsGroups(int organizerId) =>
        await _validatorsGroupsCollection.Find(result => result.OrganizerId == organizerId).ToListAsync();

    public UpdateResult UpdateValidatorsGroup(ValidatorsGroup newValidatorsGroup, int organizerId, int groupId)
    {
        var updateDef =
            Builders<ValidatorsGroup>.Update
                .Set(result => result.ValidatorsGroupName, newValidatorsGroup.ValidatorsGroupName)
                .Set(result => result.validators, newValidatorsGroup.validators);
        ;

        return _validatorsGroupsCollection.UpdateOne(result => result.OrganizerId == organizerId && result.groupId == groupId,
            updateDef);
    }
}