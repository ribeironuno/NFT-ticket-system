using MongoDB.Driver;
using server.Models.Event;
using server.Models.Validator;

namespace server.Services.Interfaces
{
    public interface IEventServices
    {
        public Task<List<EventDB>> GetAllEvents();

        public Task<List<EventDB>> GetAllMintedEvents();

        public Task<EventDB> GetEvent(string eventId);

        public EventDB GetEventSync(string eventId);

        public Task<List<EventDB>> GetOrganizerEvents(int organizerID);

        public Task<EventDB> GetOrganizerEvent(int organizerID, string eventID);

        public Task<List<EventDB>> GetCriticalEvents();

        public Task CreateEvent(EventDB eventDB);

        public Task UpdateEvent(EventDB eventDB);

        public UpdateResult setEventAsCritical(string eventId);

        public Task DeleteEvent(string eventId);

        public UpdateResult UpdateWithMetaDataInfo(int? organizerId, string eventID,
            List<ResponseMetadataInfo> responseMetadataInfos);

        public UpdateResult UpdateValidatorsKey(int? organizerId, string eventId,
            string key);
        
        public UpdateResult UpdateFinalizeMint(int? organizerId, string eventId, string  txHash);
    }
}