using server.Models.Event;
using server.Models.Organizer;

namespace server.Services.Interfaces;

public interface IStructureServices
{
    public Task<List<Structure>> GetStructures(int organizerId);

    public Task<Structure?> GetStructure(int organizerId, string structureName);

    public Task CreateStructure(Structure structure);

    public Task UpdateStructure(Structure structure, int organizerId, string structureName);

    public Task DeleteStructure(int organizerId, string structureName);
}