using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using tickets.Data;

namespace tickets.Controllers.Api
{
    [ApiController]
    [Route("api/cinemas")]
    public class CinemasApiController : ControllerBase
    {
        private readonly AppDb _db;
        public CinemasApiController(AppDb db) { _db = db; }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var cinemas = await _db.Cinemas.ToListAsync();
            return Ok(cinemas.Select(c => new
            {
                id = c.Id,
                name = c.Name,
                rows = c.Rows,
                seatsPerRow = c.SeatsPerRow
            }));
        }
    }
}
