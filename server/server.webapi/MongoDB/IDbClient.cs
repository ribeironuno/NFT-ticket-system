using MongoDB.Driver;
using server.Models.BackOffice;
using server.Models.Organizer;
using server.Models.Validator;
using server.Models.Event;

namespace server.MongoDB;

public interface IDbClient
{
   public IMongoCollection<Structure> GetStructureCollection();
   
   public IMongoCollection<OrganizerBD> GetOrganizerCollection();
   
   public IMongoCollection<ValidatorDB> GetValidatorCollection();
   
   public IMongoCollection<BackOfficeUser> GetBackOfficeCollection();

    public IMongoCollection<EventDB> GetEventsCollection(); 

   public IMongoCollection<ValidatorsGroup> GetValidatorsGroupCollection();

   public IMongoCollection<Purchase> GetPurchaseCollection();

    public IMongoCollection<RefundDB> GetRefundsCollection();
}