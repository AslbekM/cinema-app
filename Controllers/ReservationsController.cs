using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using tickets.Data;
using tickets.Models;

namespace tickets.Controllers
{
    [Authorize]
    public class ReservationsController : Controller
    {
        private readonly AppDb _db;
        private readonly UserManager<AppUser> _userManager;

        public ReservationsController(AppDb db, UserManager<AppUser> userManager)
        {
            _db = db;
            _userManager = userManager;
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Reserve(int screeningId, int rowNumber, int seatNumber)
        {
            var userId = _userManager.GetUserId(User);

            if (string.IsNullOrEmpty(userId))
                return RedirectToAction("Login", "Account");

            var alreadyTaken = await _db.Reservations.AnyAsync(r =>
                r.ScreeningId == screeningId &&
                r.RowNumber == rowNumber &&
                r.SeatNumber == seatNumber);

            if (alreadyTaken)
            {
                TempData["SeatError"] = "This seat is already taken.";
                return RedirectToAction("Details", "Screenings", new { id = screeningId });
            }

            var reservation = new Reservation
            {
                ScreeningId = screeningId,
                AppUserId = userId,
                RowNumber = rowNumber,
                SeatNumber = seatNumber
            };

            _db.Reservations.Add(reservation);

            try
            {
                await _db.SaveChangesAsync();
                TempData["SeatSuccess"] = "Seat reserved successfully.";
            }
            catch (DbUpdateException)
            {
                TempData["SeatError"] = "This seat was just taken by another user.";
            }

            return RedirectToAction("Details", "Screenings", new { id = screeningId });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Cancel(int screeningId, int rowNumber, int seatNumber)
        {
            var userId = _userManager.GetUserId(User);

            if (string.IsNullOrEmpty(userId))
                return RedirectToAction("Login", "Account");

            var reservation = await _db.Reservations.FirstOrDefaultAsync(r =>
                r.ScreeningId == screeningId &&
                r.RowNumber == rowNumber &&
                r.SeatNumber == seatNumber &&
                r.AppUserId == userId);

            if (reservation == null)
            {
                TempData["SeatError"] = "Reservation not found.";
                return RedirectToAction("Details", "Screenings", new { id = screeningId });
            }

            _db.Reservations.Remove(reservation);
            await _db.SaveChangesAsync();

            TempData["SeatSuccess"] = "Reservation cancelled.";
            return RedirectToAction("Details", "Screenings", new { id = screeningId });
        }
    }
}