using Microsoft.Extensions.Options;
using MongoDB.Driver;
using server.Models.BackOffice;
using server.Models.Event;
using server.Models.Organizer;
using server.Models.Validator;

namespace server.MongoDB;

public class DbClient : IDbClient
{

    private MongoClient mongoClient;
    private IMongoDatabase mongoDatabase;

    public DbClient(
        IOptions<ServerDatabaseSettings> serverSettings)
    {
        mongoClient = new MongoClient(serverSettings.Value.ConnectionString);
        mongoDatabase = mongoClient.GetDatabase(serverSettings.Value.DatabaseName);
    }

    public IMongoCollection<Structure> GetStructureCollection()
    {
       return mongoDatabase.GetCollection<Structure>("structures");
    }
    
    public IMongoCollection<OrganizerBD> GetOrganizerCollection()
    {
        return mongoDatabase.GetCollection<OrganizerBD>("organizers");
    }
    
    public IMongoCollection<ValidatorDB> GetValidatorCollection()
    {
        return mongoDatabase.GetCollection<ValidatorDB>("validators");
    }
    
    public IMongoCollection<BackOfficeUser> GetBackOfficeCollection()
    {
        return mongoDatabase.GetCollection<BackOfficeUser>("backOffice");
    }

    public IMongoCollection<EventDB> GetEventsCollection()
    {
        return mongoDatabase.GetCollection<EventDB>("events");
    }

    public IMongoCollection<ValidatorsGroup> GetValidatorsGroupCollection()
    {
        return mongoDatabase.GetCollection<ValidatorsGroup>("validatorsGroups");
    }

    public IMongoCollection<Purchase> GetPurchaseCollection()
    {
        return mongoDatabase.GetCollection<Purchase>("purchases");
    }

    public IMongoCollection<RefundDB> GetRefundsCollection()
    {
        return mongoDatabase.GetCollection<RefundDB>("refunds");
    }
}