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
        public async Task<IActionResult> Reserve(int screeningId, int seatId)
        {
            var userId = _userManager.GetUserId(User);

            if (string.IsNullOrEmpty(userId))
                return RedirectToAction("Login", "Account");

            _db.Reservations.Add(new Reservation
            {
                ScreeningId = screeningId,
                AppUserId = userId,
                SeatId = seatId
            });

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
        public async Task<IActionResult> Cancel(int screeningId, int seatId)
        {
            var userId = _userManager.GetUserId(User);

            if (string.IsNullOrEmpty(userId))
                return RedirectToAction("Login", "Account");

            var reservation = await _db.Reservations.FirstOrDefaultAsync(r =>
                r.ScreeningId == screeningId &&
                r.SeatId == seatId &&
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
