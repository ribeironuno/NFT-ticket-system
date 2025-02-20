using System.ComponentModel.DataAnnotations;
using MongoDB.Bson.Serialization.Attributes;
using server.Enumerations;

namespace server.Models.Organizer
{
    public class Organizer
    {
        [Required]
        [EnumDataType(typeof(OrganizerType), ErrorMessage = "The organizer type should be Personal or Company")]
        public string Type { get; set; }

        [Required] public string[] WalletAddress { get; set; }

        [Required,
         MinLength(3, ErrorMessage = "Your name should have at least 3 characters")]
        public string Name { get; set; }

        [Required,
         RegularExpression(@"^([\w\.\-]+)@([\w\-]+)((\.(\w){2,3})+)$",
             ErrorMessage = "The email should correspond a valid email")]
        [DataType(DataType.EmailAddress)]
        public string Email { get; set; }

        [Required, MinLength(8, ErrorMessage = "Your password should have at least 8 characters")]
        [DataType(DataType.Password)]
        public string Password { get; set; }

        [RegularExpression(
            @"^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$",
            ErrorMessage = "The date of birth should be on DD-MM-YYYY format")]
        public string? DOB { get; set; }

        [EnumDataType(typeof(Gender), ErrorMessage = "The gender should be 'Male', 'Female' or 'Other'")]
        public string? Gender { get; set; }

        [Required]
        [DataType(DataType.PhoneNumber)]
        [Range(000000000, 999999999, ErrorMessage = "Phone number should be valid")]
        public string PhoneNumber { get; set; }

        [Required]
        [Range(000000000, 999999999, ErrorMessage = "NIF should be valid")]
        public string NIF { get; set; }

        [Required,
         MinLength(10, ErrorMessage = "Your address should have at least 10 characters")]
        public string Address { get; set; }

        [Required]
        [EnumDataType(typeof(Country), ErrorMessage = "Country should be Portugal, Spain or France")]
        public string Country { get; set; }

        [Required] public IFormFile AddressProof { get; set; }

        [Required] public IFormFile NIFProof { get; set; }
    }
    
    public class OrganizerStatusUpdate
    {
        [Required,
         RegularExpression(@"^\d+$",
             ErrorMessage = "The id should be a integer")]
        public int Id { get; set; }

        [Required]
        [EnumDataType(typeof(StatusAccount),
            ErrorMessage = "Status account should be NotValid, WaitingValidation, Active or Banned")]
        [BsonElement("statusAccount")]
        public string Status { get; set; }
    }
    
    public class OrganizerUpdate
    {
        [Required] public string[] WalletAddress { get; set; }

        [Required,
         MinLength(3, ErrorMessage = "Your name should have at least 3 characters")]
        public string Name { get; set; }

        [Required,
         RegularExpression(@"^([\w\.\-]+)@([\w\-]+)((\.(\w){2,3})+)$",
             ErrorMessage = "The email should correspond a valid email")]
        [DataType(DataType.EmailAddress)]
        public string Email { get; set; }

        [MinLength(8, ErrorMessage = "Your password should have at least 8 characters")]
        [DataType(DataType.Password)]
        public string? Password { get; set; }

        [RegularExpression(
            @"^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$",
            ErrorMessage = "The date of birth should be on DD-MM-YYYY format")]
        public string? DOB { get; set; }

        [EnumDataType(typeof(Gender), ErrorMessage = "The gender should be 'Male', 'Female' or 'Other'")]
        public string? Gender { get; set; }

        [Required]
        [DataType(DataType.PhoneNumber)]
        [Range(000000000, 999999999, ErrorMessage = "Phone number should be valid")]
        public string PhoneNumber { get; set; }

        [Required,
         MinLength(10, ErrorMessage = "Your address should have at least 10 characters")]
        public string Address { get; set; }

        [Required]
        [EnumDataType(typeof(Country), ErrorMessage = "Country should be Portugal, Spain or France")]
        public string Country { get; set; }

        public IFormFile? AddressProof { get; set; }

        public IFormFile? NIFProof { get; set; }
    }
}