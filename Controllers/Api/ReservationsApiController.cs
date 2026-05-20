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

        [HttpPost]
        public async Task<IActionResult> Reserve([FromBody] ReservationApiRequest req)
        {
            var userId = _userManager.GetUserId(User);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

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

            var reservation = await _db.Reservations.FirstOrDefaultAsync(r =>
                r.ScreeningId == req.ScreeningId &&
                r.SeatId == req.SeatId &&
                r.AppUserId == userId);

            if (reservation == null)
                return NotFound(new[] { "Reservation not found." });

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
