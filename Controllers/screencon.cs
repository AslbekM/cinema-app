using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using tickets.Data;
using tickets.Models;
using tickets.ViewModels;

namespace tickets.Controllers
{
    public class ScreeningsController : Controller
    {
        private readonly AppDb _db;

        public ScreeningsController(AppDb db)
        {
            _db = db;
        }

        public async Task<IActionResult> Index()
        {
            var screenings = await _db.Screenings
                .Include(s => s.Cinema)
                .OrderBy(s => s.StartTime)
                .ToListAsync();

            return View(screenings);
        }

        public async Task<IActionResult> Details(int id)
        {
            var screening = await _db.Screenings
                .Include(s => s.Cinema)
                .ThenInclude(c => c!.Seats)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (screening == null)
                return NotFound();

            var reservations = await _db.Reservations
                .Where(r => r.ScreeningId == id)
                .ToListAsync();

            var userId = User.Identity?.IsAuthenticated == true
                ? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                : null;

            var model = new ScreeningSeatsVm
            {
                ScreeningId = screening.Id,
                FilmTitle = screening.FilmTitle,
                StartTime = screening.StartTime,
                CinemaName = screening.Cinema?.Name ?? "",
                Seats = screening.Cinema?.Seats.OrderBy(s => s.RowNumber).ThenBy(s => s.SeatNumber).ToList() ?? new(),
                ReservedSeatIds = reservations.Select(r => r.SeatId).ToHashSet(),
                MySeatIds = reservations.Where(r => r.AppUserId == userId).Select(r => r.SeatId).ToHashSet(),
                IsLoggedIn = User.Identity?.IsAuthenticated ?? false
            };

            return View(model);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> Create()
        {
            ViewBag.Cinemas = new SelectList(await _db.Cinemas.ToListAsync(), "Id", "Name");
            return View();
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(Screening screening)
        {
            if (!ModelState.IsValid)
            {
                ViewBag.Cinemas = new SelectList(await _db.Cinemas.ToListAsync(), "Id", "Name");
                return View(screening);
            }

            _db.Screenings.Add(screening);
            await _db.SaveChangesAsync();

            return RedirectToAction(nameof(Index));
        }

        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> Delete(int id)
        {
            var screening = await _db.Screenings
                .Include(s => s.Cinema)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (screening == null)
                return NotFound();

            return View(screening);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            var screening = await _db.Screenings.FindAsync(id);

            if (screening == null)
                return NotFound();

            _db.Screenings.Remove(screening);
            await _db.SaveChangesAsync();

            return RedirectToAction(nameof(Index));
        }
    }
}
