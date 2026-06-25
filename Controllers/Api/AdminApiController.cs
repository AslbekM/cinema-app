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
    [Route("api/admin")]
    [Authorize(Roles = "Admin")]
    public class AdminApiController : ControllerBase
    {
        private const decimal PricePerSeat = 25m;
        private readonly AppDb _db;
        private readonly UserManager<AppUser> _userManager;
        private readonly IAuditService _audit;

        public AdminApiController(AppDb db, UserManager<AppUser> userManager, IAuditService audit)
        {
            _db = db;
            _userManager = userManager;
            _audit = audit;
        }

        // A user's basket (their reservations) for admin management.
        [HttpGet("users/{id}/reservations")]
        public async Task<IActionResult> UserReservations(string id)
        {
            var reservations = await _db.Reservations
                .Where(r => r.AppUserId == id)
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
                rowNumber = r.Seat!.RowNumber,
                seatNumber = r.Seat.SeatNumber,
                isPast = r.Screening.StartTime < DateTime.Now
            }));
        }

        // Admin removes a single reservation from any user's basket.
        [HttpDelete("reservations/{reservationId:int}")]
        public async Task<IActionResult> DeleteReservation(int reservationId)
        {
            var reservation = await _db.Reservations
                .Include(r => r.Seat)
                .FirstOrDefaultAsync(r => r.Id == reservationId);
            if (reservation == null) return NotFound(new[] { "Reservation not found." });

            _db.Reservations.Remove(reservation);
            await _db.SaveChangesAsync();
            await _audit.LogAsync("AdminDeleteReservation",
                $"Reservation {reservationId} (screening {reservation.ScreeningId}, seat {reservation.SeatId})");

            return Ok(new { message = "Reservation removed." });
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
