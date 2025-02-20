using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using server.Models.Organizer;
using System.ComponentModel.DataAnnotations;

namespace server.Models.BackOffice
{
    public class AdminStatistics
    {
        public MonthProfit[] MonthProfit  { get; set; }

 
    }

    public class MonthProfit
    {
        public string Label { get; set; }

        public decimal[] Values { get; set; }
    }

    public class Profit
    {
        public decimal Year { get; set; }

        public decimal All { get; set; }
    }

    public class Organizers
    {
        public int Month { get; set; }

        public int Year { get; set; }

        public int All { get; set; }
    }
}
