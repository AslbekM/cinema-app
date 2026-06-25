using System.Net.Http.Json;
using System.Text.Json;

namespace tickets.Services
{
    public record FilmMetaDto(string? PosterUrl, string? Overview, string? TrailerKey);

    public interface IFilmMetaService
    {
        Task<FilmMetaDto?> GetAsync(string title);
    }

    /// <summary>
    /// Fetches poster / overview / trailer from TMDB. Returns null when no
    /// Tmdb:ApiKey is configured, so the app falls back to its bundled data.
    /// </summary>
    public class TmdbService : IFilmMetaService
    {
        private readonly HttpClient _http;
        private readonly string? _key;
        private readonly ILogger<TmdbService> _logger;

        public TmdbService(HttpClient http, IConfiguration config, ILogger<TmdbService> logger)
        {
            _http = http;
            _key = config["Tmdb:ApiKey"];
            _logger = logger;
        }

        public async Task<FilmMetaDto?> GetAsync(string title)
        {
            if (string.IsNullOrWhiteSpace(_key) || string.IsNullOrWhiteSpace(title)) return null;

            try
            {
                var search = await _http.GetFromJsonAsync<JsonElement>(
                    $"https://api.themoviedb.org/3/search/movie?api_key={_key}&query={Uri.EscapeDataString(title)}");
                var results = search.GetProperty("results");
                if (results.GetArrayLength() == 0) return null;

                var movie = results[0];
                var id = movie.GetProperty("id").GetInt32();

                string? poster = movie.TryGetProperty("poster_path", out var p) && p.ValueKind == JsonValueKind.String
                    ? $"https://image.tmdb.org/t/p/w500{p.GetString()}"
                    : null;
                string? overview = movie.TryGetProperty("overview", out var o) ? o.GetString() : null;

                string? trailer = null;
                var videos = await _http.GetFromJsonAsync<JsonElement>(
                    $"https://api.themoviedb.org/3/movie/{id}/videos?api_key={_key}");
                foreach (var v in videos.GetProperty("results").EnumerateArray())
                {
                    if (v.GetProperty("site").GetString() == "YouTube" &&
                        v.GetProperty("type").GetString() == "Trailer")
                    {
                        trailer = v.GetProperty("key").GetString();
                        break;
                    }
                }

                return new FilmMetaDto(poster, overview, trailer);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "TMDB lookup failed for {Title}", title);
                return null;
            }
        }
    }
}
