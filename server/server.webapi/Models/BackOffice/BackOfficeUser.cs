using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using server.Enumerations;

namespace server.Models.BackOffice
{
    public class BackOfficeUser
    {
        [BsonId]
        [JsonIgnore]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("userId")] public int? UserId { get; set; }

        [Required]
        [BsonElement("name"), MinLength(3, ErrorMessage = "Your name should have at least 3 characters")]
        public string Name { get; set; }

        [Required,
         RegularExpression(@"^([\w\.\-]+)@([\w\-]+)((\.(\w){2,3})+)$",
             ErrorMessage = "The email should correspond a valid email")]
        [DataType(DataType.EmailAddress)]
        [BsonElement("email")]
        public string Email { get; set; }

        [Required]
        [MinLength(8, ErrorMessage = "Your password have at least 8 characters")]
        [BsonElement("password")]
        public string Password { get; set; }

        [Required]
        [EnumDataType(typeof(BackOfficeUserType))]
        [BsonElement("type")]
        public string TypeAccount { get; set; }

        public BackOfficeUser(UpdateBackOfficeUser updateBackOfficeUser, string id)
        {
            Id = id;
            UserId = updateBackOfficeUser.UserId;
            Name = updateBackOfficeUser.Name;
            Email = updateBackOfficeUser.Email;
            Password = updateBackOfficeUser.Password;
            TypeAccount = updateBackOfficeUser.TypeAccount;
        }
        
        public BackOfficeUser(InsertBackOfficeUser updateBackOfficeUser)
        {
            Name = updateBackOfficeUser.Name;
            Email = updateBackOfficeUser.Email;
            Password = updateBackOfficeUser.Password;
            TypeAccount = updateBackOfficeUser.TypeAccount;
        }
    }

    public class UpdateBackOfficeUser
    {
        [Required] [BsonElement("userId")] public int UserId { get; set; }

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

        [MinLength(8, ErrorMessage = "Your password have at least 8 characters")]
        [BsonElement("password")]
        public string? Password { get; set; }

        [Required]
        [EnumDataType(typeof(BackOfficeUserType))]
        [BsonElement("type")]
        public string TypeAccount { get; set; }
    }
    
    public class InsertBackOfficeUser
    {
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

        [Required]
        [MinLength(8, ErrorMessage = "Your password have at least 8 characters")]
        [BsonElement("password")]
        public string Password { get; set; }

        [Required]
        [EnumDataType(typeof(BackOfficeUserType))]
        [BsonElement("type")]
        public string TypeAccount { get; set; }
    }
}