using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using tickets.Data;
using tickets.Models;

namespace tickets.Controllers.Api
{
    [ApiController]
    [Route("api/reviews")]
    public class ReviewsApiController : ControllerBase
    {
        private readonly AppDb _db;
        private readonly UserManager<AppUser> _userManager;

        public ReviewsApiController(AppDb db, UserManager<AppUser> userManager)
        {
            _db = db;
            _userManager = userManager;
        }

        [HttpGet("{filmTitle}")]
        public async Task<IActionResult> Get(string filmTitle)
        {
            var reviews = await _db.Reviews
                .Where(r => r.FilmTitle == filmTitle)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            var userId = _userManager.GetUserId(User);

            // A user may review a film they have a reservation for.
            var canReview = userId != null && await _db.Reservations
                .Include(r => r.Screening)
                .AnyAsync(r => r.AppUserId == userId && r.Screening!.FilmTitle == filmTitle);

            var myReview = userId == null ? null : reviews.FirstOrDefault(r => r.AppUserId == userId);

            return Ok(new
            {
                average = reviews.Count > 0 ? Math.Round(reviews.Average(r => r.Rating), 1) : 0,
                count = reviews.Count,
                canReview,
                myRating = myReview?.Rating,
                myComment = myReview?.Comment,
                reviews = reviews.Select(r => new
                {
                    userName = r.UserName,
                    rating = r.Rating,
                    comment = r.Comment,
                    createdAt = r.CreatedAt
                })
            });
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] ReviewRequest req)
        {
            var userId = _userManager.GetUserId(User);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            if (req.Rating < 1 || req.Rating > 5)
                return BadRequest(new[] { "Rating must be between 1 and 5." });
            if (string.IsNullOrWhiteSpace(req.FilmTitle))
                return BadRequest(new[] { "Film is required." });

            var hasBooking = await _db.Reservations
                .Include(r => r.Screening)
                .AnyAsync(r => r.AppUserId == userId && r.Screening!.FilmTitle == req.FilmTitle);
            if (!hasBooking)
                return BadRequest(new[] { "You can only review films you've booked." });

            var existing = await _db.Reviews
                .FirstOrDefaultAsync(r => r.FilmTitle == req.FilmTitle && r.AppUserId == userId);

            if (existing != null)
            {
                existing.Rating = req.Rating;
                existing.Comment = req.Comment;
                existing.CreatedAt = DateTime.UtcNow;
            }
            else
            {
                _db.Reviews.Add(new Review
                {
                    FilmTitle = req.FilmTitle,
                    AppUserId = userId,
                    UserName = User.Identity?.Name,
                    Rating = req.Rating,
                    Comment = req.Comment
                });
            }

            await _db.SaveChangesAsync();
            return Ok(new { message = "Review saved." });
        }
    }

    public class ReviewRequest
    {
        public string FilmTitle { get; set; } = string.Empty;
        public int Rating { get; set; }
        public string? Comment { get; set; }
    }
}
