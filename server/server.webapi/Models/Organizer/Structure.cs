using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace server.Models.Organizer
{
    public class Structure
    {
        [BsonId]
        [JsonIgnore]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [Required]
        [MinLength(3, ErrorMessage = "Your name should have at least 3 characters")]
        [BsonElement("name")]
        public string? Name { get; set; }

        [RegularExpression(@"^\d+$", ErrorMessage = "The id should be a integer")]
        [BsonElement("organizerId")]
        public int? OrganizerId { get; set; }

        [BsonElement("stats")] public StructureStats? Stats { get; set; }

        [Required]
        [BsonElement("nonSeatedSections")]
        public NonSeatedSections[] NonSeatedSections { get; set; }

        [Required]
        [BsonElement("seatedSections")]
        public SeatedSections[] SeatedSections { get; set; }
    }

    public class StructureStats
    {
        [RegularExpression(
            @"^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$",
            ErrorMessage = "Creation date must be on DD-MM-YYYY format")]
        [BsonElement("creationDate")]
        public string? CreationDate { get; set; }

        [Range(0, int.MaxValue, ErrorMessage = "Number of total events must be equals or greater than 0")]
        [BsonElement("totalEvents")]
        public int? TotalEvents { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Number of total sections must be equals or greater than 0")]
        [BsonElement("totalSections")]
        public int? TotalSections { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Number of total seats must be equals or greater than 0")]
        [BsonElement("totalSeats")]
        public int? TotalSeats { get; set; }
    }

    public class NonSeatedSections
    {
        [Required]
        [MinLength(1, ErrorMessage = "Non sections' names should have at least 1 character")]
        [BsonElement("name")]
        public string Name { get; set; }


        [Required]
        [MinLength(1, ErrorMessage = "The door's name should have at least 1 character")]
        [BsonElement("door")]
        public string Door { get; set; }

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Capacity of section must be higher than 0")]
        [BsonElement("capacity")]
        public int Capacity { get; set; }

        public NonSeatedSections(string name, string door, int capacity)
        {
            Name = name;
            Door = door;
            Capacity = capacity;
        }
    }

    public class SeatedSections
    {
        [Required]
        [MinLength(1, ErrorMessage = "Seated sections' names should have at least 1 character")]
        [BsonElement("name")]
        public string Name { get; set; }

        [Required]
        [MinLength(1, ErrorMessage = "The door's name should have at least 1 character")]
        [BsonElement("door")]
        public string Door { get; set; }

        [Required]
        [MinLength(1, ErrorMessage = "All seated sections must contain at least 1 sub section")]
        [BsonElement("subSections")]
        public SubSeatedSection[] SubSections { get; set; }

        public SeatedSections(string name, string door, SubSeatedSection[] subsections)
        {
            Name = name;
            Door = door;
            SubSections = subsections;
        }
    }

    public class SubSeatedSection
    {
        [Required]
        [MinLength(1, ErrorMessage = "The row's name should have at least 1 character")]
        [BsonElement("row")]
        public string Row { get; set; }

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Capacity of section must be higher than 0")]
        [BsonElement("capacity")]
        public int Capacity { get; set; }

        public SubSeatedSection(string row, int capacity)
        {
            Row = row;
            Capacity = capacity;
        }
    }

    public class EmailStructureBodyRequest
    {
        [Required]
        [MinLength(1, ErrorMessage = "Section name should have at least 1 character")]
        [BsonElement("structureName")]
        public string StructureName { get; set; }

        [Required]
        [RegularExpression(@"^\d+$", ErrorMessage = "The id should be a integer")]
        [BsonElement("organizerId")]
        public int OrganizerId { get; set; }
    }

    public class UpdateStructureBodyRequest
    {
        [Required]
        [MinLength(1, ErrorMessage = "Section name should have at least 1 character")]
        [BsonElement("oldStrutureName")]
        public string OldStructureName { get; set; }

        [Required]
        [RegularExpression(@"^\d+$", ErrorMessage = "The id should be a integer")]
        [BsonElement("organizerId")]
        public int OrganizerId { get; set; }

        [Required]
        [BsonElement("newStructure")]
        public Structure NewStructure { get; set; }
    }
}