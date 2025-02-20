using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using server.Models.BackOffice;
using server.Models.Event;
using server.MongoDB;
using server.Services.Interfaces;

namespace server.Services.Implementation
{
    public class RefundServices : IRefundServices
    {
        private readonly IMongoCollection<RefundDB> _refundCollection;

        public RefundServices(IDbClient dbClient)
        {
            _refundCollection = dbClient.GetRefundsCollection();
        }

        public Task<List<RefundDB>> GetByWallet(string wallet) =>
            _refundCollection.Find(result => result.WalletAddress == wallet).ToListAsync();

        public Task CreateRefund(RefundDB refund) =>
            _refundCollection.InsertOneAsync(refund);

        public UpdateResult CloseRefunds(int[] refundIds, string txHash)
        {
            var filter = Builders<RefundDB>.Filter.In("refundId", refundIds);
            var update = Builders<RefundDB>.Update.Set("isRefunded", true).Set("txHash", txHash);
            return _refundCollection.UpdateMany(filter, update);
        }

        public Task<List<RefundDB>> GetEventRefunds(string eventId) =>
            _refundCollection.Find(result => result.EventId == eventId).ToListAsync();
    }
}