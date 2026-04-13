using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using tickets.Data;
using tickets.Models;

namespace tickets.Controllers
{
    public class HomeController : Controller
    {
        private readonly AppDb _db;

        public HomeController(AppDb db)
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

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}