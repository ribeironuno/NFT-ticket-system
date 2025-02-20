using server.Models.Auth;
using server.Models.BackOffice;

namespace server.Services.Interfaces;

public interface IBackOfficeServices
{
    public Task<List<BackOfficeUser>> GetBackOfficeUsers();
    public Task CreateUser(BackOfficeUser backOfficeUser);
    public Task<BackOfficeUser> GetBackOfficeUserInformationByLogin(UserInformation user);
    public Task<BackOfficeUser> GetBackOfficeUserInformationById(int id);
    public Task DeleteUser(int id);
    public Task UpdateUser(BackOfficeUser updateUser);
    public Task<List<BackOfficeUser>> GetAdmins();
}