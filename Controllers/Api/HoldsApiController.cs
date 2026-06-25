using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using tickets.Data;
using tickets.Models;

namespace tickets.Controllers.Api
{
    [ApiController]
    [Route("api/holds")]
    [Authorize]
    public class HoldsApiController : ControllerBase
    {
        private static readonly TimeSpan HoldDuration = TimeSpan.FromMinutes(5);
        private readonly AppDb _db;
        private readonly UserManager<AppUser> _userManager;

        public HoldsApiController(AppDb db, UserManager<AppUser> userManager)
        {
            _db = db;
            _userManager = userManager;
        }

        // Hold the given seats for this user for a few minutes.
        [HttpPost]
        public async Task<IActionResult> Hold([FromBody] HoldRequest req)
        {
            var userId = _userManager.GetUserId(User);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            var now = DateTime.UtcNow;

            // Clean up expired holds and this user's previous holds for this screening.
            _db.SeatHolds.RemoveRange(_db.SeatHolds.Where(h =>
                h.ExpiresAt < now || (h.AppUserId == userId && h.ScreeningId == req.ScreeningId)));
            await _db.SaveChangesAsync();

            var reserved = await _db.Reservations
                .Where(r => r.ScreeningId == req.ScreeningId)
                .Select(r => r.SeatId).ToListAsync();
            var heldByOthers = await _db.SeatHolds
                .Where(h => h.ScreeningId == req.ScreeningId && h.ExpiresAt > now)
                .Select(h => h.SeatId).ToListAsync();
            var unavailable = reserved.Concat(heldByOthers).ToHashSet();

            var conflicts = req.SeatIds.Where(s => unavailable.Contains(s)).ToList();
            if (conflicts.Count > 0)
                return Conflict(new { message = "Some seats were just taken.", seatIds = conflicts });

            var expiresAt = now.Add(HoldDuration);
            foreach (var seatId in req.SeatIds.Distinct())
                _db.SeatHolds.Add(new SeatHold { ScreeningId = req.ScreeningId, SeatId = seatId, AppUserId = userId, ExpiresAt = expiresAt });
            await _db.SaveChangesAsync();

            return Ok(new { expiresAt });
        }

        // Release this user's holds for a screening (checkout cancelled / timed out).
        [HttpDelete("{screeningId:int}")]
        public async Task<IActionResult> Release(int screeningId)
        {
            var userId = _userManager.GetUserId(User);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            _db.SeatHolds.RemoveRange(_db.SeatHolds.Where(h => h.AppUserId == userId && h.ScreeningId == screeningId));
            await _db.SaveChangesAsync();
            return Ok(new { message = "Holds released." });
        }
    }

    public class HoldRequest
    {
        public int ScreeningId { get; set; }
        public List<int> SeatIds { get; set; } = new();
    }
}
