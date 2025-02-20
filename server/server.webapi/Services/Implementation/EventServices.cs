using System.Globalization;
using MongoDB.Driver;
using server.Enumerations;
using server.Models.Event;
using server.Models.Organizer;
using server.MongoDB;
using server.Services.Interfaces;

namespace server.Services.Implementation
{
    public class EventServices : IEventServices
    {
        private readonly IMongoCollection<EventDB> _eventsCollection;

        public EventServices(IDbClient dbClient)
        {
            _eventsCollection = dbClient.GetEventsCollection();
        }

        public async Task<List<EventDB>> GetAllEvents() =>
            //TODO: CHANGE TO ONLY MINTED
            await _eventsCollection.Find(result => true).ToListAsync();

        public async Task<List<EventDB>> GetAllMintedEvents() =>
            await _eventsCollection.Find(result => result.Status == "Minted").ToListAsync();

        public async Task<EventDB> GetEvent(string eventId) =>
            await _eventsCollection.Find(result => result.EventId == eventId).SingleOrDefaultAsync();

        public EventDB GetEventSync(string eventId) =>
            _eventsCollection.Find(result => result.EventId == eventId).SingleOrDefault();

        public async Task<List<EventDB>> GetOrganizerEvents(int ID) =>
            await _eventsCollection.Find(result => result.OrganizerId == ID).ToListAsync();

        public async Task<EventDB> GetOrganizerEvent(int ID, string eventID) =>
            await _eventsCollection.Find(result => result.OrganizerId == ID && result.EventId == eventID)
                .SingleOrDefaultAsync();

        public async Task<List<EventDB>> GetCriticalEvents() =>
            await _eventsCollection.Find(result => result.Status.Equals(EventStatus.Critical)).ToListAsync();


        public async Task CreateEvent(EventDB eventDB) =>
            await _eventsCollection.InsertOneAsync(eventDB);

        public async Task UpdateEvent(EventDB eventDB) =>
            await _eventsCollection.FindOneAndReplaceAsync(
                result => result.EventId == eventDB.EventId,
                eventDB);

        public UpdateResult setEventAsCritical(string eventId)
        {
            var updateDef = Builders<EventDB>.Update.Set(e => e.Status, EventStatus.Critical.ToString());

            return _eventsCollection.UpdateOne(e => e.EventId == eventId, updateDef);
        }

        public async Task DeleteEvent(string eventId) =>
            await _eventsCollection.DeleteOneAsync(result => result.EventId == eventId);

        public UpdateResult UpdateWithMetaDataInfo(int? organizerId, string eventId,
            List<ResponseMetadataInfo> responseMetadataInfos)
        {
            var updateDef = Builders<EventDB>.Update
                .Set(result => result.ResponseMetadata, responseMetadataInfos)
                .Set(result => result.Status, EventStatus.HalfMinted.ToString());

            return _eventsCollection.UpdateOne(result => result.OrganizerId == organizerId && result.EventId == eventId,
                updateDef);
        }

        public UpdateResult UpdateValidatorsKey(int? organizerId, string eventId,
            string key)
        {
            var updateDef = Builders<EventDB>.Update
                .Set(result => result.Validation!.Hash, key);

            return _eventsCollection.UpdateOne(result => result.OrganizerId == organizerId && result.EventId == eventId,
                updateDef);
        }

        public UpdateResult UpdateFinalizeMint(int? organizerId, string eventId, string txHash)
        {
            var today = DateTime.Now.ToString("dd/MM/yyyy HH:mm:ss", CultureInfo.InvariantCulture);
            var updateDef = Builders<EventDB>.Update
                .Unset("responseMetadata")
                .Set(result => result.TxHash, txHash)
                .Set(result => result.StatusDates.Minted,
                    today)
                .Set(result => result.Status, EventStatus.Minted.ToString());

            return _eventsCollection.UpdateOne(result => result.OrganizerId == organizerId && result.EventId == eventId,
                updateDef);
        }
    }
}