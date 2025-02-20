using MongoDB.Driver;
using server.Enumerations;
using server.Models.Auth;
using server.Models.BackOffice;
using server.MongoDB;
using server.Services.Interfaces;

namespace server.Services.Implementation;

public class BackOfficeServices : IBackOfficeServices
{
    private readonly IMongoCollection<BackOfficeUser> _backOfficeCollection;

    public BackOfficeServices(IDbClient dbClient)
    {
        _backOfficeCollection = dbClient.GetBackOfficeCollection();
    }

    public async Task<List<BackOfficeUser>> GetBackOfficeUsers() =>
        await _backOfficeCollection.Find(_ => true).ToListAsync();

    public async Task CreateUser(BackOfficeUser backOfficeUser) =>
        await _backOfficeCollection.InsertOneAsync(backOfficeUser);

    public async Task<BackOfficeUser> GetBackOfficeUserInformationByLogin(UserInformation user) =>
        await _backOfficeCollection.Find(_ => _.Email == user.Email).SingleAsync();

    public async Task<BackOfficeUser> GetBackOfficeUserInformationById(int id) =>
        await _backOfficeCollection.Find(_ => _.UserId == id).SingleAsync();

    public async Task DeleteUser(int id) =>
        await _backOfficeCollection.DeleteOneAsync(result =>
            result.UserId == id);

    public async Task UpdateUser(BackOfficeUser updateUser)=> 
        await _backOfficeCollection.FindOneAndReplaceAsync(
            result => result.UserId == updateUser.UserId,
            updateUser);

    public async Task<List<BackOfficeUser>> GetAdmins() =>
        await _backOfficeCollection.Find(_ => _.TypeAccount == BackOfficeUserType.Admin.ToString()).ToListAsync();
}