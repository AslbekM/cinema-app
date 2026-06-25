using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using tickets.Services;

namespace tickets.Controllers.Api
{
    [ApiController]
    [Route("api/films")]
    public class FilmsApiController : ControllerBase
    {
        private readonly IFilmMetaService _meta;
        public FilmsApiController(IFilmMetaService meta) { _meta = meta; }

        // External film metadata (TMDB). Cached for an hour per title.
        [HttpGet("meta")]
        [OutputCache(Duration = 3600, VaryByQueryKeys = new[] { "title" })]
        public async Task<IActionResult> Meta([FromQuery] string title)
        {
            if (string.IsNullOrWhiteSpace(title)) return BadRequest();
            var m = await _meta.GetAsync(title);
            if (m == null) return Ok(new { available = false });
            return Ok(new { available = true, posterUrl = m.PosterUrl, overview = m.Overview, trailerKey = m.TrailerKey });
        }
    }
}
