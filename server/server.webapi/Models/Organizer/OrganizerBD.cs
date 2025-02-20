using System.ComponentModel.DataAnnotations;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Newtonsoft.Json;
using server.Enumerations;

namespace server.Models.Organizer;

public class OrganizerBD
{
    [BsonId]
    [JsonIgnore]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [JsonIgnore]
    [BsonElement("organizerId")]
    public int? OrganizerId { get; set; }

    [Required]
    [EnumDataType(typeof(OrganizerType), ErrorMessage = "The organizer type should be Personal or Company")]
    [BsonElement("type")]
    public string Type { get; set; }

    [Required]
    [BsonElement("walletAddress")]
    public string[] WalletAddress { get; set; }

    [Required,
     MinLength(3, ErrorMessage = "Your name should have at least 3 characters")]
    [BsonElement("name")]
    public string Name { get; set; }

    [Required,
     RegularExpression(@"^([\w\.\-]+)@([\w\-]+)((\.(\w){2,3})+)$",
         ErrorMessage = "The email should correspond a valid email")]
    [DataType(DataType.EmailAddress)]
    [BsonElement("email")]
    public string Email { get; set; }

    [BsonElement("password")] public string HashedPassword { get; set; }

    [RegularExpression(
        @"^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$",
        ErrorMessage = "The date of birth should be on DD-MM-YYYY format")]
    [BsonElement("dob")]
    public string? DOB { get; set; }

    [EnumDataType(typeof(Gender), ErrorMessage = "The gender should be 'Male', 'Female' or 'Other'")]
    [BsonElement("gender")]
    public string? Gender { get; set; }

    [Required]
    [DataType(DataType.PhoneNumber)]
    [Range(000000000, 999999999, ErrorMessage = "Phone number should be valid")]
    [BsonElement("phoneNumber")]
    public string PhoneNumber { get; set; }

    [Required]
    [Range(000000000, 999999999, ErrorMessage = "NIF should be valid")]
    [BsonElement("nif")]
    public string NIF { get; set; }

    [Required,
     MinLength(10, ErrorMessage = "Your address should have at least 10 characters")]
    [BsonElement("address")]
    public string Address { get; set; }

    [Required]
    [EnumDataType(typeof(Country), ErrorMessage = "Country should be Portugal or Spain")]
    [BsonElement("country")]
    public string Country { get; set; }

    [JsonIgnore]
    [BsonElement("addressProofUrl")]
    public string AddressProofUrl { get; set; }

    [JsonIgnore]
    [BsonElement("nifProofUrl")]
    public string NIFProofUrl { get; set; }

    [EnumDataType(typeof(StatusAccount),
        ErrorMessage = "Status account should be NotValid, WaitingValidation, Active or Banned")]
    [BsonElement("statusAccount")]
    public string StatusAccount { get; set; }

    [JsonIgnore]
    [DataType(DataType.Date)]
    [BsonElement("activationDate")]
    public string ActivationDate { get; set; }

    public OrganizerBD(Organizer organizer, string hashedPassword, string addressProofUrl, string nifProofUrl,
            string statusAccount, string activationDate)
        {
            Type = organizer.Type;
            WalletAddress = organizer.WalletAddress;
            Name = organizer.Name;
            Email = organizer.Email;
            HashedPassword = hashedPassword;
            DOB = organizer.DOB;
            Gender = organizer.Gender;
            PhoneNumber = organizer.PhoneNumber;
            NIF = organizer.NIF;
            Address = organizer.Address;
            Country = organizer.Country;
            AddressProofUrl = addressProofUrl;
            NIFProofUrl = nifProofUrl;
            StatusAccount = statusAccount;
            ActivationDate = activationDate;
        }
    }