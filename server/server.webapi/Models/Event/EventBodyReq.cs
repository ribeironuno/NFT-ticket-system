using MongoDB.Bson.Serialization.Attributes;
using server.Enumerations;
using server.Models.Event.ValidationAttributes;
using server.Models.ValidationAttributes;
using System.ComponentModel.DataAnnotations;
using MongoDB.Bson;
using Newtonsoft.Json;
using server.Models.Organizer;

namespace server.Models.Event
{
    public class EventBodyReq : Event
    {
        [Required]
        [ImageResolution(700, 600, 1200, 1000,
            errorMessage: "File heigth boundaries are 600px-700px and File width boundaries are 1000px-1200px")]
        [MaxFileSize(5 * 1024 * 1024, errorMessage: "Max file size is 5 MB")]
        [AllowedFileExtensions(extensions: new string[] { ".jpg", ".png" },
            errorMessage: "Banner file extension should be '.jpg' or '.png'")]
        [BsonElement("banner")]
        public IFormFile? Banner { get; set; }

        [Required]
        [ImageResolution(600, 400, 600, 400,
            errorMessage: "File heigth boundaries are 400px-600px and File width boundaries are 400px-600px")]
        [MaxFileSize(5 * 1024 * 1024, errorMessage: "Max file size is 5 MB")]
        [AllowedFileExtensions(extensions: new string[] { ".jpg", ".png" },
            errorMessage: "Floor plan file extension should be '.jpg' or '.png'")]
        [BsonElement("floorPlan")]
        public IFormFile? FloorPlan { get; set; }

        [BsonElement("eventNFT")]
        [ImageResolution(600, 400, 600, 400,
            errorMessage: "File heigth boundaries are 400px-600px and File width boundaries are 400px-600px")]
        [MaxFileSize(5 * 1024 * 1024, errorMessage: "Max file size is 5 MB")]
        [AllowedFileExtensions(extensions: new string[] { ".jpg", ".png" },
            errorMessage: "Event NFT file extension should be '.jpg' or '.png'")]
        public IFormFile? EventNFT { get; set; }

        [Required] [BsonElement("validation")] public ValidationBodyReq? Validation { get; set; }

        [Required] [BsonElement("structure")] public EventStructureBodyReq? Structure { get; set; }
    }

    public class ValidatorsGroupInformation
    {
        [Required]
        [BsonElement("groupId")]
        public int GroupId { get; set; }

        [Required]
        [BsonElement("validatorsGroupName")]
        public string ValidatorsGroupName { get; set; }
    }

    public class ValidationBodyReq
    {
        [Required]
        [EnumDataType(typeof(ValidationType), ErrorMessage = "The type should be 'validators', 'hash' or 'both'")]
        [BsonElement("type")]
        public string? ValidationType { get; set; }

        [BsonElement("validators")] public string? Validators { get; set; }
    }
    
    public class ValidationBodyBD
    {
        [Required]
        [EnumDataType(typeof(ValidationType), ErrorMessage = "The type should be 'validators', 'hash' or 'both'")]
        [BsonElement("type")]
        public string? ValidationType { get; set; }

        [BsonElement("validators")] public ValidatorsGroupInformation[]? Validators { get; set; }
    }

    public class EventStructureBodyReq
    {
        [Required]
        [MinLength(3, ErrorMessage = "Your name should have at least 3 characters")]
        [BsonElement("name")]
        public string? Name { get; set; }

        [BsonElement("nonSeatedSections")] public string[]? NonSeatedSections { get; set; }

        [BsonElement("seatedSections")] public string[]? SeatedSections { get; set; }
    }
}