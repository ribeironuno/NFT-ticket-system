using MongoDB.Driver;
using server.Models.Auth;
using server.Models.Organizer;

namespace server.Services.Interfaces;

public interface IOrganizerServices
{
    public Task<List<OrganizerBD>> GetAllOrganizers();

    public Task CreateOrganizer(OrganizerBD organizer);

    public Task<OrganizerBD> GetOrganizerInformationByLogin(UserInformation userInformation);
    
    public Task<OrganizerBD> GetOrganizerInformationById(string id);

    public Task<List<OrganizerBD>> GetOrganizersWaitingValidation();
    
    public UpdateResult ChangeStatusAccount(OrganizerStatusUpdate organizerStatusUpdate);

    public Task UpdateOrganizerInfoAccount(OrganizerBD organizer, string id);
}