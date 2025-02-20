using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using System.Text.Json.Serialization;
using System.ComponentModel.DataAnnotations;

namespace server.Models.Organizer
{
    public class ValidatorsGroup
    {
        [BsonId]
        [JsonIgnore]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("organizerId")]
        public int? OrganizerId { get; set; }

        [Required]
        [MinLength(3, ErrorMessage = "The name should have at least 3 characters")]
        [BsonElement("validatorsGroupName")]
        public string? ValidatorsGroupName { get; set; }

        [BsonElement("validators")]
        public ValidatorFromGroup[] validators { get; set; }

        [BsonElement("groupId")]
        public int groupId { get; set; }
    }
            
    public class ValidatorFromGroup
    {
        [MinLength(1, ErrorMessage = "Validators' names should have at least 1 character")]
        [BsonElement("name")]
        public string Name { get; set; }

        [RegularExpression(@"^([\w\.\-]+)@([\w\-]+)((\.(\w){2,3})+)$",
            ErrorMessage = "The email should correspond a valid email")]
        [DataType(DataType.EmailAddress)]
        [BsonElement("email")]
        public string Email { get; set; } 
    }

    public class UpdateValidatorsGroupBodyRequest
    {
        [Required]
        [BsonElement("newValidatorsGroup")]
        public ValidatorsGroup NewValidatorsGroup { get; set; }

        [BsonElement("groupId")]
        public int groupId { get; set; }
    }
}