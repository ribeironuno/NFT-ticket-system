using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using System.Text.Json.Serialization;
using System.ComponentModel.DataAnnotations;
using System.Globalization;
using server.Enumerations;
using server.Models.Event.ValidationAttributes;
using server.Models.Organizer;
using DateTime = System.DateTime;

namespace server.Models.Event
{
    public class EventDB : Event
    {
        [BsonId]
        [JsonIgnore]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [Required] [BsonElement("eventId")] public string? EventId { get; set; }

        [Required]
        [BsonElement("organizerId")]
        public int? OrganizerId { get; set; }

        [Required] [BsonElement("banner")] public string Banner { get; set; }

        [Required] [BsonElement("floorPlan")] public string FloorPlan { get; set; }

        [BsonElement("eventNFT")] public string? EventNFT { get; set; }

        [Required] [BsonElement("validation")] public ValidationDB? Validation { get; set; }

        [Required]
        [BsonElement("totalAvailableTickets")]
        public int TotalAvailableTickets { get; set; }

        [Required]
        [BsonElement("totalNumTickets")]
        public int TotalNumTickets { get; set; }

        [Required]
        [BsonElement("totalProfit")]
        [BsonRepresentation(BsonType.Decimal128, AllowTruncation = true)]
        public Decimal TotalProfit { get; set; }

        [Required] [BsonElement("structure")] public EventStructureDB? Structure { get; set; }

        [Required]
        [BsonElement("status")]
        [EnumDataType(typeof(EventStatus), ErrorMessage = "The event status should be valid")]
        public string Status { get; set; }

        [Required]
        [BsonElement("statusDates")]
        public StatusDatesInformation StatusDates { get; set; }

        [BsonElement("responseMetadata")] public List<ResponseMetadataInfo> ResponseMetadata { get; set; }

        [BsonElement("txHash")] public string? TxHash { get; set; }

        public EventDB(EventBodyReq eventBodyReq, string eventId, int organizerId,
            string banner, string floorPlan, string? eventNFT, int totalNumTickets, EventStructureDB structure, ValidationBodyBD validation)
        {
            EventId = eventId;
            EventName = eventBodyReq.EventName;
            OrganizerId = organizerId;
            Location = eventBodyReq.Location;
            Country = eventBodyReq.Country;
            if (eventBodyReq.AgeRestriction == "no_restriction")
            {
                AgeRestriction = null;
            }
            else
            {
                AgeRestriction = eventBodyReq.AgeRestriction;
            }
            Category = eventBodyReq.Category;
            MaxTicketsPerPerson = eventBodyReq.MaxTicketsPerPerson;
            Description = eventBodyReq.Description;
            DatesInfo = eventBodyReq.DatesInfo;
            Banner = banner;
            FloorPlan = floorPlan;
            EventNFT = eventNFT;
            WebSite = eventBodyReq.WebSite;
            Contacts = eventBodyReq.Contacts;
            Emails = eventBodyReq.Emails;
            Validation = new ValidationDB();
            Validation.ValidationType = validation.ValidationType;
            Validation.Validators = validation.Validators;
            NftDistribution = eventBodyReq.NftDistribution;
            Structure = structure;
            Status = EventStatus.NotMinted.ToString();
            StatusDates = new StatusDatesInformation();
            TotalProfit = 0;
            TotalNumTickets = totalNumTickets;
            TotalAvailableTickets = totalNumTickets;
            ResponseMetadata = null;
        }
    }

    public class StatusDatesInformation
    {
        [Required] [BsonElement("created")] public string Created { get; set; }

        [Required] [BsonElement("minted")] public string Minted { get; set; }

        [Required] [BsonElement("canceled")] public string Canceled { get; set; }

        public StatusDatesInformation()
        {
           //DateTime today = DateTime.Now;
            Created = DateTime.Now.ToString("dd/MM/yyyy HH:mm:ss", CultureInfo.InvariantCulture);
        }
    }

    public class ValidationDB : ValidationBodyBD
    {
        [BsonElement("hash")] public string? Hash { get; set; }
    }

    public class EventStructureDB
    {
        [Required]
        [MinLength(3, ErrorMessage = "Your name should have at least 3 characters")]
        [BsonElement("name")]
        public string? Name { get; set; }

        [Required]
        [BsonElement("nonSeatedSections")]
        public EventNonSeatedSections[]? NonSeatedSections { get; set; }

        [Required]
        [BsonElement("seatedSections")]
        public EventSeatedSections[]? SeatedSections { get; set; }
    }

    public class EventNonSeatedSections
    {
        [BsonElement("sectionId")] public string SectionId { get; set; }

        [Required]
        [MinLength(1, ErrorMessage = "Non sections' names should have at least 1 character")]
        [BsonElement("name")]
        public string Name { get; set; }

        [Required]
        [MinLength(1, ErrorMessage = "The door's name should have at least 1 character")]
        [BsonElement("door")]
        public string Door { get; set; }

        [Required]
        [BsonRepresentation(BsonType.Decimal128, AllowTruncation = true)]
        [Range(0.000000000000000001, float.MaxValue, ErrorMessage = "Price cannot be < 0")]
        [BsonElement("price")]
        public Decimal Price { get; set; }

        [BsonElement("availableTickets")] public int AvailableTickets { get; set; }

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Number of tickets cannot be < 1")]
        [BsonElement("numTickets")]
        public int NumTickets { get; set; }

        [BsonElement("sectionNFT")] public string? SectionNFT { get; set; }

        public EventNonSeatedSections(string name, string door, int capacity)
        {
            Name = name;
            Door = door;
            NumTickets = capacity;
            AvailableTickets = capacity;
        }

        public override bool Equals(Object obj)
        {
            if ((obj == null) || !this.GetType().Equals(obj.GetType()))
            {
                return false;
            }
            else
            {
                NonSeatedSections toCompare = (NonSeatedSections)obj;
                return (toCompare.Name == Name)
                       && (toCompare.Door == Door);
            }
        }
    }


    public class EventSeatedSections
    {
        [BsonElement("sectionId")] public string SectionId { get; set; }

        [Required]
        [MinLength(1, ErrorMessage = "Seated sections' names should have at least 1 character")]
        [BsonElement("name")]
        public string? Name { get; set; }

        [Required]
        [MinLength(1, ErrorMessage = "The door's name should have at least 1 character")]
        [BsonElement("door")]
        public string? Door { get; set; }

        [BsonElement("totalAvailableTickets")] public int TotalAvailableTickets { get; set; }

        [BsonElement("totalNumTickets")] public int TotalNumTickets { get; set; }

        [Required]
        [MinLength(1, ErrorMessage = "All seated sections must contain at least 1 sub section")]
        [BsonElement("subSections")]
        public EventSubSeatedSection[]? SubSections { get; set; }

        [BsonElement("sectionNFT")] public string? SectionNFT { get; set; }

        public EventSeatedSections(string? name, string? door, EventSubSeatedSection[]? subSections, string? sectionNft)
        {
            Name = name;
            Door = door;
            SubSections = subSections;
            SectionNFT = sectionNft;
        }
    }

    public class EventSubSeatedSection
    {
        [BsonElement("rowId")] public string RowId { get; set; }

        [Required]
        [MinLength(1, ErrorMessage = "The row's name should have at least 1 character")]
        [BsonElement("row")]
        public string? Row { get; set; }

        [BsonElement("availableTickets")] public int[]? AvailableTickets { get; set; }

        [Required]
        [BsonRepresentation(BsonType.Decimal128, AllowTruncation = true)]
        [Range(1, float.MaxValue, ErrorMessage = "Price cannot be < 0")]
        [BsonElement("price")]
        public Decimal Price { get; set; }

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Capacity cannot be < 1")]
        [BsonElement("numTickets")]
        public int NumTickets { get; set; }

        public EventSubSeatedSection(string row, Decimal price, int capacity)
        {
            Row = row;
            Price = price;
            NumTickets = capacity;
        }

        public override bool Equals(Object obj)
        {
            if ((obj == null) || !this.GetType().Equals(obj.GetType()))
            {
                return false;
            }
            else
            {
                SubSeatedSection toCompare = (SubSeatedSection)obj;
                return (toCompare.Row == Row);
            }
        }
    }
}