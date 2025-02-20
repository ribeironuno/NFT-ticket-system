using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using server.Models.Event.ValidationAttributes;
using server.Models.ValidationAttributes;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using server.Enumerations;

namespace server.Models.Event
{
    public class RefundBodyReq
    {
        [Required] [BsonElement("eventId")] public string? EventId { get; set; }

        [Required]
        [BsonElement("walletAddress")]
        public string? WalletAddress { get; set; }

        [Required] [BsonElement("eventName")] public string? EventName { get; set; }

        [Required] [BsonElement("title")] public string? Title { get; set; }

        [Required]
        [BsonElement("type")]
        [EnumDataType(typeof(RefundEnum), ErrorMessage = "The request type should be valid")]
        public string? Type { get; set; }

        [Required]
        [MinLength(30, ErrorMessage = "Description must have at least 30 characters")]
        [BsonElement("description")]
        public string? Description { get; set; }

        [MaxFileSize(15 * 1024 * 1024, errorMessage: "Max file size is 5 MB")]
        [AllowedFileExtensions(extensions: new string[] { ".zip" },
            errorMessage: "Proof files must be uploaded inside a zip folder '.zip'")]
        [BsonElement("proofFiles")]
        public IFormFile? ProofFiles { get; set; }
    }

    public class RefundDB
    {
        [BsonId]
        [JsonIgnore]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("refundId")] public int? RefundId { get; set; }

        [Required] [BsonElement("eventId")] public string? EventId { get; set; }

        [Required] [BsonElement("eventName")] public string? EventName { get; set; }

        [Required] [BsonElement("isRefunded")] public bool? IsRefunded { get; set; }

        [Required]
        [BsonElement("walletAddress")]
        public string? WalletAddress { get; set; }

        [Required] [BsonElement("txHash")] public string? TxHash { get; set; }

        [Required]
        [RegexValidation(regex: "datePattern", errorMessage: "Field 'dayMonthYear' has invalid format (dd/MM/YY)")]
        [BsonElement("date")]
        public string DateOfRegistration { get; set; }

        [Required] [BsonElement("title")] public string? Title { get; set; }

        [Required]
        [BsonElement("type")]
        [EnumDataType(typeof(RefundEnum), ErrorMessage = "The request type should be valid")]
        public string? Type { get; set; }

        [Required]
        [BsonElement("description")]
        public string? Description { get; set; }

        [BsonElement("proofFiles")] public string? ProofFiles { get; set; }

        public RefundDB(string EventId, string WalletAddress, string eventName, string type, string title, string Description,
            string ProofFiles)
        {
            DateTime today = DateTime.Now;

            this.EventId = EventId;
            this.EventName = eventName;
            this.WalletAddress = WalletAddress;
            this.Description = Description;
            this.Type = type;
            this.Title = title;
            this.IsRefunded = false;
            this.DateOfRegistration = today.Day.ToString("00") + "-" + today.Month.ToString("00") + "-" + today.Year;
            ;
            this.ProofFiles = ProofFiles;
        }

        public RefundDB(string EventId, string WalletAddress, string Description)
        {
            this.EventId = EventId;
            this.WalletAddress = WalletAddress;
            this.Description = Description;
        }
    }
}