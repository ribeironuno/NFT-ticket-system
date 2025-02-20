using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using System.ComponentModel.DataAnnotations;
using server.Enumerations;
using server.Models.Event.ValidationAttributes;
using server.Models.ValidationAttributes;

namespace server.Models.Event
{
    public class Event
    {
        [Required]
        [MinLength(5, ErrorMessage = "Event name should have at least 5 characters")]
        [BsonElement("eventName")]
        public string? EventName { get; set; }

        [Required]
        [MinLength(3, ErrorMessage = "Event location should have at least 3 characters")]
        [BsonElement("location")]
        public string? Location { get; set; }

        [Required]
        [MinLength(3, ErrorMessage = "Event location should have at least 3 characters")]
        [BsonElement("country")]
        public string? Country { get; set; }

        [EnumDataType(typeof(AgeRestrictions), ErrorMessage = "The age restriction should be 'no_restrictions', 'plus_4', 'plus_8', 'plus_12', 'plus_14', 'plus_16' or 'plus_18'")]
        [BsonElement("ageRestriction")]
        public string? AgeRestriction { get; set; }

        [Required]
        [EnumDataType(typeof(Category), ErrorMessage = "The category should be 'Music', 'Sports', 'Comedy', 'Theatre', 'Cinema' or 'Others'")]
        [BsonElement("category")]
        public string Category { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Allowed age should be a value between 0 and 100")]
        [BsonElement("maxTicketsPerPerson")]
        public int? MaxTicketsPerPerson { get; set; }

        [Required]
        [MinLength(30, ErrorMessage = "Event description should have at least 30 characters")]
        [BsonElement("description")]
        public string? Description { get; set; }

        [Required]
        [BsonElement("datesInfo")]
        public DatesInfo? DatesInfo { get; set; }

        [Required]
        [RegexValidation(regex: "urlPattern", errorMessage: "Field 'webSite' is not a valid url")]
        [BsonElement("webSite")]
        public string? WebSite { get; set; }

        [Required]
        [RegexValidationForList(regex: "phoneNumberPattern", errorMessage: "Field 'contacts' is not valid")]
        [BsonElement("contacts")]
        public string[]? Contacts { get; set; }

        [Required]
        [RegexValidationForList(regex: "emailPattern", errorMessage: "Field 'emails' is not valid")]
        [BsonElement("emails")]
        public string[]? Emails { get; set; }

        [Required]
        [EnumDataType(typeof(NftDistribution), ErrorMessage = "The NFT type should be 'event_level', 'section_level'")]
        [BsonElement("nftDistribution")]
        public string? NftDistribution { get; set; }
    }

    public class DatesInfo
    {
        [Required]
        [EnumDataType(typeof(Duration), ErrorMessage = "The duration should be 'one_day' or 'multiple_days'")]
        [BsonElement("duration")]
        public string Duration { get; set; }

        [Required]
        [BsonElement("startDate")]
        public Date? StartDate { get; set; }

        [BsonElement("endDate")]
        public Date? EndDate { get; set; }
    }

    public class Date
    {
        [RegexValidation(regex: "datePattern", errorMessage: "Field 'dayMonthYear' has invalid format (dd/MM/YY)")]
        [BsonElement("dayMonthYear")]
        public string? DayMonthYear { get; set; }

        [RegexValidation(regex: "hourPattern", errorMessage: "Field 'startTime' has invalid format (hh:mm)")]
        [BsonElement("startTime")]
        public string? StartTime { get; set; }

        [RegexValidation(regex: "hourPattern", errorMessage: "Field 'startTime' has invalid format (hh:mm)")]
        [BsonElement("endTime")]
        public string? EndTime { get; set; }
    }
}
