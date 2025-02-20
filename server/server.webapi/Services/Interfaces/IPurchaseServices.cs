using MongoDB.Driver;
using server.Models.BackOffice;

namespace server.Services.Interfaces
{
    public interface IPurchaseServices
    {
        public Task<List<Purchase>> GetAllPurchases();

        public Task<List<Purchase>> GetEventPurchases(string eventId);

        public Task<Purchase> GetOnePurchase(string wallet, string eventId);

        public Task<List<Purchase>> GetByWalletPurchase(string wallet);

        public Task<List<Purchase>> GetAllPurchasesCombining(string eventId, string[] wallet);

        public Task RegisterPurchase(Purchase purchase);

        public Task UpdatePurchase(Purchase purchase);

        public UpdateResult BurnTicket(Purchase purchase);


        public UpdateResult UseTicket(UseTicket ticketInformation);
    }
}
