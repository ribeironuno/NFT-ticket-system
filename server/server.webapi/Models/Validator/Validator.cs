using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace server.Models.Validator;

public class Validator
{
    [Required,
     MinLength(3, ErrorMessage = "Your name should have at least 3 characters")]
    [BsonElement("name")]
    public string Name { get; set; }

    [Required,
     RegularExpression(@"^([\w\.\-]+)@([\w\-]+)((\.(\w){2,3})+)$",
         ErrorMessage = "The email should correspond a valid email")]
    [DataType(DataType.EmailAddress)]
    public string Email { get; set; }

    [Required, MinLength(3, ErrorMessage = "Your name should have at least 8 characters")]
    [DataType(DataType.Password)]
    public string Password { get; set; }
}