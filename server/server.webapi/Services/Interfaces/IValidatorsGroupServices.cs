using MongoDB.Driver;
using server.Models.Organizer;

namespace server.Services.Interfaces;

public interface IValidatorsGroupServices
{
    public Task<List<ValidatorsGroup>> GetValidatorsGroups(int organizerId);

    public Task<ValidatorsGroup?> GetValidatorsGroup(int? organizerId, int validatorGroupId);

    public Task CreateValidatorsGroup(ValidatorsGroup validatorsGroup);

    public UpdateResult UpdateValidatorsGroup(ValidatorsGroup newValidatorsGroup, int organizerId, int groupId);

    public Task DeleteValidatorsGroup(int? organizerId, int validatorGroupId);
}