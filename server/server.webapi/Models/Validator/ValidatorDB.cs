using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace server.Models.Validator;

public class ValidatorDB
{
    [BsonId]
    [JsonIgnore]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }
    
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

    [Required] [BsonElement("password")] 
    public string HashedPassword { get; set; }

    [Required] [BsonElement("events")] 
    public string[] EventsAssociated { get; set; }

    public ValidatorDB(string name, string email, string password)
    {
        Name = name;
        Email = email;
        HashedPassword = password;
        EventsAssociated = new string[]{ };
    }
}