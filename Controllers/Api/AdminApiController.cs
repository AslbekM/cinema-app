using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using tickets.Data;
using tickets.Models;

namespace tickets.Controllers.Api
{
    [ApiController]
    [Route("api/admin")]
    [Authorize(Roles = "Admin")]
    public class AdminApiController : ControllerBase
    {
        private const decimal PricePerSeat = 25m;
        private readonly AppDb _db;
        private readonly UserManager<AppUser> _userManager;

        public AdminApiController(AppDb db, UserManager<AppUser> userManager)
        {
            _db = db;
            _userManager = userManager;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> Stats()
        {
            var now = DateTime.Now;

            var totalUsers = await _userManager.Users.CountAsync();
            var totalScreenings = await _db.Screenings.CountAsync();
            var upcomingScreenings = await _db.Screenings.CountAsync(s => s.StartTime >= now);
            var totalBookings = await _db.Reservations.CountAsync();
            var revenue = totalBookings * PricePerSeat;

            var topFilms = await _db.Reservations
                .Include(r => r.Screening)
                .GroupBy(r => r.Screening!.FilmTitle)
                .Select(g => new { film = g.Key, bookings = g.Count() })
                .OrderByDescending(x => x.bookings)
                .Take(6)
                .ToListAsync();

            // Seat occupancy across all screenings (booked seats / total seats offered).
            var totalSeatsOffered = await _db.Screenings
                .Include(s => s.Cinema)
                .SumAsync(s => s.Cinema!.Rows * s.Cinema.SeatsPerRow);
            var occupancy = totalSeatsOffered > 0
                ? Math.Round((double)totalBookings / totalSeatsOffered * 100, 1)
                : 0;

            return Ok(new
            {
                totalUsers,
                totalScreenings,
                upcomingScreenings,
                totalBookings,
                revenue,
                occupancy,
                topFilms
            });
        }

        // Lists every reservation for a screening (who booked which seat).
        [HttpGet("screenings/{id}/reservations")]
        public async Task<IActionResult> ScreeningReservations(int id)
        {
            var reservations = await _db.Reservations
                .Where(r => r.ScreeningId == id)
                .Include(r => r.AppUser)
                .Include(r => r.Seat)
                .OrderBy(r => r.Seat!.RowNumber).ThenBy(r => r.Seat!.SeatNumber)
                .ToListAsync();

            return Ok(reservations.Select(r => new
            {
                rowNumber = r.Seat!.RowNumber,
                seatNumber = r.Seat.SeatNumber,
                userNickname = r.AppUser!.UserName,
                userEmail = r.AppUser.Email
            }));
        }

        // Recent audit trail (who did what).
        [HttpGet("audit")]
        public async Task<IActionResult> Audit()
        {
            var logs = await _db.AuditLogs
                .OrderByDescending(a => a.Timestamp)
                .Take(150)
                .ToListAsync();

            return Ok(logs.Select(a => new
            {
                timestamp = a.Timestamp,
                userName = a.UserName,
                action = a.Action,
                details = a.Details
            }));
        }
    }
}
