using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using System.ComponentModel.DataAnnotations;

namespace server.Models.Event
{
    public class EventDecrypt
    {
        [Required]
        [BsonElement("encrypted")]
        public string? Encrypted { get; set; }
    }
}