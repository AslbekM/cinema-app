using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using tickets.Data;
using tickets.Models;

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

        [HttpGet]
        public async Task<IActionResult> Create()
        {
            ViewBag.Cinemas = new SelectList(await _db.Cinemas.ToListAsync(), "Id", "Name");
            return View();
        }

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