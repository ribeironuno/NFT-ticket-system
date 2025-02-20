using MongoDB.Driver;
using server.Models.Event;

namespace server.Services.Interfaces
{
    public interface IRefundServices
    {
        public Task CreateRefund(RefundDB refund);

        public Task<List<RefundDB>> GetEventRefunds(string eventId);
        
        public Task<List<RefundDB>> GetByWallet(string wallet);


        public UpdateResult CloseRefunds(int[] refundIds, string txHash);
    }
}