using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using tickets.Data;
using tickets.Models;
using tickets.Services;

namespace tickets.Controllers.Api
{
    [ApiController]
    [Route("api/notifications")]
    [Authorize]
    public class NotificationsApiController : ControllerBase
    {
        private readonly AppDb _db;
        private readonly UserManager<AppUser> _userManager;
        private readonly IEmailService _email;

        public NotificationsApiController(AppDb db, UserManager<AppUser> userManager, IEmailService email)
        {
            _db = db;
            _userManager = userManager;
            _email = email;
        }

        // Sends a booking-confirmation email for the user's seats on a screening.
        [HttpPost("booking-confirmation")]
        public async Task<IActionResult> BookingConfirmation([FromBody] ConfirmationRequest req)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user?.Email == null) return Unauthorized();

            var screening = await _db.Screenings
                .Include(s => s.Cinema)
                .FirstOrDefaultAsync(s => s.Id == req.ScreeningId);
            if (screening == null) return NotFound();

            var seats = await _db.Seats
                .Where(s => req.SeatIds.Contains(s.Id))
                .OrderBy(s => s.RowNumber).ThenBy(s => s.SeatNumber)
                .ToListAsync();

            var seatList = string.Join(", ", seats.Select(s => $"Row {s.RowNumber}, Seat {s.SeatNumber}"));
            var html = $@"
                <div style='font-family:Arial,sans-serif'>
                  <h2>🎬 Your adafcinema booking is confirmed</h2>
                  <p><strong>{screening.FilmTitle}</strong></p>
                  <p>🕑 {screening.StartTime:f}<br/>📍 {screening.Cinema!.Name}</p>
                  <p>🎟️ Seats: {seatList}</p>
                  <p>Show this email at the entrance. Enjoy the film!</p>
                </div>";

            await _email.SendAsync(user.Email, $"Booking confirmed — {screening.FilmTitle}", html);
            return Ok(new { message = "Confirmation sent." });
        }
    }

    public class ConfirmationRequest
    {
        public int ScreeningId { get; set; }
        public List<int> SeatIds { get; set; } = new();
    }
}
