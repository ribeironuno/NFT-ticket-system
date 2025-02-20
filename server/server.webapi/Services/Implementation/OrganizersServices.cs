using MongoDB.Driver;
using server.Enumerations;
using server.Models.Auth;
using server.Models.BackOffice;
using server.Models.Organizer;
using server.MongoDB;
using server.Services.Interfaces;

namespace server.Services.Implementation;

public class OrganizersServices : IOrganizerServices
{
    private readonly IMongoCollection<OrganizerBD> _organizersCollection;

    public OrganizersServices(IDbClient dbClient)
    {
        _organizersCollection =  dbClient.GetOrganizerCollection();
    }

    public async Task<List<OrganizerBD>> GetAllOrganizers() =>
        await _organizersCollection.Find(result => true).ToListAsync();

    public async Task CreateOrganizer(OrganizerBD organizer) =>
        await _organizersCollection.InsertOneAsync(organizer);
    
    public async Task<OrganizerBD> GetOrganizerInformationByLogin(UserInformation userInformation) =>
        await _organizersCollection.Find(_ => _.Email == userInformation.Email).SingleAsync();
    
    public async Task<OrganizerBD> GetOrganizerInformationById(string id) =>
        await _organizersCollection.Find(_ => _.OrganizerId == int.Parse(id)).SingleAsync();
    
    public async Task<List<OrganizerBD>> GetOrganizersWaitingValidation() =>
        await _organizersCollection.Find(_ => _.StatusAccount == StatusAccount.WaitingValidation.ToString()).ToListAsync();

    public UpdateResult ChangeStatusAccount(OrganizerStatusUpdate organizerStatusUpdate)
    {
        var updateDef = Builders<OrganizerBD>.Update.Set(o => o.StatusAccount, organizerStatusUpdate.Status);

        return  _organizersCollection.UpdateOne(o => o.OrganizerId == organizerStatusUpdate.Id, updateDef);
    }
    
    public async Task UpdateOrganizerInfoAccount(OrganizerBD organizer, string id)
    {
        await _organizersCollection.FindOneAndReplaceAsync(
            result => result.OrganizerId == int.Parse(id),
            organizer);
    }
}