using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using server.Enumerations;
using server.Models.Event;
using server.Models.Event.ValidationAttributes;
using server.Models.Event;
using server.Enumerations;
using System.Globalization;

namespace server.Models.BackOffice
{
    public class Purchase
    {
        [BsonId]
        [JsonIgnore]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [Required] [BsonElement("eventId")] public string EventId { get; set; }

        [Required] [BsonElement("banner")] public string Banner { get; set; }

        [Required] [BsonElement("datesInfo")] public DatesInfo? DatesInfo { get; set; }

        [Required]
        [MinLength(3, ErrorMessage = "Event location should have at least 3 characters")]
        [BsonElement("location")]
        public string? Location { get; set; }

        [Required]
        [RegexValidation(regex: "datePattern", errorMessage: "Field 'dayMonthYear' has invalid format (dd/MM/YY)")]
        [BsonElement("dateOfPurchase")]
        public string? DateOfPurchase { get; set; }

        [Required]
        [BsonRepresentation(BsonType.Decimal128, AllowTruncation = true)]
        [Range(0.000000000000000001, float.MaxValue, ErrorMessage = "Price cannot be < 0")]
        [BsonElement("totalPrice")]
        public Decimal TotalPrice { get; set; }

        [Required]
        [EnumDataType(typeof(Category),
            ErrorMessage = "The category should be 'Music', 'Sports', 'Comedy', 'Theatre', 'Cinema' or 'Other'")]
        [BsonElement("category")]
        public string Category { get; set; }

        [Required]
        [MinLength(5, ErrorMessage = "Event name should have at least 5 characters")]
        [BsonElement("eventName")]
        public string? EventName { get; set; }

        [Required]
        [MinLength(25, ErrorMessage = "Wallet should be valid")]
        [BsonElement("wallet")]
        public string? Wallet { get; set; }

        [Required] [BsonElement("tickets")] public Ticket[] Tickets { get; set; }
    }

    public class Ticket
    {
        public Ticket()
        {
            IsActive = true;
        }

        [Required]
        [RegexValidation(regex: "datePattern", errorMessage: "Field 'dayMonthYear' has invalid format (dd/MM/YY)")]
        [BsonElement("dateOfPurchase")]
        public string DateOfPurchase { get; set; }

        [Required]
        [MinLength(30, ErrorMessage = "Hash invalid")]
        [BsonElement("hash")]
        public string Hash { get; set; }

        [Required]
        [BsonElement("sectionName")] 
        public string SectionName { get; set; }

        [Required]
        [BsonRepresentation(BsonType.Decimal128, AllowTruncation = true)]
        [Range(0.000000000000000001, float.MaxValue, ErrorMessage = "Price cannot be < 0")]
        [BsonElement("price")]
        public Decimal Price { get; set; }

        [BsonElement("rowName")] public string? RowName { get; set; }

        [BsonElement("seat")] public int? Seat { get; set; }


        [BsonElement("type")]
        [EnumDataType(typeof(TicketType), ErrorMessage = "The ticket type must be valid")]
        public string Type { get; set; }

        [Required] [BsonElement("door")] public string Door { get; set; }

        [BsonElement("isActive")] public bool IsActive { get; set; }

        [Required]
        [MinLength(25, ErrorMessage = "Wallet should be valid")]
        [BsonElement("ticketNFT")]
        public string TicketNFT { get; set; }
    }
    
    public class UseTicket
    {
        [Required]
        public string EventId { get; set; }

        [Required]
        public string Wallet { get; set; }

        [Required]
        public string TicketId { get; set; }

        [Required]
        public int IndexTicket { get; set; }
    }
}
