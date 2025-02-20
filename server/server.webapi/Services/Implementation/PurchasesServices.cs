using MongoDB.Bson;
using MongoDB.Driver;
using server.Models.BackOffice;
using server.Models.Organizer;
using server.MongoDB;
using server.Services.Interfaces;

namespace server.Services.Implementation
{
    public class PurchasesServices : IPurchaseServices
    {
        private readonly IMongoCollection<Purchase> _purchasesCollection;

        public PurchasesServices(IDbClient dbClient)
        {
            _purchasesCollection = dbClient.GetPurchaseCollection();
        }

        public async Task<List<Purchase>> GetAllPurchases() =>
            await _purchasesCollection.Find(result => true).ToListAsync();

        public async Task<List<Purchase>> GetEventPurchases(string eventId) =>
            await _purchasesCollection.Find(result => result.EventId == eventId).ToListAsync();

        public async Task<List<Purchase>> GetByWalletPurchase(string wallet) =>
            await _purchasesCollection.Find(result => result.Wallet == wallet).ToListAsync();

        public async Task<Purchase> GetOnePurchase(string wallet, string eventId) =>
            await _purchasesCollection.Find(result => result.Wallet == wallet && result.EventId == eventId)
                .SingleOrDefaultAsync();

        public async Task<List<Purchase>> GetAllPurchasesCombining(string eventId, string[] wallet)
        {
            var eventFilter = Builders<Purchase>.Filter.Eq("eventId", eventId);
            var walletFilter = Builders<Purchase>.Filter.In("wallet", wallet);
            var filter = Builders<Purchase>.Filter.And(eventFilter, walletFilter);
            return await _purchasesCollection.Find(filter).ToListAsync();
        }

        public async Task RegisterPurchase(Purchase purchase) =>
            await _purchasesCollection.InsertOneAsync(purchase);

        public async Task UpdatePurchase(Purchase purchase) =>
            await _purchasesCollection.FindOneAndReplaceAsync(
                result => result.EventId == purchase.EventId,
                purchase);

        public UpdateResult BurnTicket(Purchase purchase)
        {
            var updateDef =
                Builders<Purchase>.Update.Set(o => o.Tickets, purchase.Tickets);

            return _purchasesCollection.UpdateOne(
                result => result.Wallet == purchase.Wallet && result.EventId == purchase.EventId,
                updateDef);
        }

        public UpdateResult UseTicket(UseTicket ticketInformation)
        {
            var updateDef =
                Builders<Purchase>.Update.Set(o => o.Tickets[ticketInformation.IndexTicket].IsActive, false);

            return _purchasesCollection.UpdateOne(
                result => result.Wallet == ticketInformation.Wallet && result.EventId == ticketInformation.EventId,
                updateDef);
        }
    }
}