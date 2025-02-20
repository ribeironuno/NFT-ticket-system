using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace server.Models.Event;

public class EventMetadataNonSeatedTickets
{
    public EventMetadataNonSeatedTickets(string eventName, string image, string externalUrl, string sectionName,
        int ticketNumber)
    {
        event_name = eventName;
        this.image = image;
        external_url = externalUrl;
        section_name = sectionName;
        section_type = "Non Seated";
        ticket_number = ticketNumber;
    }

    public string event_name { get; set; }
    public string image { get; set; }
    public string external_url { get; set; }
    public string section_name { get; set; }
    public string section_type { get; set; }
    public int ticket_number { get; set; }
}

public class EventMetadataSeatedTickets
{
    public EventMetadataSeatedTickets(string eventName, string image, string externalUrl, string sectionName,
        string row, int ticketNumber)
    {
        event_name = eventName;
        this.image = image;
        external_url = externalUrl;
        section_name = sectionName;
        section_type = "Seated";
        this.row = row;
        seat = ticketNumber;
    }

    public string event_name { get; set; }
    public string image { get; set; }
    public string external_url { get; set; }
    public string section_name { get; set; }
    public string section_type { get; set; }
    public string row { get; set; }
    public int seat { get; set; }
}

public class ResponseMetadataInfo
{
    public ResponseMetadataInfo(string ipfs, int numberOfTickets, string sectionOrRowId, string type, Decimal price)
    {
        Ipfs = "ipfs://" + ipfs;
        NumberOfTickets = numberOfTickets;
        SectionOrRowId = sectionOrRowId;
        Type = type;
        Price = price;
    }

    [BsonElement("ipfs")] public string Ipfs { get; set; }

    [BsonElement("numberOfTickets")] public int NumberOfTickets { get; set; }

    [BsonElement("sectionOrRowId")] public string SectionOrRowId { get; set; }

    [BsonElement("type")] public string Type { get; set; }

    [BsonRepresentation(BsonType.Decimal128, AllowTruncation = true)]
    [BsonElement("price")]
    public Decimal Price { get; set; }
}