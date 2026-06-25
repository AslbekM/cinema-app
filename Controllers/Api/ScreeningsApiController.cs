using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using Microsoft.EntityFrameworkCore;
using tickets.Data;
using tickets.Models;
using tickets.Services;

namespace tickets.Controllers.Api
{
    [ApiController]
    [Route("api/screenings")]
    public class ScreeningsApiController : ControllerBase
    {
        private readonly AppDb _db;
        private readonly IAuditService _audit;
        private readonly IOutputCacheStore _cache;

        public ScreeningsApiController(AppDb db, IAuditService audit, IOutputCacheStore cache)
        {
            _db = db;
            _audit = audit;
            _cache = cache;
        }

        [HttpGet]
        [OutputCache(Duration = 30, Tags = new[] { "screenings" })]
        public async Task<IActionResult> GetAll()
        {
            // Only list screenings that haven't started yet — expired ones drop off
            // the schedule automatically (their reservation history is still kept).
            var now = DateTime.Now;

            var screenings = await _db.Screenings
                .Include(s => s.Cinema)
                .Where(s => s.StartTime >= now)
                .OrderBy(s => s.StartTime)
                .ToListAsync();

            return Ok(screenings.Select(s => new
            {
                id = s.Id,
                filmTitle = s.FilmTitle,
                startTime = s.StartTime,
                cinemaId = s.CinemaId,
                cinemaName = s.Cinema!.Name
            }));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var screening = await _db.Screenings
                .Include(s => s.Cinema)
                .ThenInclude(c => c!.Seats)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (screening == null) return NotFound();

            var reservations = await _db.Reservations
                .Where(r => r.ScreeningId == id)
                .ToListAsync();

            var userId = User.Identity?.IsAuthenticated == true
                ? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                : null;

            // Seats currently held by OTHER users (active holds) are unavailable too.
            var nowUtc = DateTime.UtcNow;
            var heldByOthers = await _db.SeatHolds
                .Where(h => h.ScreeningId == id && h.ExpiresAt > nowUtc && h.AppUserId != userId)
                .Select(h => h.SeatId).ToListAsync();

            var seats = screening.Cinema?.Seats
                .OrderBy(s => s.RowNumber).ThenBy(s => s.SeatNumber)
                .Select(s => new { id = s.Id, rowNumber = s.RowNumber, seatNumber = s.SeatNumber })
                .ToList();

            return Ok(new
            {
                id = screening.Id,
                filmTitle = screening.FilmTitle,
                startTime = screening.StartTime,
                cinemaId = screening.CinemaId,
                cinemaName = screening.Cinema!.Name,
                rows = screening.Cinema.Rows,
                seatsPerRow = screening.Cinema.SeatsPerRow,
                seats,
                reservedSeatIds = reservations.Select(r => r.SeatId).Concat(heldByOthers).Distinct().ToList(),
                mySeatIds = reservations.Where(r => r.AppUserId == userId).Select(r => r.SeatId).ToList(),
                isLoggedIn = User.Identity?.IsAuthenticated ?? false
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateScreeningApiRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.FilmTitle))
                return BadRequest(new[] { "Film title is required." });

            var cinema = await _db.Cinemas.FindAsync(req.CinemaId);
            if (cinema == null) return BadRequest(new[] { "Cinema not found." });

            var screening = new Screening
            {
                FilmTitle = req.FilmTitle.Trim(),
                StartTime = req.StartTime,
                CinemaId = req.CinemaId
            };

            _db.Screenings.Add(screening);
            await _db.SaveChangesAsync();
            await _audit.LogAsync("CreateScreening", $"{screening.FilmTitle} @ {screening.StartTime:g}");
            await _cache.EvictByTagAsync("screenings", default);

            return Ok(new
            {
                id = screening.Id,
                filmTitle = screening.FilmTitle,
                startTime = screening.StartTime,
                cinemaId = screening.CinemaId,
                cinemaName = cinema.Name
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateScreeningApiRequest req)
        {
            var screening = await _db.Screenings.FindAsync(id);
            if (screening == null) return NotFound(new[] { "Screening not found." });

            var cinema = await _db.Cinemas.FindAsync(req.CinemaId);
            if (cinema == null) return BadRequest(new[] { "Cinema not found." });

            if (string.IsNullOrWhiteSpace(req.FilmTitle))
                return BadRequest(new[] { "Film title is required." });

            screening.FilmTitle = req.FilmTitle.Trim();
            screening.StartTime = req.StartTime;
            screening.CinemaId = req.CinemaId;
            await _db.SaveChangesAsync();
            await _audit.LogAsync("UpdateScreening", $"Screening {id}: {screening.FilmTitle}");
            await _cache.EvictByTagAsync("screenings", default);

            return Ok(new
            {
                id = screening.Id,
                filmTitle = screening.FilmTitle,
                startTime = screening.StartTime,
                cinemaId = screening.CinemaId,
                cinemaName = cinema.Name
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var screening = await _db.Screenings.FindAsync(id);
            if (screening == null) return NotFound();

            _db.Screenings.Remove(screening);
            await _db.SaveChangesAsync();
            await _audit.LogAsync("DeleteScreening", $"Screening {id}: {screening.FilmTitle}");
            await _cache.EvictByTagAsync("screenings", default);

            return Ok(new { message = "Screening deleted." });
        }
    }

    public class CreateScreeningApiRequest
    {
        public string FilmTitle { get; set; } = string.Empty;
        public DateTime StartTime { get; set; }
        public int CinemaId { get; set; }
    }
}
