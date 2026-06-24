using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using tickets.Data;
using tickets.Models;

namespace tickets.Controllers.Api
{
    [ApiController]
    [Route("api/reservations")]
    [Authorize]
    public class ReservationsApiController : ControllerBase
    {
        private readonly AppDb _db;
        private readonly UserManager<AppUser> _userManager;

        public ReservationsApiController(AppDb db, UserManager<AppUser> userManager)
        {
            _db = db;
            _userManager = userManager;
        }

        [HttpGet("mine")]
        public async Task<IActionResult> Mine()
        {
            var userId = _userManager.GetUserId(User);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var now = DateTime.Now;

            var reservations = await _db.Reservations
                .Where(r => r.AppUserId == userId)
                .Include(r => r.Screening).ThenInclude(s => s!.Cinema)
                .Include(r => r.Seat)
                .OrderBy(r => r.Screening!.StartTime)
                .ToListAsync();

            return Ok(reservations.Select(r => new
            {
                id = r.Id,
                screeningId = r.ScreeningId,
                filmTitle = r.Screening!.FilmTitle,
                startTime = r.Screening.StartTime,
                cinemaName = r.Screening.Cinema!.Name,
                seatId = r.SeatId,
                rowNumber = r.Seat!.RowNumber,
                seatNumber = r.Seat.SeatNumber,
                isPast = r.Screening.StartTime < now
            }));
        }

        [HttpPost]
        public async Task<IActionResult> Reserve([FromBody] ReservationApiRequest req)
        {
            var userId = _userManager.GetUserId(User);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            // Validate the screening exists and hasn't already started.
            var screening = await _db.Screenings.FirstOrDefaultAsync(s => s.Id == req.ScreeningId);
            if (screening == null) return NotFound(new[] { "Screening not found." });
            if (screening.StartTime < DateTime.Now)
                return BadRequest(new[] { "This screening has already started — you can no longer book it." });

            // Validate the seat actually belongs to this screening's cinema.
            var seatValid = await _db.Seats.AnyAsync(s => s.Id == req.SeatId && s.CinemaId == screening.CinemaId);
            if (!seatValid) return BadRequest(new[] { "Invalid seat for this screening." });

            _db.Reservations.Add(new Reservation
            {
                ScreeningId = req.ScreeningId,
                AppUserId = userId,
                SeatId = req.SeatId
            });

            try
            {
                await _db.SaveChangesAsync();
                return Ok(new { message = "Seat reserved successfully." });
            }
            catch (DbUpdateException)
            {
                return Conflict(new[] { "This seat was just taken by another user." });
            }
        }

        [HttpDelete]
        public async Task<IActionResult> Cancel([FromBody] ReservationApiRequest req)
        {
            var userId = _userManager.GetUserId(User);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var reservation = await _db.Reservations
                .Include(r => r.Screening)
                .FirstOrDefaultAsync(r =>
                    r.ScreeningId == req.ScreeningId &&
                    r.SeatId == req.SeatId &&
                    r.AppUserId == userId);

            if (reservation == null)
                return NotFound(new[] { "Reservation not found." });

            // Can't cancel within 2 hours of the screening start.
            if (reservation.Screening != null &&
                reservation.Screening.StartTime - DateTime.Now < TimeSpan.FromHours(2))
            {
                return BadRequest(new[] { "Bookings can't be cancelled within 2 hours of the screening." });
            }

            _db.Reservations.Remove(reservation);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Reservation cancelled." });
        }
    }

    public class ReservationApiRequest
    {
        public int ScreeningId { get; set; }
        public int SeatId { get; set; }
    }
}
